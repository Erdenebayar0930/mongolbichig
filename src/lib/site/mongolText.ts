/**
 * Урсгал кирилл бичвэрийг уламжлалт монгол бичигт хөрвүүлнэ.
 *
 * [mongolScript.ts](./mongolScript.ts) нь **нэрэнд** зориулагдсан: язгуур
 * залгаж нэр угсардаг (Ган+болд), нөхцөл гэж байдаггүй, дөрвөн үгээр
 * хязгаарладаг. Албан бичигт тэр загвар ажиллахгүй тул энэ модуль тусдаа.
 *
 * Гурван зарчим:
 *
 *   1. **Нөхцөлийг салгана.** Сонгодог бичигт тийн ялгал, олон тоо, эзэмшлийн
 *      нөхцөл нь язгуураасаа тусад нь, нарийн салаагүй зайгаар (U+202F)
 *      бичигддэг: улсын → ᠤᠯᠤᠰ ᠤᠨ. Кирилл дээр наалдсан байдаг тул таслана.
 *   2. **Нөхцлийн хэлбэрийг язгуурын СОНГОДОГ бичлэгээс сонгоно.** «сарын» нь
 *      кириллээр гийгүүлэгчээр төгссөн ч сонгодог бичлэг нь ᠰᠠᠷᠠ — эгшгээр
 *      төгсдөг тул харьяалахын нөхцөл нь ᠤᠨ биш ᠶᠢᠨ болно. Энэ учраас толь
 *      заавал хэрэгтэй: кирилл хэлбэрээс дүрмийг гаргаж чадахгүй.
 *   3. **Мэдэхгүйгээ мэдэхгүй гэж хэлнэ.** Толинд байхгүй үгийг дуудлагаар
 *      буулгаад `guess` гэж тэмдэглэнэ. Дэлгэц дээр тэдгээр нь тодорч, багш
 *      зөвхөн тэднийг нь шалгана.
 *
 * Үйл үгийн нөхцөл (-х, -в, -сан, -ж) нь бичигт **залгаа** бичигддэг тул энд
 * салгахгүй — түгээмэл үйл үгийн хэлбэрүүдийг толинд бүтнээр нь бүртгэсэн.
 */

import { WORDS, VERIFIED } from "./mongolLexicon";
import {
  BACK_VOWELS as BACK_SCRIPT_VOWELS,
  FRONT_VOWELS as FRONT_SCRIPT_VOWELS,
  NNBSP as NARROW_SPACE,
  VOWELS as SCRIPT_VOWELS,
  applyFeminineVelars,
  checkScript,
  matchFirstRounded,
  type Issue,
} from "./mongolRules";
import {
  STEMS,
  cyrillicPhonetic,
  isFrontWord,
  joinScript,
  wordHarmony,
} from "./mongolScript";

/**
 * Нарийн салаагүй зай — нөхцөлийг язгуураас салгах стандарт тэмдэгт.
 * Тодорхойлолт нь [mongolRules.ts](./mongolRules.ts)-д: шалгуур ч, буулгагч ч
 * ижил тэмдэгт барих ёстой тул нэг газар сууна.
 */
export const NNBSP = NARROW_SPACE;

/**
 * ҮГҮЙСГЭХ ҮГ. Кирилл «-гүй» нь язгуартаа наалдаж бичигддэг ч монгол бичигт
 * бие даасан үг — бүтэн зайгаар салж, ᠦᠭᠡᠶ гэж бичигдэнэ (ᠶ-ээр төгсөнө,
 * ᠢ-ээр биш).
 */
const NEGATION_CYR = "гүй";
const NEGATION = "ᠦᠭᠡᠶ";

export type Certainty =
  /** Багш нягталсан бичлэг */
  | "verified"
  /** Их тайлбар толиос ирсэн — эрдэм шинжилгээний эх сурвалж, гэхдээ энэ
   *  сайтын багш тусад нь нягтлаагүй, мөн нөхцөл залгалт нь дүрмээр хийгдсэн */
  | "toli"
  /** Толинд байгаа ч нягтлаагүй — уншигдана, баталгаа алга */
  | "draft"
  /** Толинд алга: дуудлагаар таасан */
  | "guess";

export type TokenKind = "word" | "number" | "punct" | "space" | "break";

export type TextToken = {
  kind: TokenKind;
  /** Эх кирилл хэлбэр */
  source: string;
  /** Монгол бичгийн үр дүн */
  text: string;
  certainty?: Certainty;
  /** Толиос олдсон язгуур (кириллээр) */
  stem?: string;
  /** Салгасан нөхцөл (кириллээр) */
  suffix?: string;
  /**
   * Толинд байгаа БУСАД бичлэг — зөвхөн олон бичлэгтэй үгэнд.
   *
   * 52457 толгой үгийн 1535 нь ийм. Алийг нь сонгохыг зөвхөн УТГА шийднэ:
   * «сар» нь ᠰᠠᠷᠠᠨ (тэнгэрийн бие) ч, ᠰᠠᠷ᠎ᠠ (хугацаа) ч байна. Машин
   * мэдэхгүй тул хоёуланг нь харуулж, сонголтыг хүнд үлдээнэ.
   */
  variants?: string[];
  /**
   * Зөв бичих зүйн дүрмийн зөрчил — [mongolRules.ts](./mongolRules.ts) олсон.
   *
   * ⚠ Итгэлцлээс ХАМААРАЛГҮЙ. Их тайлбар толиос ирсэн бичлэг ч зөрчилтэй
   * байж болно (толинд ᠨᠭ 89 удаа таарсан, эгшгийн зохицол зөрчсөн 296 үг
   * бий), мөн нөхцөл нь дүрмээр залгагддаг тул язгуур зөв байхад нөхцөл нь
   * зөрж мэднэ. Тиймээс шалгалт ГАРАЛТ дээр, эх сурвалжаас үл хамааран
   * ажиллана.
   */
  issues?: Issue[];
};

export type ConvertedText = {
  tokens: TextToken[];
  /** Бүтэн бичвэр — хуулж авахад */
  text: string;
  /** Нийт үгийн тоо */
  words: number;
  verified: number;
  /** Их тайлбар толиос (`/api/toli`) нөхөгдсөн үгийн тоо */
  toli: number;
  draft: number;
  /** Дүрмийн зөрчил илэрсэн ҮГИЙН тоо (зөрчлийн тоо биш — үгэнд хэд ч байж болно) */
  flagged: number;
  /** Толинд олдоогүй үгс — давхардалгүй, эх хэлбэрээр. Дэлгэцэнд харуулна. */
  unknown: string[];
  /**
   * Их тайлбар толиос асуух нэр дэвшигчид.
   *
   * ⚠ Энэ нь `unknown`-ООС ӨӨР бөгөөд ялгаа нь чухал. `unknown` нь хүнд
   * үзүүлэх ГАДААД хэлбэр («хэрэгжилтэд»), харин толь нь зөвхөн ТОЛГОЙ ҮГ
   * агуулдаг («хэрэгжилт»). Хэрэв гадаад хэлбэрээр нь асуувал бараг бүх
   * хүсэлт хоосон буцна — хөрвүүлэгч 54 мянган үгтэй толийг хажуудаа
   * тавьчихаад дуудлагаар таасаар байх болно.
   *
   * Тиймээс энд нөхцөл тайлах явцад ТУРШИГДААД олдоогүй язгуурууд орно.
   * Эхэнд нь шууд задралын үр дүн, араас нь унасан эгшиг сэргээсэн таамаг
   * хувилбарууд — сервер тал таслах шаардлагатай бол утга багатайг нь эхэлж
   * хаяна.
   */
  lookups: string[];
};

/**
 * Нэг хөрвүүлэлтээс толиос асуух үгийн дээд тоо. `/api/toli` нь хүсэлт тутамд
 * 500 үг авдаг тул түүнээс хэтэрвэл сервер тал чимээгүй тасалж, аль үг нь
 * хаягдсаныг мэдэхгүй үлдэнэ. Тиймээс таслалтыг энд, дараалал нь мэдэгдэж
 * байгаа газарт хийнэ.
 */
const MAX_LOOKUPS = 500;

export type ConvertOptions = {
  /** Тоог монгол цифрээр (᠑᠒᠓) бичих эсэх. Эс бөгөөс араб цифр хэвээр. */
  mongolianDigits?: boolean;
  /**
   * Омонимд хүн гараар сонгосон бичлэг: кирилл язгуур → сонгодог бичлэг.
   * Нэг удаа сонгоход бичвэр дэх ТУХАЙН язгуурын бүх тохиолдолд үйлчилнэ —
   * нэг бичвэрт «сар» хоёр өөр утгаар орох нь ховор.
   */
  choices?: Record<string, string>;
};

/* -------------------------------------------------------------------------- */
/* Сонгодог бичлэгийн хэлбэр таних                                             */
/* -------------------------------------------------------------------------- */

/**
 * Эгшгийн багцыг [mongolRules.ts](./mongolRules.ts)-аас авна — өмнө нь энд
 * дахин бичигдсэн байсан бөгөөд хоёр хуулбар салж эхлэх эрсдэлтэй байв.
 */

/** Өгөх оршихын нөхцөл ᠲᠤ/ᠲᠦ болох гийгүүлэгчид */
const VOICELESS_FINALS = new Set(["ᠪ", "ᠭ", "ᠳ", "ᠷ", "ᠰ"]);

const NA = "ᠨ";

type Shape = {
  front: boolean;
  endsWithVowel: boolean;
  endsWithNa: boolean;
  voicelessFinal: boolean;
};

/** Язгуурын сонгодог бичлэгээс нөхцөл сонгоход хэрэгтэй шинжийг гаргана */
function shapeOf(script: string): Shape {
  let front: boolean | null = null;

  for (const char of script) {
    if (FRONT_SCRIPT_VOWELS.has(char)) {
      front = true;
      break;
    }
    if (BACK_SCRIPT_VOWELS.has(char)) {
      front = false;
      break;
    }
  }

  const last = script.slice(-1);

  return {
    // Зөвхөн ᠢ агуулсан үг (бичиг, түшиг) уламжлалаар эм зэрэгт тооцогдоно
    front: front ?? true,
    endsWithVowel: SCRIPT_VOWELS.has(last),
    endsWithNa: last === NA,
    voicelessFinal: VOICELESS_FINALS.has(last),
  };
}

/* -------------------------------------------------------------------------- */
/* Нөхцөл                                                                      */
/* -------------------------------------------------------------------------- */

type SuffixKind =
  | "gen"
  | "acc"
  | "dat"
  | "abl"
  | "ins"
  | "com"
  | "dir"
  | "refl"
  | "plural";

/**
 * Нөхцлийн сонгодог хэлбэрийг язгуурын төгсгөл ба эгшигт зохицлоор сонгоно.
 * Эдгээр нь уламжлалт хэлзүйн жишиг дүрэм — багш нягтлах ёстой гол хэсэг нь
 * толь, эдгээр дүрэм биш.
 */
const SUFFIX_FORM: Record<SuffixKind, (shape: Shape) => string> = {
  // Харьяалахын: эгшгийн ард ᠶᠢᠨ, ᠨ-ийн ард ᠤ/ᠦ, бусад гийгүүлэгчийн ард ᠤᠨ/ᠦᠨ
  gen: (s) =>
    s.endsWithVowel
      ? "ᠶᠢᠨ"
      : s.endsWithNa
        ? s.front
          ? "ᠦ"
          : "ᠤ"
        : s.front
          ? "ᠦᠨ"
          : "ᠤᠨ",

  // Заахын: эгшгийн ард ᠶᠢ, гийгүүлэгчийн ард ᠢ
  acc: (s) => (s.endsWithVowel ? "ᠶᠢ" : "ᠢ"),

  // Өгөх оршихын: ᠪ ᠭ ᠳ ᠷ ᠰ-ийн ард ᠲᠤ/ᠲᠦ, бусдын ард ᠳᠤ/ᠳᠦ
  dat: (s) =>
    s.voicelessFinal ? (s.front ? "ᠲᠦ" : "ᠲᠤ") : s.front ? "ᠳᠦ" : "ᠳᠤ",

  // Гарахын: язгуурын төгсгөлөөс үл хамаарна
  abl: (s) => (s.front ? "ᠡᠴᠡ" : "ᠠᠴᠠ"),

  // Үйлдэхийн: эгшиг ба ᠨ-ийн ард ᠪᠠᠷ/ᠪᠡᠷ, бусад гийгүүлэгчийн ард ᠢᠶᠠᠷ/ᠢᠶᠡᠷ
  ins: (s) =>
    s.endsWithVowel || s.endsWithNa
      ? s.front
        ? "ᠪᠡᠷ"
        : "ᠪᠠᠷ"
      : s.front
        ? "ᠢᠶᠡᠷ"
        : "ᠢᠶᠠᠷ",

  // Хамтрахын
  com: (s) => (s.front ? "ᠲᠡᠶᠢ" : "ᠲᠠᠶᠢ"),

  // Чиглэхийн
  dir: (s) => (s.front ? "ᠷᠦᠭᠦ" : "ᠷᠤᠭᠤ"),

  // Эзэмшлийн буцах: эгшиг ба ᠨ-ийн ард ᠪᠠᠨ/ᠪᠡᠨ, бусдын ард ᠢᠶᠠᠨ/ᠢᠶᠡᠨ
  refl: (s) =>
    s.endsWithVowel || s.endsWithNa
      ? s.front
        ? "ᠪᠡᠨ"
        : "ᠪᠠᠨ"
      : s.front
        ? "ᠢᠶᠡᠨ"
        : "ᠢᠶᠠᠨ",

  plural: (s) => (s.front ? "ᠦᠳ" : "ᠤᠳ"),
};

/** Тусгай олон тооны нөхцөл — ерөнхий дүрмээр гарахгүй тул шууд бичив */
const PLURAL_OVERRIDE: Record<string, (shape: Shape) => string> = {
  нууд: (s) => (s.front ? "ᠨᠦᠭᠦᠳ" : "ᠨᠤᠭᠤᠳ"),
  нүүд: (s) => (s.front ? "ᠨᠦᠭᠦᠳ" : "ᠨᠤᠭᠤᠳ"),
  чууд: (s) => (s.front ? "ᠴᠦᠳ" : "ᠴᠤᠳ"),
  чүүд: (s) => (s.front ? "ᠴᠦᠳ" : "ᠴᠤᠳ"),
  нар: () => "ᠨᠠᠷ",
  нэр: () => "ᠨᠠᠷ",
};

type SuffixRule = { cyr: string; kind: SuffixKind };

/** Кирилл нөхцлийн гадаргуун хэлбэрүүд. Уртаас богино руу шалгана. */
const SUFFIXES: SuffixRule[] = ([
  { cyr: "нууд", kind: "plural" },
  { cyr: "нүүд", kind: "plural" },
  { cyr: "чууд", kind: "plural" },
  { cyr: "чүүд", kind: "plural" },
  { cyr: "ууд", kind: "plural" },
  { cyr: "үүд", kind: "plural" },
  { cyr: "нар", kind: "plural" },
  { cyr: "нэр", kind: "plural" },

  // ⚠ «ны» ба «ний» БАЙХ ЁСТОЙ. Эдгээр нь эгшгээр төгссөн язгуурын дараах
  // харьяалахын хэлбэрүүд (судалгаа|ны, хөрс|ний). Тэдгээрийг орхивол
  // «судалгааны» нь «ы» гэж таслагдаад, үлдсэн «судалгаан» нь дотроо дахин
  // «н» гэж таслагдаж, харьяалахын нөхцөл ХОЁР УДАА залгагдана:
  // ᠰᠤᠳᠤᠯᠭ᠎ᠠ ᠶᠢᠨ ᠦ. Урт нь эхэлж шалгагддаг тул эдгээрийг нэмэхэд «ы»/«н»
  // хүртэл хүрэхгүй.
  { cyr: "ний", kind: "gen" },
  { cyr: "ийн", kind: "gen" },
  { cyr: "ны", kind: "gen" },
  { cyr: "ын", kind: "gen" },
  { cyr: "ий", kind: "gen" },
  { cyr: "ы", kind: "gen" },
  { cyr: "н", kind: "gen" },

  { cyr: "ийг", kind: "acc" },
  { cyr: "ыг", kind: "acc" },
  { cyr: "г", kind: "acc" },

  { cyr: "аас", kind: "abl" },
  { cyr: "ээс", kind: "abl" },
  { cyr: "оос", kind: "abl" },
  { cyr: "өөс", kind: "abl" },

  { cyr: "аар", kind: "ins" },
  { cyr: "ээр", kind: "ins" },
  { cyr: "оор", kind: "ins" },
  { cyr: "өөр", kind: "ins" },

  { cyr: "тай", kind: "com" },
  { cyr: "тэй", kind: "com" },
  { cyr: "той", kind: "com" },

  { cyr: "руу", kind: "dir" },
  { cyr: "рүү", kind: "dir" },

  { cyr: "ад", kind: "dat" },
  { cyr: "эд", kind: "dat" },
  { cyr: "од", kind: "dat" },
  { cyr: "өд", kind: "dat" },
  { cyr: "д", kind: "dat" },
  { cyr: "т", kind: "dat" },

  { cyr: "аа", kind: "refl" },
  { cyr: "ээ", kind: "refl" },
  { cyr: "оо", kind: "refl" },
  { cyr: "өө", kind: "refl" },
] satisfies SuffixRule[]).sort((a, b) => b.cyr.length - a.cyr.length);

/* -------------------------------------------------------------------------- */
/* Язгуур хайх                                                                 */
/* -------------------------------------------------------------------------- */

type Lookup = {
  script: string;
  certainty: Certainty;
  stem: string;
  variants?: string[];
};

/**
 * Кирилл язгуурыг дөрвөн эх сурвалжаас, ЭНЭ дарааллаар хайна:
 *
 *   1. `VERIFIED` — багш нүдээрээ нягталсан. Цорын ганц эцсийн эрх.
 *   2. `TOLI`     — Их тайлбар толь (54 мянган үг), `/api/toli`-оор ирнэ.
 *   3. `WORDS`    — багцад суусан 213 үг. Толь хариулах хүртэлх нөөц зам.
 *   4. `STEMS`    — нэрийн толь; энгийн үг ч («нар», «цэцэг») цөөнгүй.
 *
 * Дараалал нь санамсаргүй биш: 2, 3 хоёр хоорондоо 56 үгэнд зөрдөг бөгөөд
 * хэмжихэд эрдэм шинжилгээний эх сурвалж нь дийлэнхдээ зөв байсан.
 */
/**
 * Их тайлбар толиос (`/api/toli`) татаж авсан үгс.
 *
 * Яагаад модулийн түвшний хувьсагч вэ: `convertWord` → `lookupStem` нь гүн,
 * рекурсив дуудлагатай. Толийг параметрээр дамжуулбал долоон давхар функц
 * бүр нэмэлт аргументтай болно. Харин энэ нь **кэш** — нэг удаа татсан үг
 * хуудас сэргээх хүртэл хэвээр байх ёстой зан үйлтэй тул модульд сууж байгаа
 * нь агуулгын хувьд ч зөв.
 *
 * Сервер талд энэ нь хүсэлт хооронд хуваалцагдана. Толь өөрчлөгддөггүй,
 * хэрэглэгчийн өгөгдөл биш тул аюулгүй.
 */
const TOLI: Record<string, string> = {};

/**
 * Олон бичлэгтэй үгсийн БҮХ хувилбар. `TOLI`-д зөвхөн үндсэн нь сууна;
 * энд бүгд, эх толийн дугаараар эрэмбэлэгдсэн байдлаар.
 */
const TOLI_VARIANTS: Record<string, string[]> = {};

/** `/api/toli`-ийн хариуг кэшэд нэмнэ. Дараагийн `convertText` үүнийг олно. */
export function rememberToli(
  entries: Record<string, string>,
  variants?: Record<string, string[]>,
): void {
  for (const [cyrillic, script] of Object.entries(entries)) {
    if (cyrillic && script) TOLI[cyrillic] = script;
  }
  for (const [cyrillic, list] of Object.entries(variants ?? {})) {
    if (cyrillic && list?.length > 1) TOLI_VARIANTS[cyrillic] = list;
  }
}

/**
 * Хүний сонгосон бичлэгүүд. `convertText` ажиллах хугацаанд л утгатай —
 * `lookupStem` нь гүн рекурсив тул параметрээр дамжуулбал долоон давхар
 * функц бүр нэмэлт аргументтай болно (`TOLI` кэштэй ижил шалтгаан).
 */
let activeChoices: Record<string, string> | null = null;

/**
 * Хайгаад олдоогүй язгууруудыг цуглуулах хувин. `convertText` ажиллах бүрдээ
 * шинээр тавьж, дуусахад нь салгана — хооронд нь үлдээвэл өмнөх бичвэрийн
 * үлдэгдэл дараагийнхтай холилдоно.
 *
 * Хоёр хувин болгосон шалтгаан: `restoreDroppedVowel` нь эгшиг бүрээр туршдаг
 * тул нэг үгэнд арав гаруй хийсвэр хувилбар үүсгэдэг («газра», «газро»…).
 * Тэдгээрийг шууд задралын үр дүнтэй хольвол API-ийн 500 үгийн хязгаарыг
 * хогоор дүүргэж, жинхэнэ язгуурууд гадуур үлдэнэ.
 */
let probeDirect: Set<string> | null = null;
let probeGuessed: Set<string> | null = null;
let probingGuess = false;

function lookupStem(word: string): Lookup | null {
  // 1. Багшийн гар засвар. Их тайлбар толийг дарж чадах ЦОРЫН ГАНЦ зүйл —
  //    хүн нүдээрээ хараад «үгүй, ингэж бичнэ» гэсэн бол тэр нь эцсийнх.
  //    (`VERIFIED` одоогоор хоосон тул бодит гаралтад нөлөөгүй; багшид засах
  //    зам үлдээх үүрэгтэй.)
  if (VERIFIED.has(word)) {
    const vetted = WORDS[word] ?? STEMS[word];
    if (vetted) return { script: vetted, certainty: "verified", stem: word };
  }

  // 2. Их тайлбар толь.
  //
  // ⚠ Энэ нь өмнө нь ХАМГИЙН СҮҮЛД байсан бөгөөд «гар хийцийн толиуд энэ
  // сайтын хэрэгцээнд нягтлагдсан» гэсэн үндэслэлтэй байв. Хэмжихэд тэр
  // үндэслэл худал болов: хоёуланд байгаа 196 үгийн 56 нь зөрж, зөрсний
  // дийлэнхэд гар хийцийнх нь буруу байсан (шалгах ᠱᠠᠯᠭᠠᠬᠤ → ᠰᠢᠯᠭᠠᠬᠤ,
  // өнөөдөр ᠡᠨᠡᠷᠦᠳᠦᠷ → ᠥᠨᠦᠳᠦᠷ), 15 нь бүхэлдээ MVS (U+180E) дутуугаас
  // үүдсэн — гар хийцийн 213 үгийн НЭГД нь ч тэр тэмдэгт байхгүй байлаа.
  const fromToli = TOLI[word];
  if (fromToli) {
    const variants = TOLI_VARIANTS[word];
    // Хүн сонгосон бол түүнийг нь барина — гэхдээ толинд үнэхээр байгаа
    // бичлэг байх ёстой, эс бөгөөс хуучирсан сонголт хог оруулна.
    const chosen = activeChoices?.[word];
    // Эхний үеийн ᠣ/ᠤ, ᠥ/ᠦ-г кириллээр нь залруулна: толинд «түвшин» нь
    // ᠲᠥᠪᠰᠢᠨ («төвшин»-ий бичлэг) гэж бүртгэгдсэн байдаг.
    const script = matchFirstRounded(
      word,
      chosen && variants?.includes(chosen) ? chosen : fromToli,
    );
    return { script, certainty: "toli", stem: word, variants };
  }

  // Толийн кэшэнд алга — асуух нэр дэвшигч болгож тэмдэглэнэ.
  //
  // ⚠ Доорх нөөц толиос ОЛДСОН ч гэсэн тэмдэглэнэ. Эс бөгөөс дээрх эрэмбэ
  // утгагүй болно: `WORDS`-д байгаа үгийг толиос хэзээ ч асуухгүй бол
  // кэшэнд орохгүй, кэшэнд байхгүй бол толь дарж чадахгүй. Аль хэдийн
  // асуугаад олдоогүй үгийг дахин асуухаас дуудагч тал (`asked`) хамгаална.
  (probingGuess ? probeGuessed : probeDirect)?.add(word);

  // 3. Багцад суусан нөөц толиуд — сүлжээгүй үед, мөн толийн хариу ирэхээс
  //    өмнөх эхний зурагт хариулна. Тиймээс `draft`: уншигдана, гэхдээ толь
  //    хариулмагц дарагдаж мэднэ.
  const fromWords = WORDS[word];
  if (fromWords) {
    return { script: fromWords, certainty: "draft", stem: word };
  }

  const fromNames = STEMS[word];
  if (fromNames) {
    return { script: fromNames, certainty: "draft", stem: word };
  }

  return null;
}

/** Гүйх эгшгийн боломжит хувилбарууд. «ь» нь эгшиг биш ч адилхан унадаг. */
const FLEETING_VOWELS = ["а", "о", "э", "ө", "у", "ү", "и", "ь"];

/**
 * Нөхцөл залгахад унасан эгшгийг сэргээж толиос дахин хайна. Кирилл дээр
 * язгуур хоёр янзаар өөрчлөгддөг:
 *
 *   * **дундаа** алдана — газар → газр|ын, өдөр → өдр|ийн;
 *   * **төгсгөлдөө** алдана — байгууллага → байгууллаг|ууд, хууль → хуул|ийн.
 *
 * Тиймээс сүүлийн хоёр гийгүүлэгчийн дунд, мөн үгийн төгсгөлд эгшиг тавьж
 * хоёуланг нь туршина. Толинд таарсан хувилбар л хүчинтэй тул санамсаргүй
 * үг зохиох эрсдэлгүй.
 */
function restoreDroppedVowel(stem: string): Lookup | null {
  if (stem.length < 2) return null;

  const head = stem.slice(0, -1);
  const last = stem.slice(-1);

  // Эндээс цааш үүсэх хайлтууд бүгд ТААМАГ — олдоогүй нь «толиос асуух нь
  // зүйтэй» гэсэн үг биш, зүгээр л тухайн эгшиг таараагүй гэсэн үг.
  const outer = probingGuess;
  probingGuess = true;
  try {
    for (const vowel of FLEETING_VOWELS) {
      const inside = lookupStem(head + vowel + last);
      if (inside) return inside;

      const ending = lookupStem(stem + vowel);
      if (ending) return ending;
    }
  } finally {
    probingGuess = outer;
  }

  return null;
}

type WordResult = {
  text: string;
  certainty: Certainty;
  stem?: string;
  suffix?: string;
  variants?: string[];
};

/**
 * Нэг кирилл үгийг хөрвүүлнэ.
 *
 * Дараалал чухал: эхлээд үгийг **бүтнээр** толиос хайна — «он» гэдэг үгийг
 * «о»+«н» гэж таслах ёсгүй. Олдохгүй бол нөхцөл таслаж үзнэ, гэхдээ таслалт нь
 * үлдсэн хэсэг толинд байгаа тохиолдолд л хүчинтэй. Тиймээс «цаг» гэдэг үг
 * «ца»+«г» болж задрахгүй: «ца» толинд байхгүй.
 */
export function convertWord(word: string, depth = 0): WordResult {
  const whole = lookupStem(word);
  if (whole) {
    return {
      text: whole.script,
      certainty: whole.certainty,
      stem: whole.stem,
      variants: whole.variants,
    };
  }

  // «-гүй» нь НӨХЦӨЛ БИШ, тусдаа үг. Кирилл дээр залгаа бичигддэг ч сонгодог
  // бичигт бүтэн зайгаар салж, ᠦᠭᠡᠶ гэж бичигддэг: ажилгүй → ᠠᠵᠢᠯ ᠦᠭᠡᠶ.
  // Толин дээр «-гүй»-гээр төгссөн 1462 үгийн 1369 нь ийм салангид хэлбэртэй.
  if (word.endsWith(NEGATION_CYR) && word.length - NEGATION_CYR.length >= 2) {
    const bare = word.slice(0, -NEGATION_CYR.length);
    const found = lookupStem(bare) ?? restoreDroppedVowel(bare);

    if (found) {
      return {
        text: `${found.script} ${NEGATION}`,
        certainty: found.certainty,
        stem: found.stem,
        suffix: NEGATION_CYR,
      };
    }

    // Язгуур нь толинд алга ч «үгүй»-г салгах нь дангаараа зөв — залгаж
    // бичсэн ᠭᠦᠢ бол ямар ч тохиолдолд буруу.
    return {
      text: `${cyrillicPhonetic(bare, isFrontWord(bare))} ${NEGATION}`,
      certainty: "guess",
      suffix: NEGATION_CYR,
    };
  }

  for (const { cyr, kind } of SUFFIXES) {
    if (!word.endsWith(cyr)) continue;

    // ⚠ Үлдэх язгуур ХОЁРООС доошгүй үсэгтэй байх ёстой. Монгол үгийн язгуур
    // нэг үсэг байдаггүй ч Их тайлбар толинд «а», «о» гэх мэт ҮСГИЙН НЭР
    // толгой үгээр бүртгэгдсэн байдаг. Тэдгээрийг язгуур гэж зөвшөөрвөл
    // «оны» нь «он|ы» биш «о|ны» гэж таслагдаж ᠣ ᠶᠢᠨ болно (зөв нь ᠣᠨ ᠤ).
    if (word.length - cyr.length < 2) continue;

    const bare = word.slice(0, -cyr.length);
    const found = lookupStem(bare) ?? restoreDroppedVowel(bare);

    if (found) {
      const shape = shapeOf(found.script);
      const form =
        kind === "plural" && PLURAL_OVERRIDE[cyr]
          ? PLURAL_OVERRIDE[cyr](shape)
          : SUFFIX_FORM[kind](shape);

      return {
        text: found.script + NNBSP + form,
        certainty: found.certainty,
        stem: found.stem,
        suffix: cyr,
        variants: found.variants,
      };
    }

    // Олон тоо + тийн ялгал давхарласан бол («байгууллагууд|ын») нэг дахин
    // гүнзгийрч үзнэ. Хоёроос цааш явахгүй — задралт хэт чөлөөтэй болно.
    if (kind !== "plural" && depth === 0) {
      const inner = convertWord(bare, 1);

      // ⚠ Дотоод давхарга нь ОЛОН ТОО байх ёстой. Энэ салаа нь «олон тоо +
      // тийн ялгал»-д зориулагдсан ч дотроос нь юу ч гарахыг зөвшөөрвөл хоёр
      // тийн ялгал зэрэгцэн залгагдах онгорхой хаалга болно — нэг үг хоёр
      // тийн ялгалтай байдаггүй. Ийм алдаа бодитоор гарч байсан:
      // «судалгааны» → ᠰᠤᠳᠤᠯᠭ᠎ᠠ ᠶᠢᠨ ᠦ (харьяалах дээр харьяалах).
      const innerKind = SUFFIXES.find((r) => r.cyr === inner.suffix)?.kind;

      if (innerKind === "plural" && inner.certainty !== "guess" && inner.stem) {
        // Нөхцлийн хэлбэрийг өмнөх нөхцлийн төгсгөлөөр сонгоно: ᠤᠳ-ын ард
        // харьяалах нь ᠤᠨ болно.
        const parts = inner.text.split(NNBSP);
        const shape = shapeOf(parts[parts.length - 1]);
        const form = SUFFIX_FORM[kind](shape);

        return {
          text: inner.text + NNBSP + form,
          certainty: inner.certainty,
          stem: inner.stem,
          suffix: `${inner.suffix ?? ""}+${cyr}`,
        };
      }
    }
  }

  // Нийлмэл үг — бүтнээрээ толинд алга ч хэсгүүд нь бий.
  const compound = splitCompound(word);
  if (compound) return compound;

  // Толинд алга — дуудлагаар. Уншигдана, сонгодог бичлэг байх баталгаагүй.
  return { text: cyrillicPhonetic(word, isFrontWord(word)), certainty: "guess" };
}

/** Хамгийн сул нь — нийлмэл үгийн баталгаа нь сул хэсгээрээ хэмжигдэнэ */
const CERTAINTY_ORDER: Certainty[] = ["guess", "draft", "toli", "verified"];

function weakest(a: Certainty, b: Certainty): Certainty {
  return CERTAINTY_ORDER.indexOf(a) <= CERTAINTY_ORDER.indexOf(b) ? a : b;
}

/**
 * НИЙЛМЭЛ ҮГИЙГ ХОЁР ЯЗГУУРТ ЗАДАЛНА.
 *
 * «Түвшинсайхан» толинд бүтнээрээ байхгүй тул дуудлагаар буудаг байв — тэгэхэд
 * «түвши**н**сайхан» доторх ᠨ нь ᠰ-ийн өмнө ᠩ болж ᠲᠦᠪᠰᠢ**ᠩ**ᠰᠠᠶᠢᠬᠠᠨ гарч
 * байлаа. Гэтэл тэр ᠨ нь «түвшин» гэдэг хэсгээ ТӨГСГӨЖ байгаа болохоор ᠩ
 * болох ёсгүй — `nga-before-velar` дүрмийн тайлбарт яг үүнийг бичсэн байдаг
 * («Саран|гэрэл»). Дуудлагын буулгагч заагийг мэдэх аргагүй тул задлалт нь
 * зөвхөн энд шийдэгдэнэ.
 *
 * Хоёр хэсгээр хязгаарласан: монгол нийлмэл үг, ялангуяа нэр бараг үргэлж
 * хоёр язгуурын нийлбэр (Мөнх+цэцэг, Ган+болд). Гурав ба түүнээс дээш хэсэгт
 * тэлэх нь буруу таслах эрсдэлийг өсгөнө.
 *
 * Урт толгойгоос эхэлж хайна: «түвшин|сайхан» нь «түв|шинсайхан» биш.
 * Хоёр хэсгийг `joinScript`-ээр залгана — нэрийн хөрвүүлэгчтэй ЯГ ижил
 * дүрмээр (дундах зайлуулагч, ᠠᠠ гүүр, заагийн хэлбэр сонгогч).
 */
const MIN_COMPOUND_PART = 3;

function splitCompound(word: string): WordResult | null {
  if (word.length < MIN_COMPOUND_PART * 2) return null;

  // Эндхийн хайлтууд бүгд ТААМАГ — олдоогүй нь «толиос асуух нь зүйтэй»
  // гэсэн үг биш (`restoreDroppedVowel`-той ижил шалтгаан).
  const outer = probingGuess;
  probingGuess = true;
  try {
    for (let cut = word.length - MIN_COMPOUND_PART; cut >= MIN_COMPOUND_PART; cut -= 1) {
      const head = lookupStem(word.slice(0, cut));
      if (!head) continue;

      const tail = lookupStem(word.slice(cut));
      if (!tail) continue;

      return {
        text: joinScript([head.script, tail.script]),
        certainty: weakest(head.certainty, tail.certainty),
        stem: word,
      };
    }
  } finally {
    probingGuess = outer;
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Тоо, цэг таслал                                                             */
/* -------------------------------------------------------------------------- */

const MONGOL_DIGITS = ["᠐", "᠑", "᠒", "᠓", "᠔", "᠕", "᠖", "᠗", "᠘", "᠙"];

function toMongolDigits(digits: string): string {
  return [...digits].map((digit) => MONGOL_DIGITS[Number(digit)] ?? digit).join("");
}

/**
 * Монгол бичгийн цэг таслал. Асуулт, анхаарлын тэмдэг уламжлалт бичигт
 * байдаггүй тул кирилл хэлбэрээр нь үлдээнэ — устгавал утга алдагдана.
 */
const PUNCTUATION: Record<string, string> = {
  ".": "᠃",
  ",": "᠂",
  ":": "᠄",
  "…": "᠁",
};

/* -------------------------------------------------------------------------- */
/* Нийтийн API                                                                 */
/* -------------------------------------------------------------------------- */

/** Үг | тоо(+нөхцөл) | мөр таслалт | зай | бусад ганц тэмдэгт */
const TOKEN_RE =
  /([А-Яа-яЁёӨөҮү]+)|(\d+(?:-[А-Яа-яЁёӨөҮү]+)?)|(\r?\n)|([ \t]+)|([^\s])/g;

/**
 * Бичвэрийг монгол бичигт хөрвүүлж, хэсэг бүрийн итгэлцлийг хамт буцаана.
 *
 * Үр дүнг шууд «бэлэн» гэж үзэж болохгүй: `unknown` жагсаалт хоосон биш бол
 * тэр үгс дуудлагаар таасан хэлбэртэй байна. Албан бичиг хэвлэгдэж, гарын
 * үсэг зурагддаг тул багшийн хяналт заавал шаардлагатай.
 */
export function convertText(
  input: string,
  options: ConvertOptions = {},
): ConvertedText {
  const { mongolianDigits = true, choices } = options;

  const tokens: TextToken[] = [];
  const unknown = new Set<string>();
  let words = 0;
  let verified = 0;
  let toli = 0;
  let draft = 0;
  let flagged = 0;

  const direct = new Set<string>();
  const guessed = new Set<string>();
  probeDirect = direct;
  probeGuessed = guessed;
  probingGuess = false;
  activeChoices = choices ?? null;

  try {
    convert();
  } finally {
    activeChoices = null;
    // Хувингаа заавал салгана — алдаа гарсан ч модулийн түвшний заагч
    // дараагийн дуудлагад үлдэж, өөр бичвэрийн үгсийг цуглуулж эхлэх ёсгүй.
    probeDirect = null;
    probeGuessed = null;
    probingGuess = false;
  }

  return {
    tokens,
    text: tokens.map((token) => token.text).join(""),
    words,
    verified,
    toli,
    draft,
    flagged,
    unknown: [...unknown],
    // Шууд задралын үр дүн эхэнд — API-ийн хязгаарт мөргөвөл таамаг
    // хувилбарууд нь эхэлж хасагдана.
    lookups: [...direct, ...guessed].slice(0, MAX_LOOKUPS),
  };

  function convert() {
    for (const match of input.matchAll(TOKEN_RE)) {
      const [source, word, number, lineBreak, space, other] = match;

      if (word) {
        const result = convertWord(word.toLowerCase());
        words += 1;
        if (result.certainty === "verified") verified += 1;
        else if (result.certainty === "toli") toli += 1;
        else if (result.certainty === "draft") draft += 1;
        else unknown.add(word);

        // Дүрмийн шалгалт — эх сурвалж хамаарахгүй. Толиос ирсэн бичлэг ч,
        // дүрмээр залгасан нөхцөл ч энд адилхан шалгагдана.
        const issues = checkScript(result.text);
        if (issues.length > 0) flagged += 1;

        tokens.push({
          kind: "word",
          source,
          // Шалгалт дууссаны ДАРАА — дүрмүүд жирийн ᠭ/ᠬ-г л таньдаг.
          text: applyFeminineVelars(result.text),
          certainty: result.certainty,
          stem: result.stem,
          suffix: result.suffix,
          variants: result.variants,
          issues: issues.length > 0 ? issues : undefined,
        });
        continue;
      }

      if (number) {
        // «20-ны» хэлбэр: цифрийг хөрвүүлээд нөхцөлийг тусад нь залгана. Тоо
        // хэрхэн уншигдахыг мэдэхгүй тул нөхцлийн хэлбэрийг гийгүүлэгчээр
        // төгссөн мэт сонгоно — тааварласан тул `guess` гэж тэмдэглэв.
        const [digits, suffix] = number.split("-");
        const shown = mongolianDigits ? toMongolDigits(digits) : digits;

        if (suffix) {
          const rule = SUFFIXES.find((entry) => suffix.endsWith(entry.cyr));
          const shape: Shape = {
            // Нөхцлийн хэлхээ («ны», «ийн») дангаараа эр/эм-ээ заадаггүй.
            // Тоо хэрхэн уншигдахыг мэдэхгүй тул эр гэж үзнэ — «5-ны» нь
            // ᠲᠠᠪᠤᠨ ᠤ, албан бичигт эр тоо давамгайлна.
            front: wordHarmony(suffix) === "front",
            endsWithVowel: false,
            endsWithNa: false,
            voicelessFinal: false,
          };
          const form = rule
            ? SUFFIX_FORM[rule.kind](shape)
            : cyrillicPhonetic(suffix);

          const numberIssues = checkScript(form);
          if (numberIssues.length > 0) flagged += 1;

          tokens.push({
            kind: "number",
            source,
            text: shown + NNBSP + applyFeminineVelars(form),
            certainty: "guess",
            suffix,
            issues: numberIssues.length > 0 ? numberIssues : undefined,
          });
          unknown.add(source);
          continue;
        }

        tokens.push({ kind: "number", source, text: shown });
        continue;
      }

      if (lineBreak) {
        tokens.push({ kind: "break", source, text: "\n" });
        continue;
      }

      if (space) {
        tokens.push({ kind: "space", source, text: " " });
        continue;
      }

      tokens.push({
        kind: "punct",
        source: other,
        text: PUNCTUATION[other] ?? other,
      });
    }
  }
}
