"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ruleById, worstSeverity, type Severity } from "@/lib/site/mongolRules";
import {
  convertText,
  rememberToli,
  type Certainty,
  type TextToken,
} from "@/lib/site/mongolText";

/**
 * Албан бичгийн хөрвүүлэгч. Зүүн талд кирилл, баруун талд монгол бичиг —
 * хоёулаа зэрэг харагдана.
 *
 * Гол шийдэл нь **итгэлцлийг нуухгүй** байх. Хөрвүүлэлт гурван түвшинтэй:
 * багш нягталсан, толинд байгаа ч нягтлаагүй, огт олдоогүй. Гурвыг нь ялгаж
 * харуулбал хүн юуг шалгах ёстойгоо шууд мэднэ. Бүгдийг ижил өнгөөр гаргах нь
 * найдвартай мэт сэтгэгдэл төрүүлэх учир алдаа руу хөтөлнө.
 */

const SAMPLE = `Монгол Улсын Засгийн газрын 2026 оны 8 дугаар сарын 20-ны өдрийн
145 дугаар тогтоолыг үндэслэн дараах тушаалыг гаргав.

Нэг. Байгууллагын дүрмийг хавсралтаар баталсугай.
Хоёр. Тушаалын хэрэгжилтэд хяналт тавьж ажиллахыг хэлтсийн даргад даалгав.`;

/** Тэмдэглэгээний өнгө — зөвхөн итгэлцэл эргэлзээтэй үед л будна */
const MARK: Record<Certainty, string> = {
  verified: "",
  // Их тайлбар толь бол эрдэм шинжилгээний эх сурвалж — ноороггоос итгэлтэй,
  // гэхдээ нөхцөл залгалт нь дүрмээр хийгддэг тул огт тэмдэглэхгүй бол
  // болохгүй. Нимгэн тасархай зураас: «шалгасан ч эцсийн биш».
  toli: "underline decoration-dotted decoration-gold-500/25 underline-offset-4",
  draft:
    "underline decoration-dotted decoration-gold-500/50 underline-offset-4",
  guess:
    "text-seal-600 underline decoration-dotted decoration-seal-500/70 underline-offset-4 dark:text-seal-400",
};

/**
 * ДҮРМИЙН ЗӨРЧЛИЙН ТЭМДЭГ — долгион зураас.
 *
 * Бусад тэмдэглэгээ («тааварласан», «толиос») нь ЭХ СУРВАЛЖийг заадаг бол
 * энэ нь өөр төрлийн мэдээлэл: эх сурвалж нь юу ч бай, гарсан бичлэг өөрөө
 * дүрэм зөрчиж байна. Тиймээс дүрс нь ялгаатай — толгой нь тодорхойгүй биш,
 * бичлэг нь эргэлзээтэй гэдгийг хэлнэ.
 */
const ISSUE_MARK: Record<Severity, string> = {
  error: "underline decoration-wavy decoration-seal-500 underline-offset-[6px]",
  warn: "underline decoration-wavy decoration-seal-500/55 underline-offset-[6px]",
  info: "underline decoration-wavy decoration-brand-900/25 underline-offset-[6px] dark:decoration-ivory-100/25",
};

export default function TextConverter() {
  const [input, setInput] = useState("");
  const [mongolianDigits, setMongolianDigits] = useState(true);
  const [marks, setMarks] = useState(true);
  const [copied, setCopied] = useState(false);
  /**
   * `rememberToli` нь модулийн кэшийг өөрчилдөг — React үүнийг мэдэхгүй тул
   * дахин тооцоолуулах дохиог өөрсдөө өгнө.
   */
  const [toliVersion, setToliVersion] = useState(0);
  /**
   * Омонимд хүн гараар сонгосон бичлэг: кирилл язгуур → сонгодог бичлэг.
   *
   * Толинд 1535 үг олон бичлэгтэй бөгөөд алийг нь сонгохыг УТГА шийднэ:
   * «сар» нь ᠰᠠᠷᠠᠨ (тэнгэрийн бие) ч, ᠰᠠᠷ᠎ᠠ (хугацаа) ч байна. Машин мэдэх
   * аргагүй тул сонголтыг хүнд үлдээв — эрэмбэ нь зөвхөн санал.
   */
  const [choices, setChoices] = useState<Record<string, string>>({});

  const result = useMemo(
    () => convertText(input, { mongolianDigits, choices }),
    // `toliVersion` нь модулийн кэш өөрчлөгдсөнийг л мэдэгдэнэ —
    // `convertText` түүнийг дотроосоо уншина. Линт үүнийг «илүүц» гэж
    // үзнэ: гаднаас нь харахад ашиглагдаагүй хувьсагч.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input, mongolianDigits, choices, toliVersion],
  );

  /**
   * Бичвэрт орсон олон бичлэгтэй язгуурууд, язгуур тутамд нэг мөр.
   * Нэг сонголт бичвэр даяар үйлчилнэ — нэг бичвэрт «сар» хоёр өөр утгаар
   * орох нь ховор, харин үг бүрээр тусад нь сонгуулах нь ажлыг үржүүлнэ.
   */
  const ambiguous = useMemo(() => {
    const byStem = new Map<string, { variants: string[]; sample: string }>();
    for (const token of result.tokens) {
      if (!token.stem || !token.variants) continue;
      if (!byStem.has(token.stem)) {
        byStem.set(token.stem, {
          variants: token.variants,
          sample: token.source,
        });
      }
    }
    return [...byStem.entries()];
  }, [result.tokens]);

  /**
   * Зөрчлийг ДҮРМЭЭР нь бүлэглэнэ, үгээр нь биш.
   *
   * Нэг дүрэм олон үгэнд зэрэг зөрчигдөх нь энгийн зүйл («ᠣ хоёр дахь үед»
   * гэдэг нь бичвэр даяар давтагдана). Үг тус бүрээр жагсаавал жагсаалт нь
   * уншигдахаа болино; дүрмээр нь бүлэглэвэл хүн НЭГ л зүйл ойлгоод бүх
   * тохиолдлыг нь нэг дор хардаг.
   */
  const ruleReport = useMemo(() => {
    const byRule = new Map<
      string,
      { severity: Severity; words: Set<string> }
    >();

    for (const token of result.tokens) {
      for (const issue of token.issues ?? []) {
        const entry = byRule.get(issue.rule) ?? {
          severity: issue.severity,
          words: new Set<string>(),
        };
        entry.words.add(token.source);
        byRule.set(issue.rule, entry);
      }
    }

    const order: Severity[] = ["error", "warn", "info"];
    return [...byRule.entries()].sort(
      (a, b) =>
        order.indexOf(a[1].severity) - order.indexOf(b[1].severity) ||
        b[1].words.size - a[1].words.size,
    );
  }, [result.tokens]);

  /**
   * Толинд олдоогүй үгсийг Их тайлбар толиос нөхнө.
   *
   * ⚠ Хамгийн том эрсдэл нь ТӨГСГӨЛГҮЙ ДАВТАЛТ: сервер үгийг олохгүй бол тэр
   * үг `unknown`-д үлдэнэ → эффект дахин асна → дахин асууна. Тиймээс асуусан
   * бүх үгийг `asked` дотор тэмдэглээд, дахин хэзээ ч асуухгүй. Олдоогүй нь ч
   * «асуусан» гэж тооцогдоно — энэ нь санаатай.
   */
  const asked = useRef<Set<string>>(new Set());

  useEffect(() => {
    // ⚠ `unknown` биш `lookups`. `unknown` нь хүнд үзүүлэх гадаад хэлбэр
    // («хэрэгжилтэд»), харин толинд зөвхөн толгой үг байдаг («хэрэгжилт»).
    // Гадаад хэлбэрээр асуувал хариу бараг үргэлж хоосон ирнэ.
    const missing = result.lookups
      .map((word) => word.toLowerCase())
      .filter((word) => !asked.current.has(word));
    if (missing.length === 0) return;

    for (const word of missing) asked.current.add(word);

    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch("/api/toli", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ words: missing }),
          signal: controller.signal,
        });
        if (!response.ok) return;
        const { found, variants } = (await response.json()) as {
          found?: Record<string, string>;
          variants?: Record<string, string[]>;
        };
        if (found && Object.keys(found).length > 0) {
          rememberToli(found, variants);
          setToliVersion((version) => version + 1);
        }
      } catch {
        // Сүлжээ тасарсан ч хөрвүүлэгч ажилласаар байх ёстой — багцад суусан
        // толь нь бие даан хангалттай. Чимээгүй бууна.
      }
    })();

    return () => controller.abort();
  }, [result.lookups]);

  async function copy() {
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div>
      {/* --- Оролт ба гаралт ---------------------------------------------- */}
      <div className="grid gap-px bg-[color:var(--line)] lg:grid-cols-2">
        <div className="bg-[color:var(--surface)] p-6 sm:p-7">
          <label htmlFor="cyrillic" className="field-label">
            Кирилл бичвэр
          </label>
          <textarea
            id="cyrillic"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={16}
            spellCheck={false}
            placeholder="Албан бичгийн эх бичвэрээ энд буулгана уу…"
            className="field resize-y font-mono text-[0.88rem] leading-7"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setInput(SAMPLE)}
              className="btn-quiet"
            >
              Жишээ оруулах
            </button>
            <button
              type="button"
              onClick={() => setInput("")}
              disabled={!input}
              className="btn-quiet"
            >
              Цэвэрлэх
            </button>
          </div>
        </div>

        <div className="bg-[color:var(--surface)] p-6 sm:p-7">
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <span className="field-label mb-0">Монгол бичиг</span>
            <button
              type="button"
              onClick={copy}
              disabled={!result.text.trim()}
              className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-700 transition hover:text-gold-500 disabled:opacity-40 dark:text-gold-300"
            >
              {copied ? "Хуулагдлаа" : "Хуулах"}
            </button>
          </div>

          {/*
            Босоо бичиг өндрөө өөрөө тогтоож чадахгүй — багана нь тодорхой
            өндөртэй байж байж мөр таслана. Урт бичвэр баруун тийш үргэлжилнэ.
          */}
          <div
            lang="mn-Mong"
            className="hairline h-[26rem] overflow-x-auto overflow-y-hidden border p-5"
          >
            {result.text.trim() ? (
              <p className="mongol whitespace-pre-wrap text-[1.45rem] leading-[1.6] text-brand-950 dark:text-ivory-50">
                {result.tokens.map((token, index) => (
                  <TokenSpan key={index} token={token} marks={marks} />
                ))}
              </p>
            ) : (
              <p className="text-[0.85rem] text-brand-900/40 dark:text-ivory-100/35">
                Зүүн талд бичвэрээ оруулмагц энд монгол бичгээр гарна.
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-5">
            <Toggle
              checked={mongolianDigits}
              onChange={setMongolianDigits}
              label="Монгол цифр"
            />
            <Toggle checked={marks} onChange={setMarks} label="Тэмдэглэгээ" />
          </div>
        </div>
      </div>

      {/* --- Тайлан -------------------------------------------------------- */}
      {result.words > 0 && (
        <div className="hairline mt-px border-x border-b p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.82rem] text-brand-900/72 dark:text-ivory-100/66">
            <span>
              Нийт <strong className="font-semibold">{result.words}</strong> үг
            </span>
            <Legend
              className="bg-gold-600 dark:bg-gold-400"
              label={`Нягталсан ${result.verified}`}
            />
            {result.toli > 0 && (
              <Legend
                className="bg-gold-500/70"
                label={`Их тайлбар толь ${result.toli}`}
              />
            )}
            <Legend
              className="bg-gold-500/45"
              label={`Ноорог ${result.draft}`}
            />
            <Legend
              className="bg-seal-500"
              label={`Тааварласан ${result.unknown.length}`}
            />
            {result.flagged > 0 && (
              <Legend
                className="bg-seal-600"
                label={`Дүрэм зөрчсөн ${result.flagged}`}
              />
            )}
          </div>

          {ambiguous.length > 0 && (
            <div className="mt-5">
              <p className="text-[0.85rem] leading-7 text-brand-900/72 dark:text-ivory-100/66">
                Доорх үг толинд{" "}
                <strong className="font-semibold">нэгээс олон бичлэгтэй</strong>{" "}
                — аль нь болохыг утга нь шийднэ. «Сар» нь ᠰᠠᠷᠠᠨ (тэнгэрийн
                бие) ч, ᠰᠠᠷ᠎ᠠ (хугацаа) ч байж болно. Зөвийг нь сонгоно уу —
                нөхцөл нь ч хамт өөрчлөгдөнө.
              </p>
              <ul className="mt-3 space-y-2.5">
                {ambiguous.map(([stem, { variants, sample }]) => (
                  <li
                    key={stem}
                    className="flex flex-wrap items-center gap-x-3 gap-y-2"
                  >
                    <span
                      className="text-[0.82rem] text-brand-900/72 dark:text-ivory-100/66"
                      title={sample}
                    >
                      {stem}
                    </span>
                    <span className="flex flex-wrap gap-1.5">
                      {variants.map((variant) => {
                        const active =
                          (choices[stem] ?? variants[0]) === variant;
                        return (
                          <button
                            key={variant}
                            type="button"
                            lang="mn-Mong"
                            aria-pressed={active}
                            onClick={() =>
                              setChoices((previous) => ({
                                ...previous,
                                [stem]: variant,
                              }))
                            }
                            className={`border px-2.5 py-1 text-[1.05rem] leading-none transition ${
                              active
                                ? "border-gold-500 text-gold-700 dark:text-gold-300"
                                : "border-[color:var(--line)] text-brand-900/55 hover:border-gold-500/50 dark:text-ivory-100/50"
                            }`}
                          >
                            {variant}
                          </button>
                        );
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ruleReport.length > 0 && (
            <div className="mt-5">
              <p className="text-[0.85rem] leading-7 text-brand-900/72 dark:text-ivory-100/66">
                Гарсан бичлэг{" "}
                <strong className="font-semibold">
                  зөв бичих зүйн дүрэм зөрчиж
                </strong>{" "}
                байна. Дүрэм бүр Их тайлбар толийн 59873 бичлэг дээр
                хэмжигдсэн — хажууд нь тэр харьцааг үзүүлэв. Толиос ирсэн
                бичлэг ч зөрчилтэй байж болно; эцсийн шийдийг багш гаргана.
              </p>
              <ul className="mt-3 space-y-4">
                {ruleReport.map(([id, { severity, words }]) => {
                  const rule = ruleById(id);
                  if (!rule) return null;

                  return (
                    <li key={id}>
                      <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                        <span
                          aria-hidden
                          className={`h-2 w-2 shrink-0 self-center ${
                            severity === "error"
                              ? "bg-seal-600"
                              : severity === "warn"
                                ? "bg-seal-500/60"
                                : "bg-brand-900/25 dark:bg-ivory-100/25"
                          }`}
                        />
                        <strong className="text-[0.85rem] font-semibold text-brand-950 dark:text-ivory-50">
                          {rule.title}
                        </strong>
                        <span className="text-[0.72rem] text-brand-900/45 dark:text-ivory-100/40">
                          {words.size} үг · {rule.evidence}
                        </span>
                      </p>
                      <p className="mt-1.5 text-[0.82rem] leading-7 text-brand-900/72 dark:text-ivory-100/66">
                        {rule.detail}
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {[...words].slice(0, 24).map((word) => (
                          <li
                            key={word}
                            className="chip border-seal-500/40 text-seal-600 dark:text-seal-400"
                          >
                            {word}
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {result.unknown.length > 0 && (
            <div className="mt-5">
              <p className="text-[0.85rem] leading-7 text-brand-900/72 dark:text-ivory-100/66">
                Доорх үгс толинд алга — дуудлагаар нь буулгасан тул{" "}
                <strong className="font-semibold">сонгодог бичлэг байх
                баталгаагүй</strong>. Албан бичиг хэвлэгдэж, гарын үсэг
                зурагддаг тул эдгээрийг багшаар нягтлуулна уу.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {result.unknown.map((word) => (
                  <li
                    key={word}
                    className="chip border-seal-500/40 text-seal-600 dark:text-seal-400"
                  >
                    {word}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Олон бичлэгтэй үгийн тэмдэг — тасархай биш ТАСРАЛТГҮЙ зураас.
 *
 * Бусад тэмдэглэгээ «энэ нь буруу байж магадгүй» гэсэн утгатай бол энэ нь
 * «энд ХОЁР зөв хариулт бий, аль нь болохыг чи мэднэ» гэсэн өөр төрлийн
 * дохио. Тиймээс дүрс нь ч өөр байх ёстой.
 */
const AMBIGUOUS_MARK =
  "underline decoration-gold-600/60 decoration-2 underline-offset-4";

/**
 * Нэг тэмдэгтийн бүлэг. Үгээс бусад нь (зай, цэг таслал, мөр таслалт) ямар ч
 * тэмдэглэгээгүй — тэднийг будах нь бичвэрийг эрээн болгоно.
 */
function TokenSpan({ token, marks }: { token: TextToken; marks: boolean }) {
  const ambiguous = Boolean(token.variants);
  // Дүрмийн зөрчил нь итгэлцлээс ХҮНД дохио — толиос ирсэн үг ч тэмдэглэгдэнэ.
  const severity = worstSeverity(token.issues ?? []);
  const plain =
    !ambiguous && !severity && (!token.certainty || token.certainty === "verified");

  if (!marks || plain) {
    return <>{token.text}</>;
  }

  const source = ambiguous
    ? `${token.source} — толинд ${token.variants!.length} бичлэгтэй`
    : `${token.source}${token.suffix ? ` (${token.stem} + ${token.suffix})` : ""}`;

  // Хоёр тэмдэглэгээ давхарлана: доогуур зураас нь ЭХ СУРВАЛЖ, долгион нь
  // ДҮРЭМ. Нэг үг «толиос ирсэн ч дүрэм зөрчсөн» байж болох тул хоёулаа
  // харагдах ёстой.
  const className = [
    ambiguous ? AMBIGUOUS_MARK : MARK[token.certainty ?? "guess"],
    severity ? ISSUE_MARK[severity] : "",
  ]
    .filter(Boolean)
    .join(" ");

  const title = severity
    ? `${source} — ${[...new Set((token.issues ?? []).map((issue) => issue.title))].join(", ")}`
    : source;

  return (
    <span className={className} title={title}>
      {token.text}
    </span>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden className={`h-2 w-2 shrink-0 ${className}`} />
      {label}
    </span>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[0.75rem] text-brand-900/72 dark:text-ivory-100/66">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-3.5 w-3.5 border-[color:var(--line)] bg-transparent text-gold-500 focus:ring-0 focus:ring-offset-0"
      />
      {label}
    </label>
  );
}
