const MONTHS = [
  "1-р сар",
  "2-р сар",
  "3-р сар",
  "4-р сар",
  "5-р сар",
  "6-р сар",
  "7-р сар",
  "8-р сар",
  "9-р сар",
  "10-р сар",
  "11-р сар",
  "12-р сар",
];

function toDate(value: Date | string): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "2026 оны 9-р сарын 15" */
export function formatDate(value: Date | string) {
  const date = toDate(value);
  if (!date) return "";

  return `${date.getFullYear()} оны ${MONTHS[date.getMonth()]}ын ${date.getDate()}`;
}

/**
 * `date` баганаас ирсэн "2026-09-15" мөрд зориулав. `new Date("2026-09-15")`
 * нь UTC шөнө дунд гэж уншдаг тул баруун цагийн бүсэд өдөр нэгээр ухардаг —
 * тиймээс мөрийг өөрийг нь задална.
 */
export function formatDateOnly(value: string | null) {
  if (!value) return "";

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;

  return `${year} оны ${MONTHS[month - 1]}ын ${day}`;
}

/** Жагсаалтад багтаах богино хэлбэр: "2026.09.15" */
export function formatShortDate(value: Date | string) {
  const date = toDate(value);
  if (!date) return "";

  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}.${month}.${day}`;
}

/** Захиалгын жагсаалтад — огноо ба цаг */
export function formatDateTime(value: Date | string) {
  const date = toDate(value);
  if (!date) return "";

  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${formatShortDate(date)} ${hours}:${minutes}`;
}

/** <time datetime="..."> шинжид зориулав */
export function toIsoDate(value: Date | string) {
  return toDate(value)?.toISOString() ?? "";
}

/**
 * "120,000₮". Мянгатын тусгаарлагчийг гараар тавив — `toLocaleString("mn-MN")`
 * нь Node болон хөтөч дээр өөр өөр үр дүн өгдөг тул сервер/клиентийн
 * зурагдалт зөрж, hydration-ы анхааруулга гаргадаг.
 */
export function formatPrice(value: number) {
  return `${formatNumber(value)}₮`;
}

export function formatNumber(value: number) {
  const sign = value < 0 ? "-" : "";
  const digits = Math.abs(Math.round(value)).toString();
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function truncate(text: string, max = 140) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

/** Ойролцоогоор уншихад зарцуулах хугацаа — минутаар */
export function readingMinutes(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 170));
}

/**
 * Зураг байхгүй үед тухайн төрлийн загвар ковер. Санамсаргүй биш — нэг зүйл
 * үргэлж ижил зурагтай байна.
 */
export function fallbackCover(kind: string) {
  switch (kind) {
    case "course":
      return "/covers/surgalt.svg";
    case "bichleg":
      return "/covers/bichleg.svg";
    case "hereglel":
      return "/covers/hereglel.svg";
    case "nom":
      return "/covers/nom.svg";
    case "beleg":
      return "/covers/beleg.svg";
    default:
      return "/covers/medee.svg";
  }
}

const CYRILLIC_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z",
  и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", ө: "o", п: "p",
  р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f", х: "h", ц: "ts", ч: "ch",
  ш: "sh", щ: "sh", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

/** Монгол гарчгаас URL-д тохирох латин slug гаргана */
export function slugify(value: string) {
  const latin = value
    .toLowerCase()
    .split("")
    .map((char) => (char in CYRILLIC_MAP ? CYRILLIC_MAP[char] : char))
    .join("");

  return (
    latin
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "hesg"
  );
}
