import "server-only";

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import sharp from "sharp";

/**
 * Монгол бичгийг сервер дээр ЗУРАГ болгон буулгах.
 *
 * ## Яагаад SVG + sharp вэ
 *
 * Монгол бичиг нь **контекст хамааралт** — үсэг бүр эхэн/дунд/эцсийн байрлалдаа
 * өөр хэлбэртэй бөгөөд сонголтыг фонтын GSUB хүснэгт хийдэг. Тиймээс хэлбэр
 * сонгодоггүй зурагчид (satori буюу `next/og` гэх мэт) энэ бичгийг **чимээгүйхэн
 * буруу** буулгана — үсэг бүр салангид хэлбэрээрээ гарч ирнэ.
 *
 * `sharp` нь дотроо librsvg → Pango → HarfBuzz гинжээр явдаг бөгөөд HarfBuzz нь
 * бүрэн хэлбэр сонголт хийнэ. Тиймээс зурагдалт нь `<text>`-тэй SVG-г sharp-аар
 * растержуулах замаар явна.
 *
 * ## Яагаад TTF хэрэгтэй вэ
 *
 * Pango фонтыг **fontconfig**-оор олдог бөгөөд fontconfig нь WOFF2 уншдаггүй.
 * Сайт хөтөчид WOFF2 өгдөг тул сервер талд ижил фонтын **TTF** хувилбарыг зэрэг
 * хадгална ([public/fonts/mongol](../../public/fonts/mongol)). Хоёулаа нэг эх
 * файлаас гардаг тул хөтөч ба сервер ижил зурагдана.
 *
 * ## Яагаад эргүүлдэг вэ
 *
 * Монгол бичгийн фонтын үсэг нь **хэвтээ** байрлалдаа хажуу тийшээ хэвтэж
 * зурагддаг. Хэвтээгээр бичээд 90° цагийн зүүний дагуу эргүүлэхэд яг босоо
 * баганы хэлбэрт ордог — CSS-ийн `writing-mode: vertical-lr` ч дотроо ийм
 * ажилладаг, [NameCalligraphy](../components/name/NameCalligraphy.tsx) зотон
 * дээр мөн ийм аргаар зурдаг.
 */

/* -------------------------------------------------------------------------- */
/* Фонт                                                                        */
/* -------------------------------------------------------------------------- */

const FONT_DIR = path.join(process.cwd(), "public", "fonts", "mongol");

/** Монгол бичгийн нүүр — сайтын үндсэн фонт (`--font-mongol`-той ижил). */
const MONGOL_FAMILY = "Classical Mongolian Dashitseden";

/**
 * Кирилл тайлбарын нүүр. Эхэнд системийн түгээмэл нүүрүүд, төгсгөлд «Mongolian
 * System» — сүүлийнх нь бидэнтэй хамт **тээгдэж** байгаа тул кирилл фонтгүй
 * нүцгэн серверт ч тайлбар дөрвөлжин хайрцаг болж хоцрохгүй.
 */
const CYRILLIC_FAMILY =
  "Noto Sans, DejaVu Sans, Liberation Sans, Arial, Mongolian System, sans-serif";

/**
 * fontconfig-т манай фонтын хавтсыг зааж өгнө.
 *
 * ⚠ `FONTCONFIG_FILE` нь системийн тохиргоог **орлуулдаг** тул `/etc/fonts`-ыг
 * дотор нь буцаад оруулж байна — эс бөгөөс сервер дээрх бүх кирилл/латин фонт
 * алга болж, тайлбар хайрцаг болно.
 *
 * Нэг л удаа бэлдэнэ (амлалтыг нь хадгална) — процесс тутамд нэг файл.
 */
let fontconfigReady: Promise<void> | null = null;

function prepareFontconfig(): Promise<void> {
  fontconfigReady ??= (async () => {
    // ⚠ `output: "standalone"` build нь `public/`-ыг server.js-ийн хажууд
    // АВТОМАТААР хуулдаггүй. Хуулагдаагүй бол fontconfig монгол фонт олохгүй
    // бөгөөд зураг нь алдаа шидэхгүй — үсгийн оронд дөрвөлжин хайрцаг зурчихна.
    // Тийм чимээгүй эвдрэлийг хожим оношлох нь хэцүү тул одоо, тод хашгирна.
    try {
      await access(path.join(FONT_DIR, "cmdashitseden.ttf"));
    } catch {
      console.error(
        `[mongol] Монгол бичгийн TTF олдсонгүй: ${FONT_DIR}\n` +
          "  Зураг дээр үсгийн оронд хайрцаг гарна. Standalone deploy үед\n" +
          "  public/ хавтсыг server.js-ийн хажууд хуулсан эсэхээ шалгана уу.",
      );
    }

    const dir = path.join(os.tmpdir(), "uranbichleg-fontconfig");
    const cache = path.join(dir, "cache");
    const file = path.join(dir, "fonts.conf");

    await mkdir(cache, { recursive: true });
    await writeFile(
      file,
      [
        `<?xml version="1.0"?>`,
        `<!DOCTYPE fontconfig SYSTEM "fonts.dtd">`,
        `<fontconfig>`,
        `  <include ignore_missing="yes">/etc/fonts/fonts.conf</include>`,
        `  <dir>${FONT_DIR}</dir>`,
        `  <cachedir>${cache}</cachedir>`,
        `</fontconfig>`,
        ``,
      ].join("\n"),
      "utf8",
    );

    // Pango нь тохиргоог АНХ УДАА бичвэр зурах агшинд уншдаг тул зурахаас өмнө
    // тавихад хангалттай.
    process.env.FONTCONFIG_FILE = file;
  })();

  return fontconfigReady;
}

/* -------------------------------------------------------------------------- */
/* Зургийн хэмжээс                                                             */
/* -------------------------------------------------------------------------- */

/** Facebook-ийн урсгалд дөрвөлжин зураг бүтнээрээ харагддаг. */
const SIZE = 1080;

const FRAME_INSET = 44;
const TEXT_TOP = 108;
const TEXT_BOTTOM = 812;
const TEXT_LEFT = 116;
const TEXT_RIGHT = SIZE - 116;

const TEXT_HEIGHT = TEXT_BOTTOM - TEXT_TOP;
const TEXT_WIDTH = TEXT_RIGHT - TEXT_LEFT;

/** Доод зурвас: зураас, кирилл тайлбар, сайтын нэр, тамга. */
const RULE_Y = 846;
const CAPTION_TOP = 870;
const BRAND_BOTTOM = 1014;
const BRAND_SIZE = 22;
const SEAL_SIZE = 64;
const SEAL_INSET = FRAME_INSET + 20;

/**
 * Тайлбарын хамгийн их эзлэх талбай. Өргөн нь зургийнхаас нарийн — тамга нь
 * баруун доод буланд суудаг тул урт тайлбар түүн дээгүүр гүйж болохгүй.
 */
const CAPTION_WIDTH = 700;
const CAPTION_HEIGHT = 110;
const CAPTION_BASE = 34;
const CAPTION_MIN = 19;
/** Тайлбарыг хэдэн мөрөнд задлахыг зөвшөөрөх вэ. */
const CAPTION_MAX_LINES = 3;

/** Материалын өнгө — `/ner` хуудасны «Цаасан бичээс» хэвтэй ижил. */
const PAPER = "#f2e7d3";
const INK = "#14100a";
/** Тайлбарын бэх — гол бичээсээс бүдэг, гэхдээ уншигдахуйц. */
const INK_SOFT = "#4b4237";
const GOLD = "#a5842f";

/**
 * Хэмжилтийн суурь хэмжээ. Бичвэрийн урт нь фонтын хэмжээтэй **шугаман**
 * пропорциональ тул нэг удаа энэ хэмжээгээр хэмжээд үлдсэнийг тооцоолно —
 * оролдох хэмжээ бүрд дахин зурвал зурагдалтын тоо олон дахин нэмэгдэнэ.
 */
const BASE = 120;

/** Үгийн хоорондох зай, суурь хэмжээний хувиар. */
const SPACE_RATIO = 0.42;

/** Баганын алхам. Монгол бичигт мөр хоорондын зай ойролцоогоор 1.5 эм. */
const COLUMN_PITCH = 1.5;

/** Оролдох фонтын хэмжээ — томоос жижиг рүү. Эхний багтсан нь ялна. */
const MAX_FONT = 168;
const MIN_FONT = 34;
const FONT_STEP = 4;

/**
 * Нэг зурагт багтаах бичвэрийн дээд урт. Үүнээс цааш үсэг нь танигдахгүй жижиг
 * болох тул дуудагч тал таслах ёстой — бүхэл номыг зураг болгох гэж оролдохгүй.
 */
export const MAX_POSTER_CHARS = 220;

/* -------------------------------------------------------------------------- */
/* Туслахууд                                                                   */
/* -------------------------------------------------------------------------- */

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type Raster = { png: Buffer; width: number; height: number };

const EMPTY: Raster = { png: Buffer.alloc(0), width: 0, height: 0 };

/**
 * Нэг мөр бичвэрийг ХЭВТЭЭГЭЭР зурж, ирмэгийн хоосныг тайрч буцаана.
 *
 * Тайрах нь зөвхөн гоо сайхны асуудал биш — байрлуулахад бичвэрийн **бодит**
 * хэмжээ хэрэгтэй бөгөөд librsvg нь хэмжээсээ буцаадаггүй. Тиймээс «том зотон
 * дээр зураад тайрах» нь энд хэмжих цорын ганц арга.
 */
async function renderRun(
  lines: string | string[],
  size: number,
  family: string,
  color: string,
): Promise<Raster> {
  const rows = (Array.isArray(lines) ? lines : [lines]).filter((line) =>
    line.trim(),
  );
  if (rows.length === 0) return EMPTY;

  await prepareFontconfig();

  // Зотон нь бичвэрээс УРТ байх ёстой — багтахгүй бол тайралт нь бичвэрийг
  // өөрийг нь тасална. Монгол үсгийн явалт 1 эм-ээс бага тул 1.6 нь өгөөмөр.
  const longest = Math.max(...rows.map((line) => line.length));
  const canvasWidth = Math.min(
    24_000,
    Math.ceil(longest * size * 1.6) + size * 4,
  );
  const lineHeight = Math.round(size * 1.32);
  const canvasHeight = Math.ceil(size * 2 + lineHeight * rows.length);
  const centre = Math.round(canvasWidth / 2);

  // Олон мөрийг НЭГ зотон дээр зурна. Мөр тус бүрийг тусад нь тайраад дараа нь
  // өрвөл суурь шугам нь зөрнө — уруу сүүлгүй мөр («сайн уу») нь сүүлтэйгээсээ
  // («бичгээ») өөр өндөртэй тайрагдана.
  const text = rows
    .map(
      (line, index) =>
        `<text x="${centre}" y="${size + lineHeight * (index + 1)}"` +
        ` text-anchor="middle" font-family="${escapeXml(family)}"` +
        ` font-size="${size}" fill="${color}" xml:space="preserve">${escapeXml(line)}</text>`,
    )
    .join("");

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">` +
    text +
    `</svg>`;

  try {
    const { data, info } = await sharp(Buffer.from(svg))
      // Босго бага байх тусам үсгийн зөөлөн ирмэг хадгалагдана.
      .trim({ threshold: 1 })
      .png()
      .toBuffer({ resolveWithObject: true });
    return { png: data, width: info.width, height: info.height };
  } catch {
    // Фонт олдоогүй, эсвэл зотон бүхэлдээ хоосон — тайрах юмгүй бол sharp алдаа
    // шиднэ. Зураг бүтэн үлдэх нь нэг мөр дутахаас чухал.
    return EMPTY;
  }
}

/** Хэвтээ мөрийг босоо багана болгоно — 90° цагийн зүүний дагуу. */
async function toColumn(run: Raster): Promise<Raster> {
  if (run.width === 0) return EMPTY;
  const { data, info } = await sharp(run.png)
    .rotate(90)
    .png()
    .toBuffer({ resolveWithObject: true });
  return { png: data, width: info.width, height: info.height };
}

/* -------------------------------------------------------------------------- */
/* Байршуулалт                                                                 */
/* -------------------------------------------------------------------------- */

/** Нэг босоо багана — доторх үгс. Зурахдаа хоосон зайгаар холбоно. */
type Column = string[];

/**
 * Үгсийг баганад хуваана — багана дүүрэх бүрд шинийг эхэлнэ.
 *
 * `\n` нь баганыг ЗААВАЛ солино (хэрэглэгчийн мөр таслалтыг хүндэтгэнэ), харин
 * нарийн зай (NNBSP — язгуур-нөхцлийн холбоос) нь **таслах цэг биш**. Тиймээс
 * зөвхөн жирийн хоосон зайгаар хуваана.
 *
 * Хэмжээ нь тохирохгүй бол (ганц үг өөрөө баганад багтахгүй) `null` буцаана —
 * `strict` унтарсан үед харин тэр үгийг дангаар нь баганад тавьж, багтаах
 * ажлыг дуудагчид үлдээнэ.
 */
function wrap(
  paragraphs: string[][],
  widths: Map<string, number>,
  scale: number,
  limit: number,
  strict = true,
): Column[] | null {
  const columns: Column[] = [];
  const space = BASE * SPACE_RATIO;

  for (const words of paragraphs) {
    let current: string[] = [];
    let width = 0;

    for (const word of words) {
      const own = widths.get(word) ?? 0;
      // Ганц үг баганад багтахгүй бол хэмжээ нь дэндүү том — хуваалт үүнийг
      // шийдэхгүй тул дуудагчид «болохгүй» гэж хэлнэ.
      if (own * scale > limit) {
        if (strict) return null;
        if (current.length > 0) columns.push(current);
        columns.push([word]);
        current = [];
        width = 0;
        continue;
      }

      const added = current.length === 0 ? own : width + space + own;
      if (added * scale > limit) {
        columns.push(current);
        current = [word];
        width = own;
        continue;
      }
      current.push(word);
      width = added;
    }

    if (current.length > 0) columns.push(current);
  }

  return columns;
}

/* -------------------------------------------------------------------------- */
/* Дэвсгэр                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Цаас, хүрээ, зураас. Бичвэр нь бүгд ХЭМЖИГДЭЖ наагддаг тул энд ороогүй —
 * монгол бичиг эргүүлэлт шаарддаг, кирилл тайлбар нь хүрээнд багтах ёстой.
 */
function background(): Buffer {
  const inner = FRAME_INSET + 14;

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <defs>
    <radialGradient id="vignette" cx="50%" cy="44%" r="78%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="62%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="${INK}" stop-opacity="0.10"/>
    </radialGradient>
    <pattern id="grain" width="7" height="7" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="0.6" fill="${INK}" fill-opacity="0.05"/>
      <circle cx="5" cy="4.5" r="0.5" fill="${INK}" fill-opacity="0.035"/>
    </pattern>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="${PAPER}"/>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#grain)"/>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#vignette)"/>
  <rect x="${FRAME_INSET}" y="${FRAME_INSET}" width="${SIZE - FRAME_INSET * 2}" height="${SIZE - FRAME_INSET * 2}" fill="none" stroke="${GOLD}" stroke-width="3"/>
  <rect x="${inner}" y="${inner}" width="${SIZE - inner * 2}" height="${SIZE - inner * 2}" fill="none" stroke="${GOLD}" stroke-width="1" stroke-opacity="0.55"/>
  <line x1="${TEXT_LEFT}" y1="${RULE_Y}" x2="${TEXT_RIGHT}" y2="${RULE_Y}" stroke="${GOLD}" stroke-width="1" stroke-opacity="0.4"/>
</svg>`,
    "utf8",
  );
}

/**
 * Кирилл тайлбарыг мөрөнд задална — үгээр, тэнцүү орчим уртаар.
 *
 * Яагаад тэмдэгтээр тооцоолж байна вэ: энэ нь зөвхөн ХААНА таслахыг сонгоно,
 * фонтын хэмжээг нь хэмжилт шийднэ. Тиймээс тооцоо ойролцоо байхад хангалттай —
 * ташуу тассан мөр нь ялимгүй урт/богино харагдахаас өөр хохирол учруулахгүй.
 */
function splitCaption(caption: string, count: number): string[] {
  const words = caption.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  if (count <= 1) return [words.join(" ")];

  const perLine = Math.ceil(caption.length / count);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && candidate.length > perLine && lines.length < count - 1) {
      lines.push(current);
      current = word;
      continue;
    }
    current = candidate;
  }
  if (current) lines.push(current);

  return lines;
}

/**
 * Тайлбарыг хүрээнд багтаана: суурь хэмжээгээр хэмжээд, хэтэрсэн бол хэмжээг нь
 * харьцаагаар багасгаж ДАХИН зурна.
 *
 * Дахин зурсны дараа ч багтаагүй бол (зайгүй урт «үг» — гараа гулсуулсан
 * хэрэглэгч) зургийг нь шахна. Багтаагүй наалтыг sharp алдаа гэж үздэг тул энэ
 * нь гоо сайхны биш, БҮТЭН ажиллах баталгаа.
 */
async function renderCaption(caption: string): Promise<Raster> {
  let lines = splitCaption(caption, 1);
  if (lines.length === 0) return EMPTY;

  let raster = await renderRun(lines, CAPTION_BASE, CYRILLIC_FAMILY, INK_SOFT);
  if (raster.width === 0) return EMPTY;

  // Мөр нэмэх нь үсгийг ЖИЖИГРҮҮЛЭХЭЭС дээр — тиймээс багтахгүй байгаа цагт л
  // задална. Урьдчилж «гурав хуваая» гэвэл «сайн байна уу» гурван мөр болно.
  for (let count = 2; count <= CAPTION_MAX_LINES; count += 1) {
    if (raster.width <= CAPTION_WIDTH) break;
    lines = splitCaption(caption, count);
    raster = await renderRun(lines, CAPTION_BASE, CYRILLIC_FAMILY, INK_SOFT);
  }

  const scale = Math.min(
    CAPTION_WIDTH / raster.width,
    CAPTION_HEIGHT / raster.height,
    1,
  );
  if (scale < 1) {
    const size = Math.max(CAPTION_MIN, Math.floor(CAPTION_BASE * scale));
    raster = await renderRun(lines, size, CYRILLIC_FAMILY, INK_SOFT);
  }

  return fit(raster, CAPTION_WIDTH, CAPTION_HEIGHT);
}

/** Растерыг өгсөн хүрээнд багтаана — томсгохгүй, зөвхөн шахна. */
async function fit(raster: Raster, width: number, height: number): Promise<Raster> {
  if (raster.width === 0) return EMPTY;
  if (raster.width <= width && raster.height <= height) return raster;

  const { data, info } = await sharp(raster.png)
    .resize({ width, height, fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { png: data, width: info.width, height: info.height };
}

/** Тамга — `public/brand/seal.svg`. Олдохгүй бол зураг тамгагүй гарна. */
async function seal(): Promise<Raster> {
  try {
    const source = await readFile(
      path.join(process.cwd(), "public", "brand", "seal.svg"),
    );
    const { data, info } = await sharp(source)
      .resize(SEAL_SIZE, SEAL_SIZE, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer({ resolveWithObject: true });
    return { png: data, width: info.width, height: info.height };
  } catch {
    return EMPTY;
  }
}

/* -------------------------------------------------------------------------- */
/* Гол функц                                                                   */
/* -------------------------------------------------------------------------- */

export type PosterInput = {
  /** Монгол бичгээр хөрвүүлсэн бичвэр */
  script: string;
  /** Доор жижгээр гарах кирилл эх бичвэр */
  caption: string;
  /** Хамгийн доор гарах сайтын нэр */
  brand?: string;
};

/**
 * Монгол бичгийн бичээсийг PNG болгоно (1080×1080).
 *
 * Фонтын хэмжээг бичвэрийн уртаас **хэмжилтээр** сонгоно: суурь хэмжээгээр үг
 * бүрийг нэг удаа зураад өргөнийг нь мэдэж авч, дараа нь томоос жижиг рүү
 * оролдоод эхний багтсанг авна. Тааварласан коэффициент ашиглавал урт бичвэр
 * хүрээнээс халина.
 */
export async function renderPoster({
  script,
  caption,
  brand = "уран бичлэг & монгол өв соёл",
}: PosterInput): Promise<Buffer> {
  const paragraphs = script
    .split(/\n+/)
    .map((line) => line.trim().split(/[ \t]+/).filter(Boolean))
    .filter((words) => words.length > 0);

  if (paragraphs.length === 0) {
    throw new Error("Зурах монгол бичиг хоосон байна");
  }

  // Үг бүрийг суурь хэмжээгээр нэг л удаа хэмжинэ — давхардсаныг нь дахин
  // зурахгүй (нэг бичвэрт «ᠪᠠᠢᠨ᠎ᠠ» олон удаа орж болно).
  const widths = new Map<string, number>();
  for (const word of new Set(paragraphs.flat())) {
    const run = await renderRun(word, BASE, MONGOL_FAMILY, INK);
    widths.set(word, run.width);
  }

  let chosen: { size: number; columns: Column[] } | null = null;
  for (let size = MAX_FONT; size >= MIN_FONT; size -= FONT_STEP) {
    const columns = wrap(paragraphs, widths, size / BASE, TEXT_HEIGHT);
    if (!columns) continue;
    if (columns.length * size * COLUMN_PITCH <= TEXT_WIDTH) {
      chosen = { size, columns };
      break;
    }
  }

  // Ямар ч хэмжээгээр багтсангүй — зайгүй урт «үг» (гараа гулсуулсан хэрэглэгч,
  // эсвэл 40 үсэгт нийлмэл үг) хуваагдах цэггүй тул хаана ч тохирохгүй.
  // Ийм оролт дээр алдаа шидэх нь буруу: хамгийн жижиг хэмжээгээр байрлуулаад
  // хэтэрсэн баганыг нь шахна.
  chosen ??= {
    size: MIN_FONT,
    columns: wrap(paragraphs, widths, MIN_FONT / BASE, TEXT_HEIGHT, false) ?? [],
  };

  const { size, columns } = chosen;
  if (columns.length === 0) throw new Error("Зурах монгол бичиг хоосон байна");

  // Багана нь хэвтээ зайдаа багтах ёстой. Ер нь `size * COLUMN_PITCH` боловч
  // багана хэт олон бол шахна — эс бөгөөс сүүлийн багана хүрээнээс халина.
  const pitch = Math.min(size * COLUMN_PITCH, TEXT_WIDTH / columns.length);

  const rendered = await Promise.all(
    columns.map(async (column) =>
      // Өндрийг нь баталгаатай хумина: багтаагүй наалтыг sharp алдаа гэж үзэх
      // бөгөөд `wrap`-ын сул горим нь хэтэрсэн багана гаргаж болно.
      fit(
        await toColumn(
          await renderRun(column.join(" "), size, MONGOL_FAMILY, INK),
        ),
        SIZE,
        TEXT_HEIGHT,
      ),
    ),
  );

  const tallest = Math.max(...rendered.map((column) => column.height), 0);
  const blockTop = Math.round(TEXT_TOP + (TEXT_HEIGHT - tallest) / 2);
  const blockLeft = (SIZE - columns.length * pitch) / 2;

  const overlays: sharp.OverlayOptions[] = [];
  rendered.forEach((column, index) => {
    if (column.width === 0) return;
    const centre = blockLeft + pitch * (index + 0.5);
    overlays.push({
      input: column.png,
      left: clamp(Math.round(centre - column.width / 2), column.width),
      top: clamp(blockTop, column.height),
    });
  });

  const [captionRaster, brandRaster, tamga] = await Promise.all([
    renderCaption(caption),
    renderRun(brand, BRAND_SIZE, CYRILLIC_FAMILY, "#6f6559"),
    seal(),
  ]);

  if (captionRaster.width > 0) {
    overlays.push({
      input: captionRaster.png,
      left: Math.round((SIZE - captionRaster.width) / 2),
      top: CAPTION_TOP,
    });
  }

  if (brandRaster.width > 0) {
    overlays.push({
      input: brandRaster.png,
      left: Math.round((SIZE - brandRaster.width) / 2),
      top: BRAND_BOTTOM - brandRaster.height,
    });
  }

  if (tamga.width > 0) {
    overlays.push({
      input: tamga.png,
      left: SIZE - SEAL_INSET - tamga.width,
      top: SIZE - SEAL_INSET - tamga.height,
    });
  }

  return sharp(background())
    .composite(overlays)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Наалт зотоноос халихгүй байх — халисан наалтыг sharp алдаа гэж үзнэ. */
function clamp(value: number, extent: number): number {
  return Math.max(0, Math.min(value, SIZE - extent));
}
