/**
 * Сайтын засварлагддаг бичвэрүүд. Кодод биш DB-д сууна — эзэн нь админаас
 * утсаа солиход, нүүр хуудасны амлалтаа өөрчлөхөд хөгжүүлэгч хэрэггүй байх
 * ёстой.
 *
 * `defaults` нь DB хоосон байх үед (эсвэл унтарсан үед) хуудас хоосон
 * харагдахаас сэргийлнэ.
 *
 * ## Шинэ талбар нэмэх
 *
 * Гурван газарт нэмнэ: `SETTING_KEYS`, `SETTING_LABELS`, `DEFAULT_SETTINGS`.
 * Урт бичвэр бол `SETTING_MULTILINE`-д, харьяалагдах бүлгээ `SETTING_GROUPS`-д
 * мөн бич. Админы маягт эдгээрээс АВТОМАТААР үүсдэг тул UI засах шаардлагагүй.
 *
 * ⚠ `SETTING_GROUPS`-д бүртгээгүй түлхүүр админд ХАРАГДАХГҮЙ — доорх
 * `assertEveryKeyGrouped` шалгалт үүнийг ачаалах үед барина.
 */
export const SETTING_KEYS = [
  // Холбоо барих
  "phone",
  "phone2",
  "email",
  "address",
  "facebook",
  "workingHours",
  // Худалдаа
  "bankAccount",
  "shippingFee",
  "freeShippingFrom",
  // Нүүр хуудас
  "heroQuote",
  "heroQuoteAuthor",
  "promise1Title",
  "promise1Body",
  "promise2Title",
  "promise2Body",
  "promise3Title",
  "promise3Body",
  "nerTitle",
  "nerBody",
  "contactTitle",
  "contactBody",
  // Бидний тухай
  "aboutText",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];
export type Settings = Record<SettingKey, string>;

export const SETTING_LABELS: Record<SettingKey, string> = {
  phone: "Утас",
  phone2: "Нэмэлт утас",
  email: "И-мэйл",
  address: "Хаяг",
  facebook: "Facebook хуудас",
  workingHours: "Ажиллах цаг",
  bankAccount: "Дансны мэдээлэл",
  shippingFee: "Хүргэлтийн хураамж (₮)",
  freeShippingFrom: "Үнэгүй хүргэлтийн доод дүн (₮)",
  heroQuote: "Нүүрний ишлэл",
  heroQuoteAuthor: "Ишлэлийн эзэн",
  promise1Title: "1-р амлалт — гарчиг",
  promise1Body: "1-р амлалт — тайлбар",
  promise2Title: "2-р амлалт — гарчиг",
  promise2Body: "2-р амлалт — тайлбар",
  promise3Title: "3-р амлалт — гарчиг",
  promise3Body: "3-р амлалт — тайлбар",
  nerTitle: "Нэрийн бичлэг — гарчиг",
  nerBody: "Нэрийн бичлэг — тайлбар",
  contactTitle: "Холбоо барих уриалга — гарчиг",
  contactBody: "Холбоо барих уриалга — тайлбар",
  aboutText: "Бидний тухай (товч)",
};

/** Урт бичвэр шаардлагатай талбарууд — админд textarea болж гарна */
export const SETTING_MULTILINE: SettingKey[] = [
  "bankAccount",
  "aboutText",
  "heroQuote",
  "promise1Body",
  "promise2Body",
  "promise3Body",
  "nerBody",
  "contactBody",
];

/**
 * Админы маягтын бүлэглэл. Талбар 22 болсон тул нэг жагсаалтад цуглуулбал
 * эзэн нь хайж олохоо больдог — юу хаана харагддагаар нь бүлэглэв.
 */
export const SETTING_GROUPS: {
  title: string;
  hint: string;
  keys: SettingKey[];
}[] = [
  {
    title: "Холбоо барих",
    hint: "Хөл хэсэг, «Бидний тухай», захиалгын хуудсанд харагдана.",
    keys: ["phone", "phone2", "email", "address", "facebook", "workingHours"],
  },
  {
    title: "Худалдаа",
    hint: "Сагс болон захиалгын дүн бодоход ашиглагдана.",
    keys: ["bankAccount", "shippingFee", "freeShippingFrom"],
  },
  {
    title: "Нүүр хуудас",
    hint: "Нүүр хуудсан дээрх ишлэл, гурван амлалт, уриалгын бичвэрүүд.",
    keys: [
      "heroQuote",
      "heroQuoteAuthor",
      "promise1Title",
      "promise1Body",
      "promise2Title",
      "promise2Body",
      "promise3Title",
      "promise3Body",
      "nerTitle",
      "nerBody",
      "contactTitle",
      "contactBody",
    ],
  },
  {
    title: "Бидний тухай",
    hint: "`/tuhai` хуудасны танилцуулга.",
    keys: ["aboutText"],
  },
];

export const DEFAULT_SETTINGS: Settings = {
  phone: "9911-2233",
  phone2: "",
  email: "info@uranbichleg.mn",
  address: "Улаанбаатар хот, Сүхбаатар дүүрэг",
  facebook: "https://www.facebook.com/UranbichlegMongolowsoyol",
  workingHours: "Даваа–Баасан 10:00–19:00, Бямба 11:00–16:00",
  bankAccount: "Хаан банк · 5000 1234 5678 · Уран бичлэг ХХК",
  shippingFee: "5000",
  freeShippingFrom: "150000",
  heroQuote:
    "Бичиг үсэг бол үндэстний оюун санааны тамга — бийрийн үзүүрт өв уламжлал амьдарна.",
  heroQuoteAuthor: "Монгол уран бичлэгийн уламжлал",
  promise1Title: "Үндсээс нь",
  promise1Body:
    "Толгой үсгээс эхлээд үг холбох, цэг таслал хүртэл дараалалтай. Өмнөх мэдлэг шаардахгүй.",
  promise2Title: "Бийрийн доор",
  promise2Body:
    "Уран бичлэг бол зөвхөн үсэг биш — амьсгал, шугамын хэмнэл. Багштайгаа нүүр тулан суралцана.",
  promise3Title: "Гартаа үлдэнэ",
  promise3Body:
    "Захиалгат бүтээл, бийр бэх, гарын авлагыг сургалтын дараа ч ашиглаж, бэлэг болгоно.",
  nerTitle: "Нэрээ монгол бичгээр бичүүлээд аваарай",
  nerBody:
    "Нэрээ бичихэд сайт монгол бичигт хөрвүүлж, цаас, бэх, тамгатай бэлэн загвар болгож харуулна. Зургийг нь тэр дор нь татаж авна. Монгол, гадаад нэр аль аль нь болно.",
  contactTitle: "Асуух зүйл байна уу?",
  contactBody:
    "Сургалтын хуваарь, захиалгат бүтээлийн хэмжээ, үнийн талаар утсаар эсвэл Facebook хуудсаар шууд холбогдоорой.",
  aboutText:
    "Бид монгол бичгийг өдөр тутмын хэрэглээ болгох, уран бичлэгийн урлагийг залуу үедээ өвлүүлэх зорилготой сургалт, бүтээлийн студи юм.",
};

/**
 * Бүлэглэлээс гээгдсэн түлхүүр байвал ачаалах үед л барина.
 *
 * Ийм алдаа нь чимээгүй: түлхүүр нь ажиллаж, хуудсанд харагдаж байх боловч
 * админ түүнийг ХЭЗЭЭ Ч засаж чадахгүй. Хожим олоход хэцүү тул одоо унана.
 */
function assertEveryKeyGrouped() {
  const grouped = new Set(SETTING_GROUPS.flatMap((group) => group.keys));
  const missing = SETTING_KEYS.filter((key) => !grouped.has(key));
  if (missing.length > 0) {
    throw new Error(
      `SETTING_GROUPS-д дараах түлхүүр бүртгэгдээгүй тул админд харагдахгүй: ${missing.join(", ")}`,
    );
  }
}

assertEveryKeyGrouped();

/** Тохиргооны мөр утгыг бүхэл тоо болгоно — хоосон, буруу бол `fallback` */
export function settingNumber(value: string, fallback: number) {
  const parsed = Number.parseInt(value.replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}
