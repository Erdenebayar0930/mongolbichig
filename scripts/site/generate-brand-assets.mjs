/**
 * Брэнд-ассет үүсгэгч — `node scripts/generate-brand-assets.mjs`
 *
 * Эх сурвалж:
 *   public/brand/seal.svg — дөрвөлжин тамга (улаан талбай, хар лабиринт хээ)
 *   public/brand/logo.svg — сунасан тамга + монгол бичгийн зурлага (165x147)
 *   src/app/icon.svg      — 16px-д зориулсан хялбаршуулсан тамга
 *
 * Гаргах зүйлс:
 *   src/app/favicon.ico          — 16/32/48, хуучин хөтөч ба Windows таб
 *   src/app/apple-icon.png       — 180x180, iOS "Нүүр дэлгэцэд нэмэх"
 *   src/app/opengraph-image.png  — 1200x630, Facebook/Messenger/LinkedIn
 *   src/app/twitter-image.png    — мөн адил, Twitter/X-д тусад нь шаардлагатай
 *   public/icons/*.png           — PWA manifest-ийн icon-ууд
 *
 * src/app/icon.svg-ийг ГАРААР засварладаг — энэ скрипт түүнийг зөвхөн УНШИНА
 * (favicon.ico-ийн эх болгож), дарж бичихгүй.
 *
 * "any" ба "maskable" icon-ыг нэг файлаар хуваалцаж БОЛОХГҮЙ: Android нь
 * maskable-ыг дурын хэлбэрээр тайрдаг тул захаас 20% аюулгүй бүс хэрэгтэй,
 * харин "any"-г ирмэг хүртэл дүүргэнэ.
 */
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require_ = createRequire(import.meta.url);

// sharp нь package.json-д тунхаглагдаагүй — next-ийн дамжин орох хамаарлаар
// website/node_modules дотор ирдэг. Тэндээс олдохгүй бол эцэг төслөөс хайна
// (root дахь pwa:icons скрипт мөн түүнийг ашигладаг).
let sharp;
try {
  sharp = require_("sharp");
} catch {
  try {
    sharp = require_(require_.resolve("sharp", { paths: [path.join(ROOT, "..")] }));
  } catch {
    console.error(
      "sharp олдсонгүй. website дотор `npm i -D sharp` хийх, эсвэл эцэг төсөлд суулгана уу.",
    );
    process.exit(1);
  }
}

/** Логоны өнгө — public/brand/seal.svg доторхтой ижил байлгана. */
const INK = "#100c08";
const GOLD = "#c9a748";
const IVORY = "#faf5ea";

const BRAND_DIR = path.join(ROOT, "public", "brand");
const APP_DIR = path.join(ROOT, "src", "app");
const ICONS_DIR = path.join(ROOT, "public", "icons");

const svg = (name) => readFile(path.join(BRAND_DIR, name), "utf8");

/** Гадна `<svg>` шошгыг хасаж, зөвхөн дотоод агуулгыг буцаана. */
function innerSvg(source) {
  return source.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
}

/**
 * Тамгыг дөрвөлжин зотон дээр байрлуулна.
 * @param size   эцсийн талын хэмжээ
 * @param inset  зотонгийн хэдэн хувийг захад үлдээх (maskable-д 0.2)
 */
function iconSvg(sealInner, size, inset) {
  const pad = Math.round(size * inset);
  const inner = size - pad * 2;
  const scale = inner / 96; // seal.svg-ийн viewBox нь 96x96
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    `<rect width="${size}" height="${size}" fill="${INK}"/>`,
    `<g transform="translate(${pad} ${pad}) scale(${scale})">${sealInner}</g>`,
    `</svg>`,
  ].join("");
}

/** Нийгмийн сүлжээнд хуваалцах карт. */
function ogSvg(sealInner, logoInner) {
  const W = 1200;
  const H = 630;
  const sealSize = 220;
  const sealX = 104;
  const sealY = Math.round((H - sealSize) / 2);
  const sealScale = sealSize / 96;
  const textX = sealX + sealSize + 72;

  // logo.svg нь 165x147 — баруун ДЭЭД буланд бүдэг тэмдэг болгож тавина.
  // Доод буланд тавьбал дэд гарчгийн мөртэй мөргөлдөнө (текст 1000px хүрдэг).
  const logoW = 128;
  const logoScale = logoW / 165;
  const logoX = W - 104 - logoW;
  const logoY = 96;

  const serif = "Georgia, &apos;Times New Roman&apos;, serif";
  const sans = "&apos;Segoe UI&apos;, Arial, Helvetica, sans-serif";

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
    `<rect width="${W}" height="${H}" fill="#0e0a06"/>`,
    // Давхар алтан хүрээ — картыг ямар ч дэвсгэр дээр тусгаарлана.
    `<rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="${GOLD}" stroke-opacity="0.45" stroke-width="2"/>`,
    `<rect x="34" y="34" width="${W - 68}" height="${H - 68}" fill="none" stroke="${GOLD}" stroke-opacity="0.18" stroke-width="1"/>`,
    `<g transform="translate(${sealX} ${sealY}) scale(${sealScale})">${sealInner}</g>`,
    `<text x="${textX}" y="${H / 2 - 40}" fill="${IVORY}" font-family="${serif}" font-size="78" font-weight="700">Уран бичлэг</text>`,
    `<text x="${textX}" y="${H / 2 + 30}" fill="${GOLD}" font-family="${serif}" font-size="44">Монгол өв соёл</text>`,
    `<line x1="${textX}" y1="${H / 2 + 66}" x2="${textX + 300}" y2="${H / 2 + 66}" stroke="${GOLD}" stroke-opacity="0.5" stroke-width="2"/>`,
    `<text x="${textX}" y="${H / 2 + 120}" fill="${IVORY}" fill-opacity="0.72" font-family="${sans}" font-size="29">Сургалт · Захиалгат бүтээл · Бичгийн хэрэгсэл</text>`,
    `<g transform="translate(${logoX} ${logoY}) scale(${logoScale})" opacity="0.45">${logoInner}</g>`,
    `</svg>`,
  ].join("");
}

/** PNG-үүдийг .ico сав дотор багцлана (Vista+ ба бүх орчин үеийн хөтөч уншина). */
function buildIco(pngs) {
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // төрөл: icon
  header.writeUInt16LE(count, 4);

  const entries = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;

  pngs.forEach(({ size, data }, i) => {
    const e = i * 16;
    entries.writeUInt8(size >= 256 ? 0 : size, e + 0); // өргөн (0 = 256)
    entries.writeUInt8(size >= 256 ? 0 : size, e + 1); // өндөр
    entries.writeUInt8(0, e + 2); // палитрын өнгө: жинхэнэ өнгөт тул 0
    entries.writeUInt8(0, e + 3); // reserved
    entries.writeUInt16LE(1, e + 4); // color planes
    entries.writeUInt16LE(32, e + 6); // бит/цэг
    entries.writeUInt32LE(data.length, e + 8);
    entries.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });

  return Buffer.concat([header, entries, ...pngs.map((p) => p.data)]);
}

const png = (source, size) =>
  sharp(Buffer.from(source)).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

/**
 * Жижиг icon-ыг ЯГ хэрэгтэй хэмжээгээр нь растержуулна — эхлээд том зураад
 * дараа нь буулгавал resize-ийн шүүлтүүр торонд тааруулсан ирмэгийг дахин
 * бүдгэрүүлнэ. icon.svg нь 16px-ийн торонд зориулж зохиогдсон тул түүнийг
 * шууд зурах нь хамгийн тод үр дүн өгнө.
 */
const pngExact = (source) => sharp(Buffer.from(source)).png({ compressionLevel: 9 }).toBuffer();

async function main() {
  const sealInner = innerSvg(await svg("seal.svg"));
  const logoInner = innerSvg(await svg("logo.svg"));
  // 16-48px дээр бүтэн лабиринт нийлж бараан толбо болдог тул тэнд
  // хялбаршуулсан тамгыг (icon.svg) ашиглана — эх нь нэг газар байхын тулд
  // хуулбарлахгүй, шууд уншина.
  const markInner = innerSvg(await readFile(path.join(APP_DIR, "icon.svg"), "utf8"));

  await mkdir(ICONS_DIR, { recursive: true });

  // --- favicon.ico -------------------------------------------------------
  // Жижиг хэмжээнд захын нэмэлт зай хэрэггүй — тамгыг ирмэг хүртэл дүүргэнэ.
  const icoPngs = [];
  for (const size of [16, 32, 48]) {
    icoPngs.push({ size, data: await pngExact(iconSvg(markInner, size, 0)) });
  }
  await writeFile(path.join(APP_DIR, "favicon.ico"), buildIco(icoPngs));

  // --- apple-icon --------------------------------------------------------
  // iOS өөрөө булан мурийлгадаг тул бага зэргийн зайтай, ирмэг хүртэл дүүрэн.
  await writeFile(
    path.join(APP_DIR, "apple-icon.png"),
    await png(iconSvg(sealInner, 1440, 0.06), 180),
  );

  // --- PWA icons ---------------------------------------------------------
  const pwa = [
    ["icon-192.png", 192, 0],
    ["icon-512.png", 512, 0],
    ["icon-maskable-192.png", 192, 0.2],
    ["icon-maskable-512.png", 512, 0.2],
  ];
  for (const [name, size, inset] of pwa) {
    await writeFile(path.join(ICONS_DIR, name), await png(iconSvg(sealInner, size * 4, inset), size));
  }

  // --- Хуваалцах карт ----------------------------------------------------
  const og = await sharp(Buffer.from(ogSvg(sealInner, logoInner)))
    .resize(1200, 630)
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(path.join(APP_DIR, "opengraph-image.png"), og);
  await writeFile(path.join(APP_DIR, "twitter-image.png"), og);

  console.log("Бэлэн:");
  console.log("  src/app/favicon.ico             (16/32/48)");
  console.log("  src/app/apple-icon.png          (180x180)");
  console.log("  src/app/opengraph-image.png     (1200x630)");
  console.log("  src/app/twitter-image.png       (1200x630)");
  for (const [n] of pwa) console.log(`  public/icons/${n}`);
}

await main();
