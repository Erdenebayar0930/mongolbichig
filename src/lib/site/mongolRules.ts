/**
 * МОНГОЛ БИЧГИЙН ЗӨВ БИЧИХ ЗҮЙН ДҮРЭМ — нэг эх сурвалж.
 *
 * Өмнө нь дүрэм хоёр тархсан газар сууж байв: [mongolScript.ts](./mongolScript.ts)
 * дотор буулгах үедээ (эгшгийн зохицол, эцсийн гийгүүлэгч), [mongolText.ts](./mongolText.ts)
 * дотор нөхцөл сонгох үедээ. Аль нь ч ГАРАЛТЫГ шалгадаггүй — толиос ирсэн
 * бичлэг ямар ч зөрчилтэй байсан дэлгэц дээр чимээгүй гарна.
 *
 * Энэ модуль дүрмийг **нэг дор**, шалгах чадвартай хэлбэрээр агуулна. Хоёр
 * хэрэглэгчтэй:
 *
 *   * `cyrillicPhonetic` — толинд байхгүй үгийг буулгахдаа эндхийн хүснэгтийг
 *     барина (`separatesFinalVowel`, `demoteRounded`), тиймээс гаралт нь
 *     дүрмээ зөрчих боломж бага.
 *   * `convertText` — үг бүрийн эцсийн үр дүнг `checkScript`-ээр шалгаж,
 *     зөрчлийг токенд хавсаргана. Толиос ирсэн ч, дуудлагаар таасан ч ялгаагүй.
 *
 * ⚠ ДҮРЭМ БҮР ТООГООР БАТЛАГДСАН. Доорх `evidence` талбарууд бол уран яриа биш,
 * `scripts/measure-rules.mts` нь Их тайлбар толийн 59873 бичлэг дээр тоолсон
 * бодит харьцаа. Дүрэм нэмэх, өөрчлөх бол эхлээд тэр скриптийг ажиллуулж,
 * тоог нь энд бич. Хэмжигдэхгүй дүрэм энд орох ёсгүй — учир нь хэрэглэгч
 * «энэ яагаад алдаа вэ» гэж асуухад хариулах зүйлгүй болно.
 *
 * Хэмжилтийн корпус: 59873 бичлэг, үүнээс нэг үгтэй нь 58403, галиг тэмдэгт
 * (ᠧ ᠺ ᠹ ᠸ ᠱ ᠼ ᠽ ᠾ, FVS) агуулаагүй «уугуул» нь 54916. Харь үгэнд өөр дүрэм
 * үйлчилдэг тул дийлэнх дүрмийг уугуул хэсэг дээр хэмжсэн.
 */

/** ЗАЙЛУУЛАГЧ (U+180E) — үгийн эцсийн ᠠ/ᠡ-г салангид сүүлээр бичихийг заана */
export const MVS = "᠎";

/**
 * ХЭЛБЭР СОНГОГЧ 1 (U+180B) — ᠣ ᠤ ᠥ ᠦ-г ШҮДТЭЙ хэлбэрээр зурахыг заана.
 *
 * Дугуй эгшиг үгийн дунд хоёр дүрстэй: эхний үед «шүд + гэдэс», цаашид зөвхөн
 * «гэдэс». Аль нь болохыг фонт БАЙРЛАЛААР нь сонгоно — үгийн эхний
 * гийгүүлэгчийн ард ирсэн дугуй эгшгийг л шүдтэй зурж, бусад бүх дундах дугуй
 * эгшгийн ӨГӨГДМӨЛ дүрс нь гэдэс дангаараа байдаг (Unicode-ийн монгол
 * хэлбэрийн хүснэгт). FVS1 нь тэр өгөгдмөлийг дарж шүдтэй хэлбэрийг эргүүлж
 * авчирна — нийлмэл үгийн ХОЁР ДАХЬ хэсэгт яг энэ хэрэгтэй болно.
 */
export const FVS1 = "᠋";

/** Дугуй эгшиг — эхний үед шүдтэй, цаашид гэдэстэй бичигдэнэ */
export const ROUNDED_VOWELS = new Set(["ᠣ", "ᠤ", "ᠥ", "ᠦ"]);

/**
 * ЭМ дугуй эгшиг. Дундах хэлбэр нь өгөгдмөлөөрөө шүдээ алддаг нь ЗӨВХӨН
 * эдгээр — эр ᠣ/ᠤ нь дундаа ч шүдтэйгээ хэвээр байдаг. Кимо-гийн засагчаар
 * шалгахад нийлмэл үгийн заагт ᠥ нь `medivar1` хэлбэр авч (ᠪᠠᠲᠤᠮᠥᠩᠬᠡ,
 * ᠠᠯᠲᠠᠨᠲᠥᠪᠰᠢᠨ), эр ᠣ/ᠤ нь огт авдаггүй (ᠪᠠᠲᠤᠵᠤᠯᠠ, ᠠᠯᠲᠠᠨᠲᠤᠶᠠᠭ᠎ᠠ,
 * ᠭᠡᠷᠡᠯᠪᠣᠯᠤᠳ). ᠦ дээр кимо-гийн засагч хувилбар тавьдаггүй ч Кимо Word
 * нэмэлтийн бодит гаралт тавьдаг (ᠮᠥᠩᢉᠦᠨᠰᠦ᠋ᢈᠡ) — сүүлийнхийг барив.
 */
export const FRONT_ROUNDED_VOWELS = new Set(["ᠥ", "ᠦ"]);

/** Нарийн салаагүй зай — нөхцөлийг язгуураас салгана */
export const NNBSP = " ";

/* -------------------------------------------------------------------------- */
/* Тэмдэгтийн ангилал                                                          */
/* -------------------------------------------------------------------------- */

/** Эм эгшиг. ᠧ нь харь үгийн «е» боловч эгшгийн зэргээр эм тал руу татна. */
export const FRONT_VOWELS = new Set(["ᠡ", "ᠥ", "ᠦ", "ᠧ"]);

/** Эр эгшиг */
export const BACK_VOWELS = new Set(["ᠠ", "ᠣ", "ᠤ"]);

/** Саармаг — аль ч зэрэгт орно */
export const NEUTRAL_VOWEL = "ᠢ";

export const VOWELS = new Set([...FRONT_VOWELS, ...BACK_VOWELS, NEUTRAL_VOWEL]);

/**
 * ГАЛИГ. Төвд, санскрит, орос үгийг буулгахад л хэрэглэгддэг тэмдэгтүүд.
 * Уугуул монгол үгэнд орвол бараг үргэлж буруу: толинд ᠱ агуулсан 1593 үгийн
 * дийлэнх нь «машин», «агшин» мэт харь буюу шашны гаралтай үг.
 */
export const GALIG = new Set([
  "ᠧ",
  "ᠱ",
  "ᠸ",
  "ᠺ",
  "ᠻ",
  "ᠼ",
  "ᠽ",
  "ᠾ",
  "ᠿ",
  "ᡀ",
  "ᡁ",
  "ᡂ",
  "ᠹ",
]);

/** Хэлбэр сонгогч (FVS) ба нируг — эдгээр нь ихэвчлэн галиг бичлэгт орно */
const SELECTORS = /[᠊-᠍‍]/;

const isVowel = (char: string) => VOWELS.has(char);
const isConsonant = (char: string) =>
  char >= "ᠠ" && char <= "ᡂ" && !VOWELS.has(char);

/** Тэмдэгт сонгогчийг хасна — дүрмийн шалгалт тэднийг тоолох ёсгүй */
const bare = (word: string) => word.replace(/[᠊-᠍‍]/g, "");

/** Галиг агуулсан үг — харь үгийн дүрэмд захирагдана */
export function hasGalig(word: string): boolean {
  return SELECTORS.test(word) || [...word].some((char) => GALIG.has(char));
}

export type Harmony = "back" | "front" | "neutral";

/** Сонгодог бичлэгээс эгшгийн зэргийг тодорхойлно — эхний саармаг бус эгшиг */
export function scriptHarmony(word: string): Harmony {
  for (const char of word) {
    if (BACK_VOWELS.has(char)) return "back";
    if (FRONT_VOWELS.has(char)) return "front";
  }
  return "neutral";
}

/* -------------------------------------------------------------------------- */
/* Хүснэгт — буулгагч ба шалгагч ХОЁУЛАА эндээс уншина                         */
/* -------------------------------------------------------------------------- */

/**
 * ЭЦСИЙН ᠠ/ᠡ САЛАХ ЭСЭХ. Үгийн эцсийн ᠠ/ᠡ нь өмнөх үсгээсээ салангид
 * («ᠭ᠎ᠠ») эсвэл залгаа («ᠭᠡ») бичигдэнэ. Аль нь болохыг өмнөх ГИЙГҮҮЛЭГЧ,
 * бас ЭГШИГ өөрөө хамтдаа шийднэ — ᠭ нь ᠠ-гийн өмнө салдаг ч ᠡ-гийн өмнө
 * салдаггүй.
 *
 * Толин дээр эцсийн ᠠ/ᠡ-тэй уугуул үгсийг тоолсон бүтэн хүснэгт:
 *
 *   ᠭᠠ 1607/5 сална (100%)      ᠭᠡ 0/892 залгана (0%)
 *   ᠬᠠ  152/3 сална  (98%)      ᠬᠡ 0/84  залгана (0%)
 *   ᠶᠠ  272/10 сална (96%)      ᠶᠡ 78/1  сална   (99%)
 *   ᠮᠠ  200/23 сална (90%)      ᠮᠡ 82/3  сална   (96%)
 *   ᠨᠠ  159/11 сална (94%)      ᠨᠡ 98/7  сална   (93%)
 *   ᠷᠠ  119/9 сална  (93%)      ᠷᠡ 56/5  сална   (92%)
 *   ᠯᠠ  12/74 залгана (14%)     ᠯᠡ 13/39 залгана (25%)
 *   ᠲ ᠴ ᠵ ᠪ ᠳ ᠰ ᠫ — бүгд 0% (нийт 2000 гаруй үг, нэг ч салангид биш)
 *
 * Өөрөөр хэлбэл: **ᠮ ᠨ ᠶ ᠷ-ийн дараа үргэлж сална; ᠭ ᠬ-гийн дараа зөвхөн
 * ᠠ сална; бусад бүх гийгүүлэгчийн дараа залгана.**
 */
const SEPARATES: Record<string, { back: boolean; front: boolean }> = {
  ᠭ: { back: true, front: false },
  ᠬ: { back: true, front: false },
  ᠮ: { back: true, front: true },
  ᠨ: { back: true, front: true },
  ᠶ: { back: true, front: true },
  ᠷ: { back: true, front: true },
  // Эгшгийн ард ирсэн эцсийн ᠠ мөн сална (17/17) — «ᠳᠠᠭᠤ᠎ᠠ» мэт
  ᠤ: { back: true, front: true },
};

/**
 * Өмнөх тэмдэгт ба эцсийн эгшгээр нь зайлуулагч хэрэгтэй эсэхийг хэлнэ.
 * `cyrillicPhonetic` үүнийг барьж бичдэг тул буулгагчийн гаралт `mvs-*`
 * дүрмийг зөрчих боломжгүй.
 */
export function separatesFinalVowel(previous: string, vowel: string): boolean {
  const entry = SEPARATES[previous];
  if (!entry) return false;
  return vowel === "ᠡ" ? entry.front : entry.back;
}

/**
 * ᠣ/ᠥ нь ЗӨВХӨН эхний үед орно; хоёр дахь үеэс хойш ᠤ/ᠦ болно. Энэ бол
 * сонгодог бичгийн хамгийн тогтвортой дүрмийн нэг бөгөөд кирилл бичлэгээс
 * шууд харагддаггүй: «монгол» нь ᠮᠣᠩᠭᠣᠯ биш ᠮᠣᠩᠭᠤᠯ, «орон» нь ᠣᠷᠣᠨ биш
 * ᠣᠷᠤᠨ. Толинд яг ийм байв.
 */
export function demoteRounded(vowel: string): string {
  if (vowel === "ᠣ") return "ᠤ";
  if (vowel === "ᠥ") return "ᠦ";
  return vowel;
}

/* -------------------------------------------------------------------------- */
/* Эм ᠭ / ᠬ                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * ЭМ ᠭ ба ᠬ — ТУСДАА КОДООР бичигдэнэ.
 *
 * ᠭ (U+182D) ба ᠬ (U+182C) хоёр эр, эм үгэнд өөр дүрстэй. Unicode нь тэр
 * ялгааг эгшгийн зохицлоор нь фонтод үлдээсэн ч бодит фонтууд дааж чаддаггүй
 * тул монгол бичгийн салбарт эм хэлбэрийг нь U+1889 (ᢉ) ба U+1888 (ᢈ)-аар
 * бичих жишиг тогтжээ. Unicode-ийн албан нэр нь «Ali Gali Ka / I» боловч
 * хэрэглээ нь тэр биш.
 *
 * ЭХ СУРВАЛЖ: <https://kimo.mngl.net/unicode> — Болорсофтын нээлттэй «юникод
 * засах» API (`POST /pub/fix-baiti`). 31 үгээр шалгахад дүрэм тодорхой:
 *
 *   ᠮᠥᠩᠬᠡ→ᠮᠥᠩᢈᠡ  ᠰᠦᠬᠡ→ᠰᠦᢈᠡ  ᠶᠡᠬᠡ→ᠶᠡᢈᠡ  ᠡᠩᠬᠡ→ᠡᠩᢈᠡ  ᠰᠡᠳᠬᠢᠯ→ᠰᠡᠳᢈᠢᠯ
 *   ᠮᠥᠩᠭᠦᠨ→ᠮᠥᠩᢉᠦᠨ  ᠥᠩᠭᠡ→ᠥᠩᢉᠡ  ᠭᠡᠷᠡᠯ→ᢉᠡᠷᠡᠯ  ᠡᠭᠦᠷ→ᠡᢉᠦᠷ  ᠲᠡᠭᠦᠰ→ᠲᠡᢉᠦᠰ
 *   ᠬᠠᠭᠠᠨ, ᠰᠠᠶᠢᠬᠠᠨ, ᠮᠣᠩᠭᠤᠯ, ᠵᠢᠷᠭᠠᠯ, ᠠᠭᠤᠯᠠ — эр тул хэвээр
 *   ᠪᠢᠴᠢᠭ→ᠪᠢᠴᠢᢉ, ᠪᠢᠯᠢᠭ→ᠪᠢᠯᠢᢉ — зөвхөн ᠢ-тэй үг эм тал руу татна
 *   ᠵᠣᠷᠢᠭ, ᠠᠶᠢᠮᠠᠭ — ᠢ саармаг тул эр эгшиг нь шийднэ, хэвээр
 *
 * ⚠ Зэргийг ҮГЭЭР бус ОРЧНООР нь шийднэ: «Түвшинсайхан» нь ᠦ-гээр эхэлдэг ч
 * ᠰᠠᠶᠢ**ᠬ**ᠠᠨ доторх ᠬ нь ᠠ-гийн өмнө байгаа тул эр хэвээр (кимо мөн адил).
 * Тиймээс дараагийн саармаг бус эгшгийг эхлээд, олдохгүй бол өмнөхийг харна.
 */
export const FEMININE_GA = "ᢉ";
export const FEMININE_KA = "ᢈ";

const FEMININE_VELARS: Record<string, string> = {
  "ᠭ": FEMININE_GA,
  "ᠬ": FEMININE_KA,
};

/**
 * Тухайн ᠭ/ᠬ эм орчинд байгаа эсэх.
 *
 * Шийдэх нь уг гийгүүлэгчийн ӨӨРИЙН ҮЕИЙН эгшиг тул ХАЖУУГИЙН эгшгийг эхэлж
 * харна — эхлээд ард нь (ᠮᠥᠩ**ᠭᠦ**ᠨ), байхгүй бол өмнө нь (ᠲ**ᠣᠭ**ᠲᠠᠬᠤ,
 * ᠠᠶᠢᠮ**ᠠᠭ**). Хол хайх нь нийлмэл үг дээр эндүүрдэг: «сэтгэл|маа» доторх
 * ᠬ нь ᠢ-гийн өмнө байгаа тул урагшаа хайвал «маа»-гийн ᠠ-д хүрч эр болно.
 *
 * Хажуугийн эгшиг ᠢ (саармаг) буюу огт байхгүй үед л хол хайна: эхлээд
 * ухарч, дараа нь урагшаа. Аль ч талд саармаг бус эгшиг олдохгүй бол
 * (ᠪᠢᠴᠢᠭ, ᠪᠢᠯᠢᠭ, ᠲᠦᠰᠢᠭ) уламжлалаар эм зэрэгт тооцно — `isFrontWord`-ийн
 * саармаг талаарх шийдэлтэй ижил.
 */
function velarIsFront(chars: string[], at: number): boolean {
  const decide = (char: string | undefined) =>
    char && FRONT_VOWELS.has(char) ? true : char && BACK_VOWELS.has(char) ? false : null;

  const next = decide(chars[at + 1]);
  if (next !== null) return next;

  const previous = decide(chars[at - 1]);
  if (previous !== null) return previous;

  for (let index = at - 1; index >= 0; index -= 1) {
    const found = decide(chars[index]);
    if (found !== null) return found;
  }
  for (let index = at + 1; index < chars.length; index += 1) {
    const found = decide(chars[index]);
    if (found !== null) return found;
  }

  return true;
}

/**
 * Гаралтын ЭЦСИЙН алхам: эм ᠭ/ᠬ-г тусдаа кодоор солино.
 *
 * ⚠ Хүснэгт, толь, дүрмийн шалгагч бүгд ЖИРИЙН ᠭ/ᠬ-тэй ажиллана — U+1888/1889
 * нь `checkScript`-ийн гийгүүлэгчийн муж (ᠠ–ᡂ)-аас гадуур тул дүрэм тэднийг
 * танихаа болино. Тиймээс энэ хувиргалт зөвхөн ХЭРЭГЛЭГЧИД ҮЗҮҮЛЭХ бичвэр
 * дээр, шалгалт дууссаны дараа тавигдана.
 */
export function applyFeminineVelars(script: string): string {
  const chars = [...script];
  let changed = false;

  for (let index = 0; index < chars.length; index += 1) {
    const swap = FEMININE_VELARS[chars[index]];
    if (swap && velarIsFront(chars, index)) {
      chars[index] = swap;
      changed = true;
    }
  }

  return changed ? chars.join("") : script;
}

/** Кирилл эгшиг — үгийн эхний эгшгийг олоход */
const CYRILLIC_VOWELS = new Set([..."аеёиоуүөэюяы"]);

/** Кирилл дугуй эгшиг ↔ эхний үеийн монгол бичлэг */
const CYRILLIC_ROUNDED: Record<string, string> = {
  о: "ᠣ",
  у: "ᠤ",
  ө: "ᠥ",
  ү: "ᠦ",
};

/**
 * ЭХНИЙ ҮЕИЙН ДУГУЙ ЭГШИГ КИРИЛЛЭЭСЭЭ САЛАХГҮЙ.
 *
 * ᠣ/ᠤ ба ᠥ/ᠦ нь дэлгэц дээр ижил дүрстэй тул зөрөх нь ХАРАГДАХГҮЙ, гэвч
 * Unicode-д өөр тэмдэгт учир хайлт, тааруулалт тасарна (`rounded-position`
 * дүрмийн тайлбартай ижил шалтгаан). Үгийн ЭХНИЙ үед аль нь болохыг кирилл
 * бичлэг шууд хэлдэг: о→ᠣ, у→ᠤ, ө→ᠥ, ү→ᠦ.
 *
 * Толинд эхний эгшиг нь дугуй байсан уугуул 24999 үгийг тоолоход:
 *
 *   о → ᠣ 7506 / ᠤ 37      (99.5%)
 *   у → ᠤ 6762 / ᠣ 6       (99.9%)
 *   ө → ᠥ 4196 / ᠦ 53      (98.8%)
 *   ү → ᠦ 4232 / ᠥ 21      (99.5%)
 *
 * Зөрсөн 132 бичлэгийг харахад толийн алдаа болох нь илт («морин» ᠮᠤᠷᠢᠨ,
 * «модон» ᠮᠤᠳᠤᠨ, «одон» ᠤᠳᠦᠨ) — олонх нь эгшгийн зохицлоо ч зөрчсөн байна.
 * Тиймээс толиос ирсэн бичлэгийг ХЭРЭГЛЭХИЙН ӨМНӨ энүүгээр дамжуулна.
 *
 * ⚠ Зөвхөн эхний эгшиг ДУГУЙ байвал хөндөнө. «уул» → ᠠᠭᠤᠯᠠ мэт кирилл урт
 * эгшиг ᠠ-гаар эхэлдэг тохиолдол (у→ᠠ 618, ү→ᠡ 433) нь алдаа биш, дүрэм.
 * Галиг тэмдэгттэй бичлэгийг мөн хөндөхгүй — харь үгэнд өөр жишиг үйлчилнэ.
 */
export function matchFirstRounded(cyrillic: string, script: string): string {
  const first = [...cyrillic.toLowerCase()].find((char) =>
    CYRILLIC_VOWELS.has(char),
  );
  const want = first ? CYRILLIC_ROUNDED[first] : undefined;
  if (!want || hasGalig(script)) return script;

  for (let index = 0; index < script.length; index += 1) {
    const char = script[index];
    if (!VOWELS.has(char)) continue;
    if (char === want || !ROUNDED_VOWELS.has(char)) return script;
    return script.slice(0, index) + want + script.slice(index + 1);
  }

  return script;
}

/* -------------------------------------------------------------------------- */
/* Дүрэм                                                                       */
/* -------------------------------------------------------------------------- */

export type Severity =
  /** Толинд 99%-иас дээш баримталдаг — зөрчвөл бараг гарцаагүй алдаа */
  | "error"
  /** 95–99% — дийлэнхдээ алдаа, гэхдээ жинхэнэ үл хамаарах зүйл байдаг */
  | "warn"
  /** Алдаа биш, анхаарал татах шинж (харь үгийн тэмдэгт гэх мэт) */
  | "info";

export type Span = {
  /** Үгийн доторх байрлал */
  index: number;
  length: number;
  /** Тухайн тохиолдолд хамаарах нэмэлт — ихэвчлэн санал болгох засвар */
  fix?: string;
};

export type Rule = {
  id: string;
  /** Дэлгэцэнд гарах богино нэр */
  title: string;
  /** Яагаад алдаа болохыг тайлбарлана — хэрэглэгч үүнийг уншиж шийднэ */
  detail: string;
  severity: Severity;
  /** Толин дээр хэмжсэн бодит харьцаа */
  evidence: string;
  /** Харь үгэнд шалгахгүй дүрэм эсэх */
  nativeOnly?: boolean;
  find(word: string): Span[];
};

export type Issue = Span & {
  rule: string;
  title: string;
  detail: string;
  severity: Severity;
};

/** Тогтмол загварыг олох туслах */
function matches(word: string, pattern: RegExp, fix?: (m: string) => string) {
  const spans: Span[] = [];
  for (const match of word.matchAll(pattern)) {
    spans.push({
      index: match.index ?? 0,
      length: match[0].length,
      fix: fix?.(match[0]),
    });
  }
  return spans;
}

export const RULES: Rule[] = [
  {
    id: "harmony",
    severity: "warn",
    title: "Эгшгийн зохицол",
    detail:
      "Нэг үг эр (ᠠ ᠣ ᠤ) эсвэл эм (ᠡ ᠥ ᠦ) эгшгийн аль нэгэнд бүхэлдээ " +
      "харьяалагдана; ᠢ нь саармаг. Хоёр зэрэг холилдсон бол ихэвчлэн " +
      "нийлмэл үг буруу залгагдсан эсвэл нөхцөл нь буруу сонгогдсон гэсэн үг.",
    evidence: "Уугуул 54916 үгийн 296 нь (0.54%) зөрчсөн",
    nativeOnly: true,
    find(word) {
      const hasFront = [...word].some((char) => FRONT_VOWELS.has(char));
      const hasBack = [...word].some((char) => BACK_VOWELS.has(char));
      if (!hasFront || !hasBack) return [];

      // Цөөнх талын эгшгүүдийг заана — тэдгээр нь засвар шаардах магадлалтай.
      const dominant = scriptHarmony(word);
      const stray = dominant === "back" ? FRONT_VOWELS : BACK_VOWELS;

      return [...word].flatMap((char, index) =>
        stray.has(char) ? [{ index, length: 1 }] : [],
      );
    },
  },

  {
    id: "rounded-position",
    severity: "warn",
    title: "ᠣ/ᠥ зөвхөн эхний үед",
    detail:
      "Сонгодог бичигт ᠣ ба ᠥ нь үгийн ЭХНИЙ үед л орно; хоёр дахь үеэс " +
      "хойш ᠤ/ᠦ гэж бичигдэнэ — «монгол» нь ᠮᠣᠩᠭᠤᠯ, «орон» нь ᠣᠷᠤᠨ. " +
      "⚠ ДЭЛГЭЦЭН ДЭЭР ЯЛГАА ХАРАГДАХГҮЙ: монгол бичигт o/u хоёр нэг адил " +
      "дүрстэй бөгөөд Unicode-д л тусдаа тэмдэгт. Гэвч толь энэ жишгийг " +
      "баримталдаг тул зөрвөл ХАЙЛТ, ТААРУУЛАЛТ тасарна — нэг үг хоёр " +
      "өөр байдлаар кодлогдоно.",
    evidence:
      "Уугуул үгийн 0.80% (441/54916) нь ᠣ-г, 0.17% нь ᠥ-г эхний үеэс хойш авсан",
    nativeOnly: true,
    find(word) {
      const first = [...word].findIndex(isVowel);
      if (first < 0) return [];

      const spans: Span[] = [];
      for (let index = first + 1; index < word.length; index += 1) {
        const char = word[index];
        if (char === "ᠣ" || char === "ᠥ") {
          spans.push({ index, length: 1, fix: demoteRounded(char) });
        }
      }
      return spans;
    },
  },

  {
    id: "nga-before-velar",
    severity: "error",
    title: "ᠭ/ᠬ-гийн өмнөх ᠨ нь ᠩ",
    detail:
      "«н» нь ᠭ, ᠬ-гийн өмнө ᠩ болно: «монгол» → ᠮᠣᠩᠭᠤᠯ, «мөнх» → ᠮᠥᠩᠬᠡ. " +
      "ᠨᠭ гэж бичвэл өөр авиа болно. ⚠ Нийлмэл үгийн ЗААГ дээр үйлчлэхгүй — " +
      "«Саран|гэрэл» дэх ᠨ нь эхний хэсгээ төгсгөж байгаа тул ᠩ болохгүй.",
    evidence: "58403 үгийн 89 нь ᠨᠭ (0.15%), 4 нь ᠨᠬ (0.01%)",
    find: (word) => matches(word, /ᠨ(?=[ᠭᠬ])/g, () => "ᠩ"),
  },

  {
    id: "nga-initial",
    severity: "error",
    title: "Үг ᠩ-ээр эхлэхгүй",
    detail:
      "ᠩ нь үеийн төгсгөлийн авиа — үгийн эхэнд хэзээ ч ирдэггүй. Эхэнд " +
      "гарсан бол ᠨ байх ёстой.",
    evidence: "58403 үгийн нэг нь ч ᠩ-ээр эхлээгүй (0%)",
    find: (word) => (word.startsWith("ᠩ") ? [{ index: 0, length: 1, fix: "ᠨ" }] : []),
  },

  {
    id: "bare-final-consonant",
    severity: "error",
    title: "ᠬ ᠴ ᠵ дангаараа үг төгсгөхгүй",
    detail:
      "Эдгээр гийгүүлэгчийн ард эгшиг ЗААВАЛ ордог бөгөөд тэр эгшгийг үгийн " +
      "эр/эм зэрэг сонгоно: «явах» → ᠶᠠᠪᠤᠬᠤ, «ирэх» → ᠢᠷᠡᠬᠦ, «багш» → " +
      "ᠪᠠᠭᠰᠢ. Эгшиггүй үлдээвэл үг дуусаагүй мэт харагдана.",
    evidence:
      "58403 үгийн эцэст ᠬ ердөө 1 удаа, ᠵ 1 удаа, ᠴ огт таарсангүй (0.003%)",
    find: (word) => matches(word, /[ᠬᠴᠵ]$/g),
  },

  {
    id: "bare-final-t",
    severity: "warn",
    title: "Эцсийн ᠲ эгшиггүй үлдсэн",
    detail:
      "«т»-ээр төгссөн үг сонгодог бичигт эгшиг авдаг: «хот» → ᠬᠣᠲᠠ, «бат» " +
      "→ ᠪᠠᠲᠤ. Аль эгшиг болохыг зөвхөн толь мэднэ (эр үгэнд ᠠ 650, ᠤ 620 " +
      "удаа таарсан — бараг тэнцүү), тиймээс энэ бол ЗАСВАР биш АНХААРУУЛГА.",
    evidence: "«т»-ээр төгссөн 2156 үгийн 2120 нь (98.3%) эгшиг авсан",
    find: (word) => matches(word, /ᠲ$/g),
  },

  {
    id: "ta-before-consonant",
    severity: "warn",
    title: "Гийгүүлэгчийн өмнө ᠳ",
    detail:
      "Сонгодог бичигт ᠲ нь гийгүүлэгчийн өмнө ирдэггүй — тэр байрлалд ᠳ " +
      "бичигдэнэ, эсвэл хоорондоо эгшиг ордог («амттай» → ᠠᠮᠲᠠᠲᠠᠢ). ᠲ + " +
      "гийгүүлэгч гарсан бол хоёрын нэг нь буруу.",
    evidence:
      "Уугуул үгэнд гийгүүлэгчийн өмнө ᠳ 1044 удаа, ᠲ ердөө 6 удаа (0.6%)",
    nativeOnly: true,
    find(word) {
      const spans: Span[] = [];
      for (let index = 0; index < word.length - 1; index += 1) {
        if (word[index] === "ᠲ" && isConsonant(word[index + 1])) {
          spans.push({ index, length: 1, fix: "ᠳ" });
        }
      }
      return spans;
    },
  },

  {
    id: "long-vowel-aa",
    severity: "error",
    title: "ᠠᠠ / ᠡᠡ дараалал байдаггүй",
    detail:
      "Урт «аа», «ээ»-г хоёр эгшиг зэрэгцүүлж биш, дунд нь ᠭ тавьж бичнэ: " +
      "«баатар» → ᠪᠠᠭᠠᠲᠤᠷ, «ээж» → ᠡᠭᠡᠵᠢ. (ᠤᠤ, ᠦᠦ, ᠣᠣ хосууд харин " +
      "жинхэнэ — тэднийг энэ дүрэм хөндөхгүй.)",
    evidence: "Уугуул 54916 үгэнд ᠠᠠ ба ᠡᠡ дараалал нэг ч удаа таарсангүй (0%)",
    find: (word) => matches(word, /ᠠᠠ|ᠡᠡ/g),
  },

  {
    id: "mvs-place",
    severity: "error",
    title: "Зайлуулагч буруу байрлалд",
    detail:
      "Зайлуулагч (U+180E) нь ЗӨВХӨН үгийн эцсийн ᠠ/ᠡ-ийн өмнө орно. Өөр " +
      "газар байвал үсэг буруу дүрсээр буудаг.",
    evidence: "Толь дахь 2969 зайлуулагчийн 2966 нь (99.9%) яг тэр байрлалд байв",
    find(word) {
      const spans: Span[] = [];
      for (let index = 0; index < word.length; index += 1) {
        if (word[index] !== MVS) continue;
        const next = word[index + 1];
        const isFinalAE = index === word.length - 2 && (next === "ᠠ" || next === "ᠡ");
        if (!isFinalAE) spans.push({ index, length: 1 });
      }
      return spans;
    },
  },

  {
    id: "mvs-missing",
    severity: "warn",
    title: "Эцсийн ᠠ/ᠡ салангид байх ёстой",
    detail:
      "ᠮ ᠨ ᠶ ᠷ-ийн дараах эцсийн ᠠ/ᠡ, мөн ᠭ ᠬ-гийн дараах эцсийн ᠠ нь " +
      "салангид сүүлээр бичигдэнэ: «дараа» → ᠳᠠᠷᠠᠭ᠎ᠠ, «шинэ» → ᠰᠢᠨ᠎ᠡ. " +
      "Залгаж бичвэл өөр үсэг болж уншигдана. ⚠ Түгээмэл төлөөний үг, " +
      "тооны нэр үл хамаарна — толинд «энэ» ᠡᠨᠡ, «тэр» ᠲᠡᠷᠡ, «нар» ᠨᠠᠷᠠ, " +
      "«ер» ᠶᠡᠷᠡ гэж ЗАЛГАА бичигдсэн байв.",
    evidence:
      "ᠭ᠎ᠠ 1607/1612 (100%), ᠶ᠎ᠡ 78/79 (99%), ᠬ᠎ᠠ 152/155 (98%), ᠮ᠎ᠡ 82/85 (96%)",
    nativeOnly: true,
    find(word) {
      const last = word.slice(-1);
      if (last !== "ᠠ" && last !== "ᠡ") return [];
      if (word[word.length - 2] === MVS) return [];

      const previous = word[word.length - 2];
      if (!previous || !separatesFinalVowel(previous, last)) return [];

      return [{ index: word.length - 1, length: 1, fix: MVS + last }];
    },
  },

  {
    id: "mvs-extra",
    severity: "error",
    title: "Эцсийн ᠠ/ᠡ залгаа байх ёстой",
    detail:
      "ᠲ ᠴ ᠵ ᠪ ᠳ ᠰ ᠯ-ийн дараах эцсийн ᠠ/ᠡ, мөн ᠭ ᠬ-гийн дараах эцсийн ᠡ нь " +
      "залгаа бичигдэнэ: «хот» → ᠬᠣᠲᠠ, «гэр» → ᠭᠡᠷ᠎ᠡ биш «хэлэ» → ᠬᠡᠯᠡ. " +
      "Эдгээрийн ард зайлуулагч тавих нь дүрэмгүй.",
    evidence:
      "ᠭᠡ 0/892, ᠬᠡ 0/84, ᠲᠠ 0/675, ᠴᠠ 0/210, ᠵᠠ 0/145, ᠪᠠ 0/133, ᠳᠠ 0/111 — " +
      "бүгд нэг ч удаа салангид биш (0%)",
    nativeOnly: true,
    find(word) {
      const last = word.slice(-1);
      if (last !== "ᠠ" && last !== "ᠡ") return [];
      if (word[word.length - 2] !== MVS) return [];

      const previous = word[word.length - 3];
      if (!previous || separatesFinalVowel(previous, last)) return [];

      return [{ index: word.length - 2, length: 2, fix: last }];
    },
  },

  {
    id: "galig",
    severity: "info",
    title: "Харь үгийн тэмдэгт",
    detail:
      "ᠱ ᠸ ᠺ ᠹ ᠧ ᠼ ᠽ ᠾ нь галиг — төвд, санскрит, орос үг буулгахад л " +
      "хэрэглэнэ. Уугуул монгол үгэнд «ш» нь ᠰᠢ («шинэ» → ᠰᠢᠨ᠎ᠡ), «в» нь ᠪ " +
      "болно. Алдаа гэсэн үг биш — гэхдээ уугуул үг бол шалгах хэрэгтэй.",
    evidence:
      "«ш»-тэй 6159 үгийн 4492 нь (72.9%) ᠰᠢ, «в»-тэй 7387 үгийн 7093 нь (96.0%) ᠪ",
    find(word) {
      const spans: Span[] = [];
      for (let index = 0; index < word.length; index += 1) {
        if (GALIG.has(word[index])) spans.push({ index, length: 1 });
      }
      return spans;
    },
  },
];

const BY_ID = new Map(RULES.map((rule) => [rule.id, rule]));

export function ruleById(id: string): Rule | undefined {
  return BY_ID.get(id);
}

/* -------------------------------------------------------------------------- */
/* Шалгалт                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * НЭГ үгийг шалгана. Оролт нь зай, нөхцөлгүй цэвэр сонгодог бичлэг байх ёстой —
 * бүтэн бичвэрт `checkScript`-ийг ашигла.
 */
export function checkWord(word: string): Issue[] {
  const clean = bare(word);
  if (!clean) return [];

  const foreign = hasGalig(word);

  return RULES.flatMap((rule) => {
    if (rule.nativeOnly && foreign) return [];
    return rule.find(clean).map((span) => ({
      ...span,
      rule: rule.id,
      title: rule.title,
      detail: rule.detail,
      severity: rule.severity,
    }));
  });
}

/**
 * Бичвэр буюу олон үгтэй хэсгийг шалгана. Зай, нарийн зай (нөхцөл), мөр
 * таслалтаар үг болгон салгаж, тус бүрийг нь шалгаад байрлалыг эх мөрийн
 * индекс рүү буцаан тооцно.
 *
 * ⚠ Нөхцөлийг ТУСАД нь шалгана. Сонгодог бичигт нөхцөл нь бие даасан
 * нэгж — «ᠤᠯᠤᠰ ᠤᠨ» гэдгийг нэг үг мэт үзвэл эгшгийн зохицол хуурамчаар
 * зөрчигдөнө («ᠭᠡᠷ ᠲᠦ» — язгуур эм, нөхцөл эм, гэхдээ хамтад нь харвал
 * зохицол шалгагч төөрнө).
 */
export function checkScript(text: string): Issue[] {
  const issues: Issue[] = [];
  const parts = text.split(/([\s  ]+)/);
  let offset = 0;

  for (const part of parts) {
    if (part && !/^[\s  ]+$/.test(part)) {
      for (const issue of checkWord(part)) {
        issues.push({ ...issue, index: issue.index + offset });
      }
    }
    offset += part.length;
  }

  return issues.sort((a, b) => a.index - b.index);
}

/** Хамгийн хүнд зөрчлийн зэрэг — токенд өнгө сонгоход */
export function worstSeverity(issues: Issue[]): Severity | null {
  if (issues.some((issue) => issue.severity === "error")) return "error";
  if (issues.some((issue) => issue.severity === "warn")) return "warn";
  if (issues.length > 0) return "info";
  return null;
}
