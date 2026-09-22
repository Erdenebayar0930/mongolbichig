import "server-only";

import { and, asc, desc, eq, gt, like, ne, or, sql } from "drizzle-orm";

import { db } from "./db";
import {
  siteCourses,
  siteEnrollments,
  siteNews,
  siteOrderItems,
  siteOrders,
  siteProducts,
  siteSettings,
  siteToli,
  type SiteCourse,
  type SiteNews,
  type SiteOrderWithItems,
  type SiteProduct,
} from "./db/schema";
import {
  DEFAULT_SETTINGS,
  SETTING_KEYS,
  type SettingKey,
  type Settings,
} from "./settings";

/**
 * DB унасан ч (хүснэгт үүсгээгүй, сервер унтарсан) хуудас 500 өгөхгүй байх
 * зорилготой хамгаалалт. Алдааг консолд бичээд хоосон утга буцаана.
 *
 * ⚠️ Зөвхөн **уншилтад**. Бичилтэд хэрэглэвэл захиалга алдагдсаныг
 * хэрэглэгчид «амжилттай» гэж хэлнэ — тиймээс actions талд safe хэрэглэхгүй.
 */
async function safe<T>(label: string, run: () => Promise<T>, fallback: T) {
  try {
    return await run();
  } catch (error) {
    console.error(`[queries] ${label}:`, (error as Error).message);
    return fallback;
  }
}

const publishedCourse = eq(siteCourses.status, "published");
const publishedProduct = eq(siteProducts.status, "published");
const publishedNews = eq(siteNews.status, "published");

/* -------------------------------------------------------------------------- */
/* Тохиргоо                                                                    */
/* -------------------------------------------------------------------------- */

/** DB дэх утга дутсан түлхүүрийг үндсэн утгаар нөхнө */
export function getSettings(): Promise<Settings> {
  return safe(
    "getSettings",
    async () => {
      const rows = await db.select().from(siteSettings);
      const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));

      return Object.fromEntries(
        SETTING_KEYS.map((key) => [
          key,
          stored[key]?.trim() ? stored[key] : DEFAULT_SETTINGS[key],
        ])
      ) as Settings;
    },
    DEFAULT_SETTINGS
  );
}

/* -------------------------------------------------------------------------- */
/* Сургалт                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Нээлттэй сургалтууд. Эхлэх огноо ойртсоноор нь эрэмбэлнэ — огноогүй нь
 * («тасралтгүй элсэлттэй») хамгийн ард.
 */
export function getCourses(
  options: { limit?: number; level?: string } = {}
): Promise<SiteCourse[]> {
  const { limit = 24, level } = options;

  return safe(
    "getCourses",
    () =>
      db
        .select()
        .from(siteCourses)
        .where(
          level
            ? and(publishedCourse, eq(siteCourses.level, level))
            : publishedCourse
        )
        .orderBy(
          asc(siteCourses.sortOrder),
          // ⚠ MySQL-д `nulls last` байхгүй бөгөөд NULL нь анхдагчаар ЭХЭНД
          // эрэмбэлэгддэг. «Тасралтгүй элсэлттэй» (огноогүй) сургалт
          // жагсаалтын ТЭРГҮҮНД гарах нь буруу тул NULL-ыг 1 болгож эхлээд
          // эрэмбэлээд, дараа нь огноогоор эрэмбэлнэ.
          sql`${siteCourses.startDate} is null asc`,
          asc(siteCourses.startDate),
          desc(siteCourses.createdAt)
        )
        .limit(limit),
    []
  );
}

export function getFeaturedCourses(limit = 4): Promise<SiteCourse[]> {
  return safe(
    "getFeaturedCourses",
    () =>
      db
        .select()
        .from(siteCourses)
        .where(and(publishedCourse, eq(siteCourses.featured, true)))
        .orderBy(asc(siteCourses.sortOrder), desc(siteCourses.createdAt))
        .limit(limit),
    []
  );
}

export function getCourseBySlug(slug: string): Promise<SiteCourse | null> {
  return safe(
    "getCourseBySlug",
    async () => {
      const [row] = await db
        .select()
        .from(siteCourses)
        .where(and(publishedCourse, eq(siteCourses.slug, slug)))
        .limit(1);
      return row ?? null;
    },
    null
  );
}

export function getRelatedCourses(
  course: SiteCourse,
  limit = 3
): Promise<SiteCourse[]> {
  return safe(
    "getRelatedCourses",
    () =>
      db
        .select()
        .from(siteCourses)
        .where(and(publishedCourse, ne(siteCourses.id, course.id)))
        .orderBy(asc(siteCourses.sortOrder), desc(siteCourses.createdAt))
        .limit(limit),
    []
  );
}

/* -------------------------------------------------------------------------- */
/* Дэлгүүр                                                                     */
/* -------------------------------------------------------------------------- */

export function getProducts(
  options: { limit?: number; category?: string } = {}
): Promise<SiteProduct[]> {
  const { limit = 48, category } = options;

  return safe(
    "getProducts",
    () =>
      db
        .select()
        .from(siteProducts)
        .where(
          category
            ? and(publishedProduct, eq(siteProducts.category, category))
            : publishedProduct
        )
        .orderBy(asc(siteProducts.sortOrder), desc(siteProducts.createdAt))
        .limit(limit),
    []
  );
}

export function getFeaturedProducts(limit = 4): Promise<SiteProduct[]> {
  return safe(
    "getFeaturedProducts",
    () =>
      db
        .select()
        .from(siteProducts)
        .where(and(publishedProduct, eq(siteProducts.featured, true)))
        .orderBy(asc(siteProducts.sortOrder), desc(siteProducts.createdAt))
        .limit(limit),
    []
  );
}

export function getProductBySlug(slug: string): Promise<SiteProduct | null> {
  return safe(
    "getProductBySlug",
    async () => {
      const [row] = await db
        .select()
        .from(siteProducts)
        .where(and(publishedProduct, eq(siteProducts.slug, slug)))
        .limit(1);
      return row ?? null;
    },
    null
  );
}

export function getRelatedProducts(
  product: SiteProduct,
  limit = 4
): Promise<SiteProduct[]> {
  return safe(
    "getRelatedProducts",
    () =>
      db
        .select()
        .from(siteProducts)
        .where(
          and(
            publishedProduct,
            eq(siteProducts.category, product.category),
            ne(siteProducts.id, product.id)
          )
        )
        .orderBy(asc(siteProducts.sortOrder))
        .limit(limit),
    []
  );
}

/** Дэлгүүрийн шүүлтүүрт — ангилал бүрийн тоо */
export function getProductCounts(): Promise<Record<string, number>> {
  return safe(
    "getProductCounts",
    async () => {
      const rows = await db
        .select({
          category: siteProducts.category,
          count: sql<number>`cast(count(*) as signed)`,
        })
        .from(siteProducts)
        .where(publishedProduct)
        .groupBy(siteProducts.category);

      return Object.fromEntries(rows.map((row) => [row.category, row.count]));
    },
    {}
  );
}

/**
 * Сагсны мөрүүдийг үнэлэхэд — slug-аар нь бодит бүтээгдэхүүнийг авна.
 * Клиентээс ирсэн үнэд хэзээ ч итгэхгүй.
 */
export function getProductsBySlugs(slugs: string[]): Promise<SiteProduct[]> {
  if (slugs.length === 0) return Promise.resolve([]);

  return safe(
    "getProductsBySlugs",
    () =>
      db
        .select()
        .from(siteProducts)
        .where(
          and(
            publishedProduct,
            or(...slugs.map((slug) => eq(siteProducts.slug, slug)))
          )
        ),
    []
  );
}

/* -------------------------------------------------------------------------- */
/* Мэдээ                                                                       */
/* -------------------------------------------------------------------------- */

export function getNews(limit = 12, offset = 0): Promise<SiteNews[]> {
  return safe(
    "getNews",
    () =>
      db
        .select()
        .from(siteNews)
        .where(publishedNews)
        .orderBy(desc(siteNews.publishedAt))
        .limit(limit)
        .offset(offset),
    []
  );
}

export function getNewsBySlug(slug: string): Promise<SiteNews | null> {
  return safe(
    "getNewsBySlug",
    async () => {
      const [row] = await db
        .select()
        .from(siteNews)
        .where(and(publishedNews, eq(siteNews.slug, slug)))
        .limit(1);
      return row ?? null;
    },
    null
  );
}

export function getRelatedNews(
  post: SiteNews,
  limit = 3
): Promise<SiteNews[]> {
  return safe(
    "getRelatedNews",
    () =>
      db
        .select()
        .from(siteNews)
        .where(and(publishedNews, ne(siteNews.id, post.id)))
        .orderBy(desc(siteNews.publishedAt))
        .limit(limit),
    []
  );
}

export function bumpNewsView(id: string) {
  return safe(
    "bumpNewsView",
    async () => {
      await db
        .update(siteNews)
        .set({ viewCount: sql`${siteNews.viewCount} + 1` })
        .where(eq(siteNews.id, id));
    },
    undefined
  );
}

/* -------------------------------------------------------------------------- */
/* Хайлт                                                                       */
/* -------------------------------------------------------------------------- */

export type SearchResults = {
  courses: SiteCourse[];
  products: SiteProduct[];
  news: SiteNews[];
};

export function search(term: string): Promise<SearchResults> {
  const needle = `%${term.trim()}%`;

  return safe(
    "search",
    async () => {
      const [courses, products, news] = await Promise.all([
        db
          .select()
          .from(siteCourses)
          .where(
            and(
              publishedCourse,
              or(
                like(siteCourses.title, needle),
                like(siteCourses.summary, needle),
                like(siteCourses.body, needle)
              )
            )
          )
          .limit(12),
        db
          .select()
          .from(siteProducts)
          .where(
            and(
              publishedProduct,
              or(
                like(siteProducts.name, needle),
                like(siteProducts.summary, needle),
                like(siteProducts.body, needle)
              )
            )
          )
          .limit(12),
        db
          .select()
          .from(siteNews)
          .where(
            and(
              publishedNews,
              or(
                like(siteNews.title, needle),
                like(siteNews.excerpt, needle),
                like(siteNews.body, needle)
              )
            )
          )
          .orderBy(desc(siteNews.publishedAt))
          .limit(12),
      ]);

      return { courses, products, news };
    },
    { courses: [], products: [], news: [] }
  );
}

/* -------------------------------------------------------------------------- */
/* Захиалга — нийтэд нээлттэй тал                                              */
/* -------------------------------------------------------------------------- */

/**
 * Захиалгын баримт. Дугаарыг мэдэж байгаа хүн үзнэ — нэвтрэх шаардлагагүй,
 * учир нь дугаар нь таамаглахад хэцүү санамсаргүй хэсэгтэй.
 */
export function getOrderByNo(
  orderNo: string
): Promise<SiteOrderWithItems | null> {
  return safe(
    "getOrderByNo",
    async () => {
      const [order] = await db
        .select()
        .from(siteOrders)
        .where(eq(siteOrders.orderNo, orderNo))
        .limit(1);

      if (!order) return null;

      const items = await db
        .select()
        .from(siteOrderItems)
        .where(eq(siteOrderItems.orderId, order.id));

      return { ...order, items };
    },
    null
  );
}

/* -------------------------------------------------------------------------- */
/* Админ                                                                       */
/* -------------------------------------------------------------------------- */

export function adminListCourses(): Promise<SiteCourse[]> {
  return safe(
    "adminListCourses",
    () =>
      db
        .select()
        .from(siteCourses)
        .orderBy(asc(siteCourses.sortOrder), desc(siteCourses.createdAt)),
    []
  );
}

export function adminGetCourse(id: string): Promise<SiteCourse | null> {
  return safe(
    "adminGetCourse",
    async () => {
      const [row] = await db
        .select()
        .from(siteCourses)
        .where(eq(siteCourses.id, id))
        .limit(1);
      return row ?? null;
    },
    null
  );
}

export function adminListProducts(): Promise<SiteProduct[]> {
  return safe(
    "adminListProducts",
    () =>
      db
        .select()
        .from(siteProducts)
        .orderBy(asc(siteProducts.sortOrder), desc(siteProducts.createdAt)),
    []
  );
}

export function adminGetProduct(id: string): Promise<SiteProduct | null> {
  return safe(
    "adminGetProduct",
    async () => {
      const [row] = await db
        .select()
        .from(siteProducts)
        .where(eq(siteProducts.id, id))
        .limit(1);
      return row ?? null;
    },
    null
  );
}

export function adminListNews(): Promise<SiteNews[]> {
  return safe(
    "adminListNews",
    () => db.select().from(siteNews).orderBy(desc(siteNews.publishedAt)),
    []
  );
}

export function adminGetNews(id: string): Promise<SiteNews | null> {
  return safe(
    "adminGetNews",
    async () => {
      const [row] = await db
        .select()
        .from(siteNews)
        .where(eq(siteNews.id, id))
        .limit(1);
      return row ?? null;
    },
    null
  );
}

export function adminListOrders(status?: string) {
  return safe(
    "adminListOrders",
    () =>
      db
        .select()
        .from(siteOrders)
        .where(status ? eq(siteOrders.status, status) : undefined)
        .orderBy(desc(siteOrders.createdAt))
        .limit(200),
    []
  );
}

export function adminGetOrder(id: string): Promise<SiteOrderWithItems | null> {
  return safe(
    "adminGetOrder",
    async () => {
      const [order] = await db
        .select()
        .from(siteOrders)
        .where(eq(siteOrders.id, id))
        .limit(1);

      if (!order) return null;

      const items = await db
        .select()
        .from(siteOrderItems)
        .where(eq(siteOrderItems.orderId, order.id));

      return { ...order, items };
    },
    null
  );
}

export function adminListEnrollments() {
  return safe(
    "adminListEnrollments",
    () =>
      db
        .select()
        .from(siteEnrollments)
        .orderBy(desc(siteEnrollments.createdAt))
        .limit(300),
    []
  );
}

export type AdminStats = {
  courses: number;
  products: number;
  newOrders: number;
  newEnrollments: number;
  revenue: number;
};

/**
 * Хяналтын самбарын тоонууд. Таван тусдаа `count(*)`-ыг нэг явалтад авахын
 * тулд түүхий SQL бичив — drizzle-ийн select builder нь FROM-гүй асуулгыг
 * дэмждэггүй.
 */
export function adminStats(): Promise<AdminStats> {
  return safe(
    "adminStats",
    async () => {
      /**
       * ⚠ MySQL дээр давхар хашилт нь ИДЕНТИФИКАТОР биш МӨРИЙН утга
       * (ANSI_QUOTES асаалттай биснээс бусад үед). Тиймээс багана нэрийг
       * хашилтгүй бичив — кодын талд яг ийм үсгийн хэлбэрээр буцна.
       *
       * mysql2 нь `[rows, fields]` хос буцаадаг тул эхний элементийг авна.
       */
      const [rows] = await db.execute<AdminStats[]>(sql`
        select
          cast((select count(*) from ${siteCourses}) as signed) as courses,
          cast((select count(*) from ${siteProducts}) as signed) as products,
          cast((select count(*) from ${siteOrders} where status = 'new') as signed) as newOrders,
          cast((select count(*) from ${siteEnrollments} where status = 'new') as signed) as newEnrollments,
          cast((select coalesce(sum(total), 0) from ${siteOrders}
            where status in ('paid', 'shipped', 'done')) as signed) as revenue
      `);

      return (rows as unknown as AdminStats[])[0];
    },
    { courses: 0, products: 0, newOrders: 0, newEnrollments: 0, revenue: 0 }
  );
}

/** Дэлгүүрт «Үлдэгдэл дуусаж байна» анхааруулга */
export function adminLowStock(): Promise<SiteProduct[]> {
  return safe(
    "adminLowStock",
    () =>
      db
        .select()
        .from(siteProducts)
        .where(and(publishedProduct, gt(siteProducts.stock, -1)))
        .orderBy(asc(siteProducts.stock))
        .limit(5),
    []
  );
}

/* -------------------------------------------------------------------------- */
/* Толь                                                                        */
/* -------------------------------------------------------------------------- */

export type ToliEntry = {
  ugId: number;
  cyrillic: string;
  mongol: string;
};

/**
 * `LIKE`-д тусгай утгатай тэмдэгтүүдийг далдална. Хэрэглэгч «10%» гэж
 * хайвал энэ нь «10-аар эхэлсэн юу ч бай» биш, яг «10%» гэсэн үг байх ёстой.
 * Далдлах тэмдэгтээ асуулга бүрт `escape '!'` гэж зарлана — анхдагч тэмдэглэгээ
 * нь `\` бөгөөд TS мөрөнд давхар далдлагдаж будлиан үүсгэдэг.
 */
const ESCAPE_CHAR = "!";

function likePrefix(term: string): string {
  return term.replace(/[%_!]/g, (ch) => ESCAPE_CHAR + ch) + "%";
}

/** Монгол цагаан толгой — үсгээр нэгжих холбоосуудад. */
export const TOLI_LETTERS = [
  ..."абвгдеёжзийклмноөпрстуүфхцчшщъыьэюя",
] as const;

/**
 * ⚠ Толинд нэг кирилл үг ОЛОН бичлэгтэй байдаг (омоним: «гал» дөрвөн удаа).
 * Тэдгээрийн монгол бичлэг нь ихэнхдээ ЯГ ИЖИЛ — ялгаа нь зөвхөн утгад, харин
 * утгын тайлбарыг бид хураагаагүй. Тиймээс шүүлтгүй үзүүлбэл ижилхэн дөрвөн
 * хөзөр дараалж, толь эвдэрсэн мэт харагдана.
 *
 * (cyrillic, mongol) хосоор бүлэглэх нь ЯЛГААТАЙ бичлэг бүрээс нэгийг
 * үлдээнэ: «гал» нэг хөзөр болж хураагдана, харин «аа» нь ᠠ᠋ / ᠠ / ᠠᠭ᠎ᠠ
 * гэсэн гурван жинхэнэ өөр бичлэгээ хадгална. 59,873 бичлэг → 54,118 нэгж.
 *
 * ⚠ MySQL-д Postgres-ийн `distinct on` БАЙХГҮЙ. Оронд нь `group by` дээр
 * `min(ug_id)` авна — `distinct on` нь `order by ..., ug_id asc`-тай хосолж
 * яг үүнтэй ижил үр дүн өгдөг байсан: бүлэг тус бүрээс эх толинд түрүүлж
 * бүртгэгдсэнийг нь сонгоно.
 */
function distinctSpellings() {
  return db.select({
    ugId: sql<number>`cast(min(${siteToli.ugId}) as signed)`,
    cyrillic: siteToli.cyrillic,
    mongol: siteToli.mongol,
  });
}

export type ToliLookup = {
  /** Яг тэр үг — өөр бичлэгтэй омоним байвал хэд хэдэн мөр */
  exact: ToliEntry[];
  /** Мөн ийм угтвартай бусад үг (яг таарсныг нь хасна) */
  similar: ToliEntry[];
};

/**
 * Хайлтын үр дүн. Яг таарсныг угтвартайгаас нь ТУСАД нь буцаана — «монгол»
 * гэж хайсан хүнд «монголжуулах» биш «монгол» хэрэгтэй, гэхдээ хажууд нь
 * ураг төрлийн үгс харагдвал толь мэт эргэлдэж үзэхэд тустай.
 */
export function toliLookup(term: string, limit = 40): Promise<ToliLookup> {
  const needle = term.trim().toLowerCase();
  if (!needle) return Promise.resolve({ exact: [], similar: [] });

  return safe(
    "toliLookup",
    async () => {
      const [exact, prefix] = await Promise.all([
        distinctSpellings()
          .from(siteToli)
          .where(eq(siteToli.cyrillic, needle))
          .groupBy(siteToli.cyrillic, siteToli.mongol)
          .orderBy(asc(siteToli.cyrillic), asc(siteToli.mongol)),
        // `LIKE 'мон%'` нь угтвараар хайдаг тул `site_toli_cyrillic_idx`-ийг
        // ашиглана — MySQL-ийн utf8mb4 collation дээр нэмэлт индекс
        // шаардлагагүй (Postgres дээр `text_pattern_ops` хэрэгтэй байсан).
        distinctSpellings()
          .from(siteToli)
          .where(
            sql`${siteToli.cyrillic} like ${likePrefix(needle)} escape ${ESCAPE_CHAR}`
          )
          .groupBy(siteToli.cyrillic, siteToli.mongol)
          .orderBy(asc(siteToli.cyrillic), asc(siteToli.mongol))
          .limit(limit + 8),
      ]);

      return {
        // Эх толийн дугаараар — түрүүлж бүртгэгдсэн нь үндсэн утга.
        exact: [...exact].sort((a, b) => a.ugId - b.ugId),
        similar: prefix.filter((row) => row.cyrillic !== needle).slice(0, limit),
      };
    },
    { exact: [], similar: [] }
  );
}

export type ToliPage = {
  entries: ToliEntry[];
  total: number;
};

/**
 * Нэг үсгээр эхэлсэн үгсийг хуудаслан буцаана.
 *
 * Эрэмбийг DB-ийн collation хийнэ — тэр нь санамсаргүйгээр яг монгол цагаан
 * толгойн дараалал өгдөг (ө нь о-гийн дараа, ү нь у-гийн дараа). Кодын
 * дарааллаар (`C` collation) эрэмбэлбэл ө, ү нь жагсаалтын хамгийн сүүлд
 * тусдаа овоо болж хаягдана.
 */
export function toliByLetter(
  letter: string,
  page = 0,
  perPage = 60
): Promise<ToliPage> {
  const first = letter.trim().toLowerCase().slice(0, 1);
  if (!first) return Promise.resolve({ entries: [], total: 0 });

  const match = sql`${siteToli.cyrillic} like ${likePrefix(first)} escape ${ESCAPE_CHAR}`;

  return safe(
    "toliByLetter",
    async () => {
      const [entries, counted] = await Promise.all([
        distinctSpellings()
          .from(siteToli)
          .where(match)
          .groupBy(siteToli.cyrillic, siteToli.mongol)
          .orderBy(asc(siteToli.cyrillic), asc(siteToli.mongol))
          .limit(perPage)
          .offset(page * perPage),
        // Тоолол нь жагсаалттайгаа ижил шүүлттэй байх ЁСТОЙ — эс бөгөөс
        // сүүлийн хуудас хоосон гарч, «60 үг» гэж бичээд 48-ыг үзүүлнэ.
        db
          .select({
            n: sql<number>`cast(count(distinct ${siteToli.cyrillic}, ${siteToli.mongol}) as signed)`,
          })
          .from(siteToli)
          .where(match),
      ]);

      return { entries, total: counted[0]?.n ?? 0 };
    },
    { entries: [], total: 0 }
  );
}

/**
 * Толийн хэмжээ — ҮЗҮҮЛЭХ нэгжээр (ялгаатай кирилл+бичлэг хос), нийт мөрөөр
 * биш. Хуудас дээр бичсэн тоо нь хүн нэгжиж чадах зүйлтэйгээ таарах ёстой:
 * 59,873 мөр байдаг ч давхардсан бичлэгийг хурааснаар 54,118 болно.
 */
export function toliCount(): Promise<number> {
  return safe(
    "toliCount",
    async () => {
      const rows = await db
        .select({
          n: sql<number>`cast(count(distinct ${siteToli.cyrillic}, ${siteToli.mongol}) as signed)`,
        })
        .from(siteToli);
      return rows[0]?.n ?? 0;
    },
    0
  );
}

export type { SettingKey };
