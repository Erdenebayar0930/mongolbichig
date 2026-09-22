/**
 * Жишиг контентыг Postgres руу бичнэ.
 *
 *   npm run db:push   # хүснэгтүүдийг үүсгэнэ (site_* л хөндөнө)
 *   npm run db:seed   # энэ скрипт
 *
 * Дахин ажиллуулахад аюулгүй: slug-аар нь upsert хийдэг тул давхардахгүй.
 * ⚠️ Гараар оруулсан өөрчлөлт дарагдана — жинхэнэ контент орсны дараа
 * дахин бүү ажиллуул.
 *
 * Бичвэрүүд нь **загвар** юм. Facebook хуудасны жинхэнэ мэдээллээр
 * (үнэ, хуваарь, утас) админ панелиас солино уу.
 */
import { readFileSync } from "node:fs";

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

import { createDbPool, resolveDatabaseUrl } from "../../src/lib/db/createPool";

import {
  siteCourses,
  siteNews,
  siteProducts,
  siteSettings,
} from "../../src/lib/site/db/schema";
import { DEFAULT_SETTINGS, SETTING_KEYS } from "../../src/lib/site/settings";

// tsx --env-file=.env.local уншаагүй тохиолдолд эцэг фолдерынхыг оролдоно.
if (!process.env.DATABASE_URL) {
  for (const file of [".env.local", "../.env.local"]) {
    try {
      for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
        if (!match) continue;

        const [, key, rawValue] = match;
        if (!process.env[key]) {
          process.env[key] = rawValue.trim().replace(/^["']|["']$/g, "");
        }
      }
      if (process.env.DATABASE_URL) break;
    } catch {
      // дараагийн файлыг оролдоно
    }
  }
}

/** Өнөөдрөөс хойш `days` хоногийн дараах өдөр — "2026-09-15" хэлбэрээр */
function inDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const COURSES = [
  {
    slug: "anhan-shatnii-mongol-bichig",
    title: "Анхан шатны монгол бичгийн сургалт",
    level: "anhan",
    format: "tanhim",
    summary:
      "Толгой үсэг таниагүй хүн ч гэсэн 6 долоо хоногийн дараа монгол бичгээр чөлөөтэй бичиж, уншиж сурна.",
    body: `Монгол бичиг бол зөвхөн эртний бичиг биш — өнөөдөр ч ажилладаг, амьд бичиг үсэг юм. Энэ сургалт нь урьдчилсан ямар ч мэдлэг шаардахгүй: эхний хичээлээр цаас, бийр гартаа авч, эхний үсгээ татна.

Хичээл бүр хоёр хэсэгтэй. Эхний хагаст үсгийн бүтэц, дүрмийг тайлбарлаж, хоёрдугаар хагаст багштайгаа хамт дадлага хийнэ. Гэрийн даалгавар долоо хоног бүр өгөгдөж, дараагийн хичээл дээр хамтдаа шалгана.

«Үсэг мэдэхгүй хүн харанхуй өрөөнд суусантай адил.»

Сургалт дуусахад та өөрийн нэр, гэр бүлийнхээ нэр, богино ерөөл, захидлыг монгол бичгээр бичиж чаддаг болно.`,
    syllabus: [
      "Монгол бичгийн товч түүх, босоо бичгийн онцлог",
      "Толгой үсэг: эхний, дундах, эцсийн хэлбэр",
      "Эгшиг зохицол ба үгийн үндэс",
      "Үг холбох дүрэм, залгавар",
      "Бийр барих суурь, шугамын хэмнэл",
      "Өөрийн нэр, ерөөл бичих дадлага",
    ],
    price: 180_000,
    durationWeeks: 6,
    schedule: "Мя, Пү — 19:00–21:00",
    startDate: inDays(21),
    seats: 12,
    seatsTaken: 4,
    location: "Улаанбаатар, СБД, 1-р хороо, Оюутны гудамж",
    coverUrl: "",
    status: "published",
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "uran-bichleg-dund-shat",
    title: "Уран бичлэгийн дунд шат — бийрийн техник",
    level: "dund",
    format: "tanhim",
    summary:
      "Үсэг мэддэг болсон хүнд зориулав. Хэв маяг, шугамын даралт, зохиомжийн хууль.",
    body: `Уран бичлэг нь үсэг зөв бичихээс эхэлдэг ч тэндээ дуусдаггүй. Энэ шатанд бид бийрийн даралт, хурд, амьсгалын хэмнэлийг сурна — яг л хөгжмийн зэмсэг тоглож сурч байгаатай адил.

Оюутан бүр хичээлийн туршид өөрийн гэсэн гар хөгжүүлж, эцэст нь хүрээлүүлэхэд бэлэн нэг бүтээл гүйцэтгэнэ.`,
    syllabus: [
      "Бийрийн даралт, хурдны хяналт",
      "Хэв маягийн ялгаа: тод, хялбар, эвхмэл",
      "Зохиомж — хуудсан дээрх зай, тэнцвэр",
      "Тамга, гарын үсгийн байрлал",
      "Бүтээл гүйцэтгэх, хүрээлэх",
    ],
    price: 240_000,
    durationWeeks: 8,
    schedule: "Бя, Ня — 11:00–13:00",
    startDate: inDays(35),
    seats: 8,
    seatsTaken: 2,
    location: "Улаанбаатар, СБД, 1-р хороо, Оюутны гудамж",
    coverUrl: "/covers/bichleg.svg",
    status: "published",
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "onlain-mongol-bichig",
    title: "Онлайн монгол бичгийн сургалт",
    level: "anhan",
    format: "onlain",
    summary:
      "Хөдөө орон нутаг, гадаадад байгаа хүмүүст. Zoom-оор шууд, бичлэг нь үлдэнэ.",
    body: `Танхимд ирэх боломжгүй хүмүүст зориулсан хувилбар. Хичээл бүр шууд явагдаж, бичлэг нь долоо хоногийн турш нээлттэй байх тул хоцорсон ч гүйцэж болно.

Дадлагын хуудсыг PDF-ээр илгээх бөгөөд та гараар бичээд зургаа явуулахад багш тус бүрчлэн засаж, тайлбар өгнө.`,
    syllabus: [
      "Zoom-оор шууд хичээл, долоо хоногт 2 удаа",
      "PDF дадлагын хуудас",
      "Гэрийн даалгаврын хувь хүний засвар",
      "Хаалттай бүлгийн чат",
    ],
    price: 120_000,
    durationWeeks: 6,
    schedule: "Да, Лх — 20:00–21:30",
    startDate: null,
    seats: 0,
    seatsTaken: 0,
    location: "Онлайн (Zoom)",
    coverUrl: "",
    status: "published",
    featured: false,
    sortOrder: 3,
  },
  {
    slug: "huuhdiin-buleg",
    title: "Хүүхдийн бүлэг — 8-14 нас",
    level: "huuhed",
    format: "tanhim",
    summary:
      "Тоглоом, өнгө, түүхтэй холбосон хөнгөн хэлбэр. Долоо хоногт нэг удаа.",
    body: `Хүүхэд бичиг үсгийг дүрмээр биш, тоглоомоор сурдаг. Энэ бүлэгт бид домог түүх ярьж, түүнийхээ баатруудын нэрийг монгол бичгээр бичиж сурна.

Хичээлийн эцэст хүүхэд бүр өөрийн бичсэн бүтээлээ гэртээ авч харина.`,
    syllabus: [
      "Үсэг таних тоглоом",
      "Өөрийн нэрээ бичих",
      "Домгийн баатруудын нэр",
      "Өнгөт бэхээр зурах, бичих",
    ],
    price: 90_000,
    durationWeeks: 8,
    schedule: "Бямба — 10:00–11:30",
    startDate: inDays(14),
    seats: 10,
    seatsTaken: 7,
    location: "Улаанбаатар, СБД, 1-р хороо, Оюутны гудамж",
    coverUrl: "",
    status: "published",
    featured: false,
    sortOrder: 4,
  },
];

const PRODUCTS = [
  {
    slug: "yerooliin-bichees",
    name: "Захиалгат ерөөлийн бичээс",
    category: "bichleg",
    summary:
      "Хүссэн ерөөл, нэрийг гараар бичиж, хүрээлж өгнө. Хэмжээ 30×60 см.",
    body: `Гэр бүлийн ой, шинэ байшин, хурим, төрсөн өдөр — ямар ч баярт өгөх хамгийн хувийн бэлэг.

Та хүссэн үгээ илгээхэд бид хэв маягийн 2-3 хувилбар санал болгож, сонгосныхоо дагуу гүйцэтгэнэ. Хийгдэх хугацаа 5-7 хоног.

Материал: гар цаас, байгалийн бэх, модон хүрээ.`,
    price: 150_000,
    oldPrice: 0,
    coverUrl: "/covers/bichleg.svg",
    images: [],
    stock: -1,
    status: "published",
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "biir-behnii-bagts",
    name: "Эхлэгчийн бийр, бэхний багц",
    category: "hereglel",
    summary: "Хоёр бийр, бэх, бэхний сав, дадлагын цаас — сургалтад бэлэн.",
    body: `Анхан шатны сургалтад хэрэгтэй бүх зүйл нэг багцад. Тусад нь худалдаж авахаас хямд.

Багцад: дунд зэргийн бийр 1, нарийн бийр 1, шингэн бэх 100мл, керамик бэхний сав, дадлагын цаас 50 хуудас.`,
    price: 65_000,
    oldPrice: 85_000,
    coverUrl: "/covers/hereglel.svg",
    images: [],
    stock: 14,
    status: "published",
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "mongol-bichgiin-garyn-avlaga",
    name: "Монгол бичгийн гарын авлага",
    category: "nom",
    summary: "96 хуудас, дадлагын хуудастай. Сургалтын үндсэн ном.",
    body: `Толгой үсгээс эхлээд үг холбох дүрэм хүртэл алхам алхмаар. Хуудас бүрт хуулж бичих зай үлдээсэн тул тусдаа дэвтэр хэрэггүй.

Сургалтад суусан эсэхээс үл хамааран бие даан суралцахад тохиромжтой.`,
    price: 35_000,
    oldPrice: 0,
    coverUrl: "/covers/nom.svg",
    images: [],
    stock: 40,
    status: "published",
    featured: false,
    sortOrder: 3,
  },
  {
    slug: "ulzii-heetei-temdegleliin-devter",
    name: "Улзий хээтэй тэмдэглэлийн дэвтэр",
    category: "beleg",
    summary: "Гар хийцийн хавтас, 120 хуудас. Босоо бичигт тохирсон зурвастай.",
    body: `Хавтас нь гараар хэвлэсэн улзий хээтэй. Дотор хуудас нь босоо бичигт тохирсон нарийн зурвастай тул монгол бичгээр тэмдэглэл хөтлөхөд эвтэйхэн.

Хэмжээ: A5, 120 хуудас.`,
    price: 28_000,
    oldPrice: 0,
    coverUrl: "/covers/beleg.svg",
    images: [],
    stock: 22,
    status: "published",
    featured: false,
    sortOrder: 4,
  },
  {
    slug: "ner-bichees-jijig",
    name: "Нэрийн бичээс — жижиг хэмжээ",
    category: "bichleg",
    summary: "Ганц нэр, богино үг. Хэмжээ 15×30 см, хүрээтэй.",
    body: `Ажлын ширээ, номын тавиур дээр тавихад тохиромжтой жижиг бүтээл. Хийгдэх хугацаа 3-5 хоног.`,
    price: 65_000,
    oldPrice: 0,
    coverUrl: "/covers/bichleg.svg",
    images: [],
    stock: -1,
    status: "published",
    featured: false,
    sortOrder: 5,
  },
  {
    slug: "chanartai-biir",
    name: "Ямааны ноосон уран бичлэгийн бийр",
    category: "hereglel",
    summary: "Дунд зэргийн зөөлөн. Ахисан шатны дадлагад.",
    body: `Ямааны ноосоор хийсэн, бэхээ сайн хадгалдаг бийр. Даралтаас хамаарч шугамын өргөн мэдэгдэхүйц өөрчлөгддөг тул хэв маяг сурахад тохиромжтой.

Урт: 24 см. Үзүүрийн диаметр: 8 мм.`,
    price: 42_000,
    oldPrice: 0,
    coverUrl: "/covers/hereglel.svg",
    images: [],
    stock: 6,
    status: "published",
    featured: false,
    sortOrder: 6,
  },
];

const NEWS = [
  {
    slug: "yagaad-mongol-bichig-surah-heregtei",
    title: "Яагаад монгол бичиг сурах хэрэгтэй вэ?",
    excerpt:
      "Кирилл бичигтэй зэрэгцэн монгол бичгээ мэдэх нь зүгээр нэг өв хамгаалал биш — сэтгэлгээний өргөжилт.",
    body: `Монгол бичиг бол найман зуун жилийн турш тасралтгүй хэрэглэгдэж ирсэн бичиг үсэг юм. Түүнийг мэдэхгүй бол бид өөрсдийн түүх, уран зохиол, шашны сурвалж бичгүүдийг зөвхөн орчуулгаар л уншина.

Гэхдээ шалтгаан нь зөвхөн түүхэнд байдаггүй. Босоо бичиг нь өөр төрлийн анхаарал шаарддаг — үсэг бүр өмнөх, дараагийнхаасаа хамаарч хэлбэрээ өөрчилдөг тул бичиж байхдаа үгээ бүхэлд нь харах хэрэгтэй болдог.

«Бичиг бол хэлний хувцас.»

Сургалтад ирдэг хүмүүсийн ихэнх нь эхлээд «хэцүү байх болов уу» гэж эмээдэг. Гурав дахь хичээлээр л тэр айдас алга болдог.`,
    coverUrl: "",
    tag: "Нийтлэл",
    featured: true,
  },
  {
    slug: "biir-barih-zov-arga",
    title: "Бийрээ зөв барих — эхний алдаа хамгийн үнэтэй",
    excerpt:
      "Буруу барьсан бийр эхэндээ амархан санагддаг ч хожим засахад хэдэн сар зарцуулагддаг.",
    body: `Хамгийн түгээмэл алдаа бол бийрийг харандаа шиг барих. Тэгвэл бугуй хөшиж, шугамын даралтыг хянах боломжгүй болдог.

Зөв байрлалд бийр босоо, эрхий ба долоовор хуруу нь бариулыг зөөлөн атгаж, үлдсэн гурван хуруу нь ард нь түшинэ. Тохой ширээнээс салангид байх ёстой — хөдөлгөөн нь хуруунаас биш, мөрнөөс эхэлнэ.

Эхний долоо хоногт зүгээр л шулуун шугам татах дасгал хийхэд хангалттай. Уйтгартай санагдаж болох ч энэ дасгал нь дараагийн бүх зүйлийн суурь юм.`,
    coverUrl: "",
    tag: "Зөвлөгөө",
    featured: false,
  },
  {
    slug: "namriin-elselt-negdev",
    title: "Намрын элсэлт нээлээ",
    excerpt:
      "Анхан шат, дунд шат, хүүхдийн бүлэг гурвуулаа шинэ хуваарьтай эхэлж байна.",
    body: `Намрын улирлын бүх бүлэгт элсэлт нээлттэй боллоо. Анхан шатны бүлэг долоо хоногт хоёр удаа оройн цагаар, хүүхдийн бүлэг бямба гаригт хуралдана.

Суудлын тоо хязгаартай тул сургалтын хуудсаар дамжуулан урьдчилан бүртгүүлэхийг зөвлөж байна. Бүртгэлийн дараа бид утсаар холбогдож хуваарь, төлбөрийн мэдээллийг баталгаажуулна.

Хуучин суралцагчид дараагийн шатанд 15% хөнгөлөлттэй хамрагдана.`,
    coverUrl: "",
    tag: "Зар",
    featured: false,
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL олдсонгүй. website/.env.local файлаа шалгана уу (BOM-гүй UTF-8)."
    );
  }

  // Seed нь ганц холболтоор дараалан бичнэ — pool-ыг 1-ээр хязгаарлав.
  const pool = createDbPool(resolveDatabaseUrl()!, 1);
  const db = drizzle(pool, { mode: "default" });

  try {
    for (const course of COURSES) {
      await db
        .insert(siteCourses)
        .values(course)
        .onDuplicateKeyUpdate({ set: { ...course, updatedAt: new Date() } });
    }
    console.log(`✓ ${COURSES.length} сургалт`);

    for (const product of PRODUCTS) {
      await db
        .insert(siteProducts)
        .values(product)
        .onDuplicateKeyUpdate({ set: { ...product, updatedAt: new Date() } });
    }
    console.log(`✓ ${PRODUCTS.length} бүтээгдэхүүн`);

    // Мэдээг өдөр зөрүүлж нийтэлсэн болгоно — бүгд нэг агшинд гарсан бол
    // жагсаалтын эрэмбэ санамсаргүй харагдана.
    for (const [index, post] of NEWS.entries()) {
      const publishedAt = new Date();
      publishedAt.setDate(publishedAt.getDate() - index * 6);

      const values = { ...post, publishedAt, status: "published" };

      await db
        .insert(siteNews)
        .values(values)
        .onDuplicateKeyUpdate({ set: { ...values, updatedAt: new Date() } });
    }
    console.log(`✓ ${NEWS.length} мэдээ`);

    // Тохиргоо: аль хэдийн гараар засчихсан утгыг дарахгүй.
    for (const key of SETTING_KEYS) {
      await db
        .insert(siteSettings)
        .values({ key, value: DEFAULT_SETTINGS[key] })
        // MySQL-д "байхгүй бол л нэмэх" — давхцвал өөрийг нь өөр рүү нь
        // бичих хоосон UPDATE хийж, утгыг нь хөндөхгүй өнгөрнө.
        .onDuplicateKeyUpdate({ set: { key: sql`${siteSettings.key}` } });
    }
    console.log(`✓ ${SETTING_KEYS.length} тохиргоо (байхгүйг нь л нэмэв)`);

    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as signed)` })
      .from(siteCourses);
    console.log(`\nНийт сургалт: ${count}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
