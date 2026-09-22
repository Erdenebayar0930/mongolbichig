"""
mongoltoli.mn-ээс кирилл ↔ монгол бичгийн хосыг хурааж авна.

  python scripts/fetch-mongoltoli.py index          # толгой үгсийн жагсаалт
  python scripts/fetch-mongoltoli.py detail --limit 500
  python scripts/fetch-mongoltoli.py build          # → mongolLexicon-ий хэлбэр

ЯАГААД ХОЁР ШАТ ВЭ

`browsepage.php` нь 98 үг/хуудсаар (ug_id, кирилл) хосыг хямдхан өгдөг ч
**монгол бичгийг өгөхгүй**. Түүнийг зөвхөн `search.php?ug_id=N` дэлгэрэнгүй
хуудаснаас, үг тутамд нэг хүсэлтээр авна. Тиймээс:

  1. `index`  — бүх толгой үгийг цуглуулна (~1,500 хүсэлт)
  2. `detail` — сонгосон үгсийн монгол бичгийг авна (үг тутамд 1 хүсэлт)

ХЭМЖЭЭНИЙ САНАМЖ (хэмжсэн)

Индекс: 60,718 толгой үг (308 үсгийн бүлэг, 1,451 хуудас).

Дэлгэрэнгүй нь үг тутамд нэг хүсэлт. Бодит хурд нь миний 0.4 сек завсарлагаар
бус, СЕРВЕРИЙН хариугаар тодорхойлогддог: хэмжихэд ~2.1 сек/үг гарсан
(45 секундэд 21 хүсэлт) — өөрөөр хэлбэл 60,718 үг ≈ 36 цаг.

Тиймээс `detail` нь тасалдсан газраасаа үргэлжилдэг байхаар зохиогдсон:
JSONL нь нэмэгддэг, аль хэдийн авсан ug_id-г алгасна, түүхий HTML кэшлэгдэнэ.
Нэг дор дуустал ажиллуулах шаардлагагүй.

ЭЕЛДЭГ БАЙХ

Сервер нь Apache 2.2 — хуучин, жижиг. robots.txt байхгүй (404) ч энэ нь зөвшөөрөл
биш. Тиймээс: нэг урсгал, хүсэлт хооронд завсарлагатай, түүхий HTML-ийг дискэнд
кэшлэнэ (дахин ажиллуулахад сүлжээнд огт хүрэхгүй), тасарвал үргэлжилнэ.
"""

import argparse
import concurrent.futures
import gzip
import html as H
import json
import re
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

# Windows дээр stdout-ыг файл руу чиглүүлэхэд Python нь cp1252 сонгож, кирилл
# болон монгол бичиг хэвлэхэд UnicodeEncodeError-оор унана. PYTHONIOENCODING
# тохируулахыг дуудагчаас шаардахын оронд энд албадана.
for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".cache" / "mongoltoli"
DATA = ROOT / "scripts" / "data"
INDEX_FILE = DATA / "mongoltoli-index.jsonl"
DETAIL_FILE = DATA / "mongoltoli-words.jsonl"

BASE = "https://mongoltoli.mn"
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)
# Хүсэлт ЭХЛЭХ хоорондын доод завсар — урсгалын тоо хэдэн ч байсан баримтална.
# Өөрөөр хэлбэл энэ нь нийт хурдны дээд хязгаар: 0.4 сек → 2.5 хүсэлт/сек.
DELAY = 0.4
# Завсарлагааг хуваарилах цорын ганц цэг. Түгжээг БАРЬЖ БАЙЖ унтдаг тул
# хүсэлтүүдийн эхлэл цэг нь DELAY-ээр зайлшгүй тусгаарлагдана; бодит HTTP
# ажил нь түгжээнээс гадна, өөрөөр хэлбэл зэрэгцээ явна.
NET_LOCK = threading.Lock()
RETRIES = 4  # нэг хаяг дээрх оролдлогын тоо (3, 6, 12 сек ухралттай)
# Дараалан ийм олон үг унавал сервер унасан гэж үзэж, цэвэрхэн зогсоно.
# Аль хэдийн авсан үг JSONL дээр үлдэх тул дараа үргэлжлүүлж болно.
MAX_CONSECUTIVE_FAILURES = 25
# browsepage.php нэг хуудсанд 98 холбоос өгдөг. Түүнээс цөөн ирсэн нь тухайн
# үсгийн сүүлийн хуудас гэсэн үг — хуудаслалтыг зогсоох дохио.
PAGE_FULL = 90

# Монгол бичгийн хэлбэр нь зөвхөн энэ нуугдмал input дотор байна.
RE_UIGARJIN = re.compile(r'id="uigarjin_tolgoi_useg_input"[^>]*value="([^"]*)"')
RE_BROWSE = re.compile(r'ug_id=(\d+)[^"\'>]*word=([^"\'&<>]+)')
# Монгол бичгийн муж + FVS/MVS + монгол бичигт хэрэглэгддэг зайнууд
RE_MONGOL_OK = re.compile(r'^[᠀-᢯ ‍\s]+$')


def cache_path(url: str) -> Path:
    key = re.sub(r"[^A-Za-z0-9]+", "_", url.replace(BASE, ""))[:120]
    return CACHE / f"{key}.html.gz"


def get(url: str, session: dict) -> str:
    """Кэшнээс уншина, байхгүй бол татаад кэшилнэ."""
    path = cache_path(url)
    if path.exists():
        with NET_LOCK:
            session["cached"] += 1
        with gzip.open(path, "rt", encoding="utf-8") as f:
            return f.read()

    # Сүүлийн сүлжээний хүсэлтээс хойш завсарлага барина.
    with NET_LOCK:
        elapsed = time.monotonic() - session["last"]
        if elapsed < DELAY:
            time.sleep(DELAY - elapsed)
        session["last"] = time.monotonic()

    req = urllib.request.Request(url, headers={"User-Agent": UA})
    # Сервер ачаалал ихсэхэд HTTP 500-г түр зуур буцаадаг нь батлагдсан
    # (унасан ug_id-г дараа нь дангаар нь дуудахад 200 өгсөн). Тиймээс
    # 5xx-ийг «энэ бичлэг эвдэрхий» биш, «дараа оролд» гэж үзнэ.
    for attempt in range(RETRIES):
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                body = r.read().decode("utf-8", "replace")
            break
        except (urllib.error.URLError, TimeoutError) as e:
            if attempt == RETRIES - 1:
                raise
            # Экспоненциал ухралт: сервер амьсгаа авах зай өгнө. Тогтмол
            # богино завсарлагаар дахин цохих нь байдлыг улам дордуулна.
            wait = 3 * (2**attempt)
            print(f"  {e} → {wait} сек хүлээгээд дахин "
                  f"({attempt + 2}/{RETRIES})", file=sys.stderr)
            time.sleep(wait)
    with NET_LOCK:
        session["fetched"] += 1

    path.parent.mkdir(parents=True, exist_ok=True)
    with gzip.open(path, "wt", encoding="utf-8") as f:
        f.write(body)
    return body


def load_jsonl(path: Path) -> list:
    if not path.exists():
        return []
    with path.open(encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def append_jsonl(path: Path, rows: list) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


# --- 1. Индекс -------------------------------------------------------------


def cmd_index(args, session):
    """letter.php → browsepage.php → (ug_id, кирилл) бүх хос."""
    letters = get(f"{BASE}/letter.php", session)
    prefixes = sorted({
        urllib.parse.unquote(m.group(1))
        for m in re.finditer(r"browsepage\.php\?zuil_useg=([^\"'&<>]+)", letters)
    })
    print(f"үсгийн бүлэг: {len(prefixes)}")

    known = {row["id"] for row in load_jsonl(INDEX_FILE)}
    print(f"аль хэдийн бүртгэгдсэн: {len(known)}")

    for n, prefix in enumerate(prefixes, 1):
        page = 1
        while True:
            url = (f"{BASE}/browsepage.php?zuil_useg="
                   f"{urllib.parse.quote(prefix)}&page={page}")
            body = get(url, session)
            found = {}
            for m in RE_BROWSE.finditer(body):
                ug = int(m.group(1))
                word = H.unescape(urllib.parse.unquote(m.group(2))).strip()
                if word:
                    found[ug] = word
            fresh = [{"id": k, "cyrillic": v} for k, v in found.items()
                     if k not in known]
            if fresh:
                append_jsonl(INDEX_FILE, fresh)
                known.update(r["id"] for r in fresh)
            print(f"[{n}/{len(prefixes)}] {prefix} х.{page}: "
                  f"{len(found)} үг, шинэ {len(fresh)} (нийт {len(known)})")
            # ⚠ «Шинэ үг алга» гэдгээр ЗОГСООЖ БОЛОХГҮЙ. Дахин ажиллуулахад
            # эхний хуудсууд кэшнээс ирж, бүгд аль хэдийн бүртгэгдсэн байдаг
            # тул fresh=0 гарч, гүнзгий хуудсууд руу огт хүрэхгүй үлддэг.
            # (Ингэж «ба» бүлэг 3 хуудсан дээр таслагдаж, 4-8-р хуудсан дахь
            #  олон зуун үг индекст ороогүй.)
            #
            # Зогсох цорын ганц зөв дохио нь хуудас өөрөө дүүрэн эсэх:
            # дүүрэн хуудас 98 холбоос өгдөг, сүүлийнх нь дутуу, түүнээс
            # цааш зөвхөн 1 орчим тэнэмэл холбоос үлддэг.
            if len(found) < PAGE_FULL or page >= args.max_pages:
                break
            page += 1


# --- 2. Дэлгэрэнгүй --------------------------------------------------------


def parse_detail(body: str, ug_id: int, cyrillic: str) -> dict | None:
    """
    Дэлгэрэнгүй хуудаснаас ЗӨВХӨН монгол бичгийн хэлбэрийг авна.

    Кирилл толгой үгийг хуудаснаас уншихыг оролдох хэрэггүй — индекс дээр
    аль хэдийн байгаа. (Эхний хувилбар хуудасны өөрийн рүү заасан холбоосоос
    уншдаг байсан нь бүх бичлэгийг чимээгүйхэн алгасахад хүргэсэн: `&word=`
    параметргүй хүсэхэд тэр холбоос `ug_id=N&opt=1&word=X` дараалалтай болдог
    бөгөөд regex нь `opt=1` эхэлсэн хэлбэрийг л хайдаг байв.)

    Хоосон/байхгүй ug_id-д сервер 200 буцаадаг ч `uigarjin` талбар байхгүй —
    түүнийг л «бичлэг алга» гэсэн дохио болгож ашиглана.
    """
    uig = RE_UIGARJIN.search(body)
    if not uig:
        return None
    mongol = H.unescape(uig.group(1)).strip()
    if not mongol or not RE_MONGOL_OK.match(mongol):
        return None
    return {"id": ug_id, "cyrillic": cyrillic, "mongol": mongol}


def cmd_detail(args, session):
    index = load_jsonl(INDEX_FILE)
    if not index:
        sys.exit("Индекс хоосон — эхлээд `index` дэд командыг ажиллуул.")

    done = {row["id"] for row in load_jsonl(DETAIL_FILE)}
    todo = [r for r in index if r["id"] not in done]

    if args.single_word:
        # Олон үгт хэлц, зүйр цэцэн үг нь язгуурын толинд хэрэггүй.
        todo = [r for r in todo if " " not in r["cyrillic"]]
    todo.sort(key=lambda r: r["id"])
    todo = todo[: args.limit]

    workers = max(1, args.workers)
    print(f"индекс {len(index)} · татсан {len(done)} · энэ удаа {len(todo)}"
          f" · {workers} урсгал")
    started = time.monotonic()

    # ⚠ Урсгалуудын хооронд ХУВААЛЦДАГ төлөв — зөвхөн `lock` дор хүрнэ.
    # (Сүлжээний завсарлага нь тусдаа NET_LOCK-той; энэ нь бүртгэл, бичилт.)
    st = {"n": 0, "skipped": 0, "failed": 0, "streak": 0, "buf": []}
    lock = threading.Lock()
    # Сервер унасан үед бүх урсгалыг зогсоох дохио. Executor-ыг дундуур
    # таслах боломжгүй тул үлдсэн ажлууд шууд буцаж, хоосон гүйж дуусна.
    stop = threading.Event()

    def report(n):
        rate = n / max(0.001, time.monotonic() - started)
        eta = (len(todo) - n) / rate / 3600 if rate > 0 else 0
        print(f"  {n}/{len(todo)}  алгассан {st['skipped']}  "
              f"унасан {st['failed']}  {rate:.1f} үг/сек  үлдсэн ~{eta:.1f}ц")

    def work(row):
        if stop.is_set():
            return
        # ⚠ Нэг үгийн алдаа БҮХ ажлыг унагаах ЁСГҮЙ. Эхний хувилбар алдааг
        # дээш шидэж, 37 цагийн ажил 2%-дээ түр зуурын HTTP 500-аас болж
        # зогссон. Унасан үг зүгээр л JSONL-д бичигдэхгүй тул дараагийн
        # ажиллуулалт түүнийг өөрөө дахин авна — тусад нь бүртгэх хэрэггүй.
        try:
            body = get(f"{BASE}/search.php?opt=1&ug_id={row['id']}", session)
        except Exception as e:  # сүлжээ, HTTP, кодчилол — юу ч бай, үргэлжилнэ
            with lock:
                st["failed"] += 1
                st["streak"] += 1
                st["n"] += 1
                print(f"  ✗ ug_id={row['id']} ({row['cyrillic']}): {e}",
                      file=sys.stderr)
                if st["streak"] >= MAX_CONSECUTIVE_FAILURES and not stop.is_set():
                    print(f"\nДараалан {st['streak']} удаа унасан — сервер "
                          f"унасан бололтой. Зогсоов. Дараа `detail`-ыг дахин "
                          f"ажиллуулахад үлдсэнээс нь үргэлжилнэ.",
                          file=sys.stderr)
                    stop.set()
            return

        parsed = parse_detail(body, row["id"], row["cyrillic"])
        with lock:
            st["streak"] = 0
            st["n"] += 1
            if parsed:
                st["buf"].append(parsed)
                # Багцлан бичих нь диск рүү хандахыг цөөлнө. Хэрэв дундуур
                # тасарвал багц дахь үгс алдагдана — гэхдээ тэдгээрийн HTML
                # кэшэнд байгаа тул дахин ажиллуулахад сүлжээнд хүрэхгүйгээр
                # агшин зуур сэргэнэ.
                if len(st["buf"]) >= 25:
                    append_jsonl(DETAIL_FILE, st["buf"])
                    st["buf"] = []
            else:
                st["skipped"] += 1
            if st["n"] % 25 == 0 or st["n"] == len(todo):
                report(st["n"])

    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        try:
            list(pool.map(work, todo))
        except KeyboardInterrupt:
            stop.set()
            raise

    if st["buf"]:
        append_jsonl(DETAIL_FILE, st["buf"])
    if st["failed"]:
        print(f"\n{st['failed']} үг татагдсангүй — дахин ажиллуулахад "
              f"автоматаар дахин оролдоно.")


# --- 3. Гаралт -------------------------------------------------------------


def cmd_build(args, session):
    """JSONL → mongolLexicon.ts-тэй нийцтэй TS хэсэг."""
    rows = load_jsonl(DETAIL_FILE)
    if not rows:
        sys.exit("Дата хоосон — эхлээд `detail` ажиллуул.")

    # Нэг кирилл үг олон бичлэгтэй байж болно (омоним). Хамгийн бага ug_id-г
    # авна — толинд эхэлж бүртгэгдсэн, ихэвчлэн үндсэн утга нь.
    best: dict[str, dict] = {}
    for row in rows:
        key = row["cyrillic"].strip().lower()
        if not key:
            continue
        if key not in best or row["id"] < best[key]["id"]:
            best[key] = row

    out = DATA / "mongoltoli-lexicon.ts"
    lines = [
        "/**",
        " * mongoltoli.mn-ээс хураасан кирилл → монгол бичгийн толь.",
        " * `scripts/fetch-mongoltoli.py build` үүсгэсэн — гараар бүү зас.",
        " *",
        " * ⚠ Эх сурвалж нь «Монгол хэлний их тайлбар толь» — эрдэм шинжилгээний",
        " * бүтээл. Түгээхийн өмнө ашиглах эрхээ тодруул.",
        " */",
        "",
        "export const TOLI_WORDS: Record<string, string> = {",
    ]
    for key in sorted(best):
        lines.append(f'  {json.dumps(key, ensure_ascii=False)}: '
                     f'{json.dumps(best[key]["mongol"], ensure_ascii=False)},'
                     f' // ug_id={best[key]["id"]}')
    lines += ["};", ""]
    out.write_text("\n".join(lines), encoding="utf-8")

    size = out.stat().st_size
    print(f"{out.relative_to(ROOT)}: {len(best)} үг, {size / 1024:.1f} KB")
    print(f"(давхардал арилгахын өмнө {len(rows)} бичлэг байсан)")


def main():
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest="cmd", required=True)

    pi = sub.add_parser("index", help="толгой үгсийн жагсаалт")
    pi.add_argument("--max-pages", type=int, default=200)
    pi.set_defaults(func=cmd_index)

    pd = sub.add_parser("detail", help="монгол бичгийн хэлбэрийг татах")
    pd.add_argument("--limit", type=int, default=500)
    # Хүлээлт нь серверийн хариу (~2.7 сек), тиймээс зэрэгцээ урсгал шууд
    # үржүүлнэ. Гэхдээ дээд хурдыг DELAY тогтоодог: 0.4 сек завсар =
    # 2.5 хүсэлт/сек, өөрөөр хэлбэл ~7 урсгалаас цааш нэмэх нь дэмий.
    pd.add_argument("--workers", type=int, default=1,
                    help="зэрэг явуулах хүсэлтийн тоо (үндсэн 1)")
    pd.add_argument("--single-word", action="store_true", default=True,
                    help="олон үгт хэлц, зүйр үгийг алгасах (үндсэн)")
    pd.add_argument("--all-entries", dest="single_word", action="store_false")
    pd.set_defaults(func=cmd_detail)

    pb = sub.add_parser("build", help="TS толь гаргах")
    pb.set_defaults(func=cmd_build)

    args = p.parse_args()
    session = {"last": 0.0, "fetched": 0, "cached": 0}
    args.func(args, session)
    print(f"\nсүлжээний хүсэлт {session['fetched']} · кэшнээс {session['cached']}")


if __name__ == "__main__":
    main()
