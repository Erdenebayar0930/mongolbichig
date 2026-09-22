/**
 * Монгол бичгийн цагаан толгой — аажуухан гүйдэг зурвас. Сайтад орсон хүн
 * үсгүүдийг нь нэг харчихдаг байх нь энэ сайтын гол зорилготой нийцнэ:
 * бичиг эхлээд танил болж, дараа нь сурах хүсэл төрдөг.
 *
 * Хөдөлгөөн нь CSS дээр (`.ticker-track`), тиймээс клиент компонент хэрэггүй.
 * Хулгана дээр нь очиход зогсоно; хөдөлгөөн багасгах тохиргоотой хэрэглэгчид
 * бүр эхнээсээ зогссон харагдана.
 */

/** Үсэг бүр монгол бичгийн тусгаар хэлбэр ба кирилл дүйцэл */
const LETTERS = [
  { mn: "ᠠ", cy: "а" },
  { mn: "ᠡ", cy: "э" },
  { mn: "ᠢ", cy: "и" },
  { mn: "ᠣ", cy: "о" },
  { mn: "ᠤ", cy: "у" },
  { mn: "ᠥ", cy: "ө" },
  { mn: "ᠦ", cy: "ү" },
  { mn: "ᠨ", cy: "н" },
  { mn: "ᠪ", cy: "б" },
  { mn: "ᠫ", cy: "п" },
  { mn: "ᠬ", cy: "х" },
  { mn: "ᠭ", cy: "г" },
  { mn: "ᠮ", cy: "м" },
  { mn: "ᠯ", cy: "л" },
  { mn: "ᠰ", cy: "с" },
  { mn: "ᠱ", cy: "ш" },
  { mn: "ᠲ", cy: "т" },
  { mn: "ᠳ", cy: "д" },
  { mn: "ᠴ", cy: "ч" },
  { mn: "ᠵ", cy: "ж" },
  { mn: "ᠶ", cy: "й" },
  { mn: "ᠷ", cy: "р" },
  { mn: "ᠸ", cy: "в" },
  { mn: "ᠹ", cy: "ф" },
  { mn: "ᠺ", cy: "к" },
  { mn: "ᠼ", cy: "ц" },
  { mn: "ᠽ", cy: "з" },
];

export default function AlphabetTicker() {
  return (
    <section className="surface ticker-viewport relative overflow-hidden">
      <h2 className="sr-only">Монгол бичгийн цагаан толгой</h2>

      {/*
        Гүйлт тасралтгүй харагдахын тулд жагсаалтыг хоёр дахин бичиж, замыг
        нь яг хагасаар нь ухраадаг (`-50%`). Тиймээс хоёр хуулбар үргэлж
        адилхан байх ёстой.
      */}
      <div aria-hidden className="ticker-track flex w-max items-end gap-7 px-6 py-5 sm:gap-9">
        {[...LETTERS, ...LETTERS].map((letter, index) => (
          <span
            key={`${letter.cy}-${index}`}
            className="flex w-7 shrink-0 flex-col items-center gap-2.5"
          >
            <span className="mongol text-[1.45rem] leading-none text-brand-800/85 dark:text-ivory-100/75">
              {letter.mn}
            </span>
            <span className="text-[0.6rem] uppercase tracking-[0.12em] text-brand-900/45 dark:text-ivory-100/40">
              {letter.cy}
            </span>
          </span>
        ))}
      </div>

      {/* Хоёр ирмэг рүү уусгана — эс бөгөөс үсэг хайрцгийн ирмэг дээр огтлогдож,
          гүйлт нь дуусаад дахин эхэлж байгаа нь илт мэдэгдэнэ. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-[color:var(--surface)] to-[color:var(--surface-0)]"
      />
      <span
        aria-hidden
        className="fade-surface-l pointer-events-none absolute inset-y-0 right-0 w-14"
      />
    </section>
  );
}
