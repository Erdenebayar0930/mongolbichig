import type { Metadata } from "next";
import Link from "next/link";

import PageHeader from "@/components/site/PageHeader";
import SectionHeading from "@/components/site/SectionHeading";
import {
  TOLI_LETTERS,
  toliByLetter,
  toliCount,
  toliLookup,
  type ToliEntry,
} from "@/lib/site/queries";

export const metadata: Metadata = {
  title: "Толь бичиг",
  description:
    "Кирилл үгийн уламжлалт монгол бичгийн сонгодог бичлэгийг хараарай. «Монгол хэлний их тайлбар толь»-оос хураасан жар мянга орчим үг.",
  keywords: [
    "монгол бичгийн толь",
    "кирилл монгол бичиг хөрвүүлэх",
    "сонгодог бичлэг",
    "их тайлбар толь",
    "mongolian script dictionary",
  ],
};

/** Нэг хуудсанд хэдэн үг — босоо бичиг өндөр эзэлдэг тул хэт олон нь болохгүй. */
const PER_PAGE = 60;

/**
 * Толь бичиг.
 *
 * Хоёр горимтой бөгөөд аль нь ажиллахыг URL шийднэ:
 *
 *   /toli?q=монгол   — хайлт: яг таарсан нь дээрээ, ураг төрлийн үгс доор нь
 *   /toli?useg=м     — нэгжих: тухайн үсгээр эхэлсэн бүх үг, хуудаслалттай
 *
 * Хайлтгүй үед «а» үсгийг үзүүлнэ — хоосон дэлгэц гэдэг нь хэрэглэгчид юу
 * хийхээ хэлж өгдөггүй. Толь нээмэгц үг харагдаж байвал эргэлдэж эхэлнэ.
 */
export default async function ToliPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; useg?: string; h?: string }>;
}) {
  const params = await searchParams;
  const term = (params.q ?? "").trim();
  const page = Math.max(0, Number.parseInt(params.h ?? "0", 10) || 0);

  // Хайлт байвал үсгийн горимыг бүрэн орхино — хоёуланг зэрэг үзүүлбэл
  // алийг нь хараад байгаа нь ойлгомжгүй болно.
  const letter = term
    ? ""
    : TOLI_LETTERS.includes(
          (params.useg ?? "").trim().toLowerCase() as (typeof TOLI_LETTERS)[number]
        )
      ? (params.useg ?? "").trim().toLowerCase()
      : "а";

  const [lookup, browse, total] = await Promise.all([
    term ? toliLookup(term) : Promise.resolve({ exact: [], similar: [] }),
    letter
      ? toliByLetter(letter, page, PER_PAGE)
      : Promise.resolve({ entries: [], total: 0 }),
    toliCount(),
  ]);

  const pages = Math.ceil(browse.total / PER_PAGE);
  const nothing = term && lookup.exact.length === 0 && lookup.similar.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <PageHeader
        mongol="ᠲᠣᠯᠢ"
        eyebrow="Их тайлбар толь"
        title="Толь бичиг"
        lead={
          total > 0
            ? `Кирилл үгийн сонгодог монгол бичлэгийг хараарай. Толинд ${total.toLocaleString("mn-MN")} бичлэг байна.`
            : "Кирилл үгийн сонгодог монгол бичлэгийг хараарай."
        }
      />

      <form
        action="/toli"
        role="search"
        className="mx-auto mt-10 flex max-w-xl items-center gap-4"
      >
        <label htmlFor="toli-q" className="sr-only">
          Хайх үг
        </label>
        <input
          id="toli-q"
          name="q"
          type="search"
          defaultValue={term}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          placeholder="Кирилл үгээ бичнэ үү…"
          className="field"
        />
        <button type="submit" className="btn-gold shrink-0">
          Хайх
        </button>
      </form>

      <AlphabetStrip active={letter} />

      {/* --- Хайлтын үр дүн ------------------------------------------------ */}
      {lookup.exact.length > 0 ? (
        <section className="mt-14">
          <SectionHeading title={`«${term}»`} as="h2" />
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {lookup.exact.map((entry) => (
              <WordCard key={entry.ugId} entry={entry} featured />
            ))}
          </ul>

          {lookup.exact.length > 1 ? (
            <p className="mt-6 text-[0.82rem] leading-7 text-brand-900/62 dark:text-ivory-100/56">
              Энэ кирилл үг толинд{" "}
              <strong className="font-semibold">{lookup.exact.length}</strong>{" "}
              бичлэгтэй байна — өөр өөр утгатай омоним үгс. Эхнийх нь эх толинд
              түрүүлж бүртгэгдсэн, ерөнхийдөө үндсэн утга нь.
            </p>
          ) : null}
        </section>
      ) : null}

      {lookup.similar.length > 0 ? (
        <section className="mt-14">
          <SectionHeading
            title={
              lookup.exact.length > 0
                ? "Мөн ийм угтвартай"
                : `«${term}»-аар эхэлсэн үгс`
            }
            as="h2"
          />
          <ul className="grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {lookup.similar.map((entry) => (
              <WordCard key={entry.ugId} entry={entry} />
            ))}
          </ul>
        </section>
      ) : null}

      {nothing ? (
        <div className="mt-16 border border-dashed border-gold-500/30 p-14 text-center">
          <p className="text-[0.85rem] uppercase tracking-[0.16em] text-brand-900/55 dark:text-ivory-100/50">
            «{term}» толинд алга
          </p>
          <p className="mx-auto mt-5 max-w-md text-[0.85rem] leading-7 text-brand-900/62 dark:text-ivory-100/56">
            Толь нь толгой үгсийг бүртгэдэг тул нөхцөл залгасан хэлбэр
            (жишээ нь «улсын») олдохгүй байж болно. Урсгал бичвэр хөрвүүлэх бол{" "}
            <Link
              href="/horvuulegch"
              className="text-gold-700 underline decoration-gold-500/40 underline-offset-4 transition-colors hover:text-gold-600 dark:text-gold-300"
            >
              хөрвүүлэгчийг
            </Link>{" "}
            ашиглаарай — тэр нь язгуурыг нь салгаж хайдаг.
          </p>
        </div>
      ) : null}

      {/* --- Үсгээр нэгжих -------------------------------------------------- */}
      {letter && browse.entries.length > 0 ? (
        <section className="mt-14">
          <SectionHeading
            title={`${letter.toUpperCase()} үсэг`}
            href="/horvuulegch"
            hrefLabel="Хөрвүүлэгч"
            as="h2"
          />
          <p className="mb-8 text-[0.72rem] uppercase tracking-[0.18em] text-brand-900/55 dark:text-ivory-100/50">
            {browse.total.toLocaleString("mn-MN")} үг · {page + 1}/{pages} хуудас
          </p>

          <ul className="grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {browse.entries.map((entry) => (
              <WordCard key={entry.ugId} entry={entry} />
            ))}
          </ul>

          <Pager letter={letter} page={page} pages={pages} />
        </section>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Үсгийн зурвас. Толь бичгийн хажуугийн ховил шиг — нээмэгц хаанаас эхлэхээ
 * мэдэх зам.
 */
function AlphabetStrip({ active }: { active: string }) {
  return (
    <nav
      aria-label="Үсгээр нэгжих"
      className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-1.5"
    >
      {TOLI_LETTERS.map((letter) => (
        <Link
          key={letter}
          href={`/toli?useg=${encodeURIComponent(letter)}`}
          aria-current={letter === active ? "page" : undefined}
          className={`grid h-8 w-8 place-items-center border text-[0.82rem] transition duration-300 ${
            letter === active
              ? "border-gold-500 bg-gold-500 font-semibold text-brand-950"
              : "border-brand-900/12 text-brand-900/70 hover:border-gold-500/60 hover:text-gold-700 dark:border-ivory-100/12 dark:text-ivory-100/65 dark:hover:text-gold-300"
          }`}
        >
          {letter.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}

/**
 * Нэг үгийн хөрөг.
 *
 * Босоо бичиг өөрөө өндрөө тогтоож чаддаггүй (`writing-mode: vertical-lr` нь
 * блокийн өндрийг өгөгдсөн гэж үздэг) тул сав нь ТОДОРХОЙ өндөртэй байх ёстой
 * — эс бөгөөс нурж, ганц мөр болж хавчуулагдана.
 */
function WordCard({
  entry,
  featured = false,
}: {
  entry: ToliEntry;
  featured?: boolean;
}) {
  return (
    <li className="hairline group border p-5 text-center transition-colors duration-300 hover:border-gold-500/50">
      <div
        lang="mn-Mong"
        className={`flex items-start justify-center overflow-hidden ${
          featured ? "h-52" : "h-36"
        }`}
      >
        <span
          className={`mongol leading-none text-brand-950 dark:text-ivory-50 ${
            featured ? "text-[2.1rem]" : "text-[1.45rem]"
          }`}
        >
          {entry.mongol}
        </span>
      </div>

      <p
        className={`mt-4 text-brand-900/78 dark:text-ivory-100/72 ${
          featured ? "text-[1.05rem] font-medium" : "text-[0.85rem]"
        }`}
      >
        {entry.cyrillic}
      </p>

      {/*
        Эх толь руу буцах зам. `ug_id` нь mongoltoli.mn дахь бичлэгийн дугаар —
        утга, жишээ өгүүлбэрийг нь тэндээс уншина. Бид зөвхөн бичлэгийг нь
        хураасан тул тайлбарыг эх сурвалжид нь үлдээх нь зөв.
      */}
      <a
        href={`https://mongoltoli.mn/search.php?opt=1&ug_id=${entry.ugId}`}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="mt-2 inline-block text-[0.6rem] uppercase tracking-[0.16em] text-brand-900/40 opacity-0 transition duration-300 focus-visible:opacity-100 group-hover:opacity-100 hover:text-gold-600 dark:text-ivory-100/38 dark:hover:text-gold-300"
      >
        Утгыг нь үзэх →
      </a>
    </li>
  );
}

/** Өмнөх / дараах хуудас. Дугаар бүрийг жагсаавал 40 холбоос болно. */
function Pager({
  letter,
  page,
  pages,
}: {
  letter: string;
  page: number;
  pages: number;
}) {
  if (pages <= 1) return null;

  const href = (n: number) =>
    `/toli?useg=${encodeURIComponent(letter)}${n > 0 ? `&h=${n}` : ""}`;

  return (
    <nav
      aria-label="Хуудаслалт"
      className="mt-12 flex items-center justify-center gap-4"
    >
      {page > 0 ? (
        <Link href={href(page - 1)} className="btn-quiet">
          ← Өмнөх
        </Link>
      ) : (
        <span className="btn-quiet pointer-events-none opacity-35">← Өмнөх</span>
      )}

      <span className="text-[0.72rem] uppercase tracking-[0.18em] text-brand-900/55 dark:text-ivory-100/50">
        {page + 1} / {pages}
      </span>

      {page + 1 < pages ? (
        <Link href={href(page + 1)} className="btn-quiet">
          Дараах →
        </Link>
      ) : (
        <span className="btn-quiet pointer-events-none opacity-35">Дараах →</span>
      )}
    </nav>
  );
}
