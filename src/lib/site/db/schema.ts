import {
  boolean,
  customType,
  date,
  index,
  int,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * «Уран бичлэг & Монгол өв соёл» сайтын схем.
 *
 * Бүх хүснэгт `site_` угтвартай — dashboard-тай нэг MySQL дээр сууж байгаа
 * тул drizzle.site.config.ts дахь `tablesFilter: ["site_*"]` энэ угтварт
 * тулгуурлаж dashboard-ын хүснэгтүүдийг хамгаална. Шинэ хүснэгт нэмэх бүрдээ
 * угтварыг заавал хадгална.
 *
 * Мөнгөн дүн бүхэлдээ **бүхэл тоо, төгрөгөөр**. Монголд мөнгө хуваагддаггүй
 * тул decimal хэрэггүй — харин float ашиглавал 1_200_000 * 3 мэтийн үржвэрт
 * дугуйруулалтын алдаа орох эрсдэлтэй.
 *
 * MySQL-ийн ялгаатай тал (Postgres-ээс хөрвүүлэхэд анхаарсан зүйлс — dashboard
 * схемийнхтэй ижил зарчим, [src/lib/db/schema.ts](../../db/schema.ts)):
 *
 *  • UUID төрөл байхгүй — `varchar(36)` дээр апп талаас `crypto.randomUUID()`
 *    утга онооно.
 *  • TEXT багана индекслэхэд урьдчилсан урт шаардагддаг тул индекс, unique,
 *    foreign key-д оролцох бүх багана `varchar(n)` байна.
 *  • TEXT / JSON баганад DB талын DEFAULT тавих боломжгүй — `$defaultFn`-ээр
 *    апп талаас анхдагчийг өгнө. Бүх бичилт Drizzle-ээр явдаг тул хангалттай.
 *  • TIMESTAMP дотооддоо UTC-гээр хадгалагдана; холболтын цагийн бүсийг
 *    [createPool.ts](../../db/createPool.ts) UTC болгож тогтоосон.
 */

/** UUID хэлбэрийн үндсэн түлхүүр — MySQL-д төрөл нь байхгүй тул varchar(36) */
const uuidPk = () =>
  varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

/** Бусад хүснэгт рүү заах UUID гадаад түлхүүр */
const uuidRef = (name: string) => varchar(name, { length: 36 });

/**
 * Индекслэгддэг мөрийн дээд урт.
 *
 * utf8mb4 дээр индексийн түлхүүр тэмдэгт тутамд 4 байт эзэлдэг. MySQL 5.7 /
 * MariaDB-ийн хуучин хувилбарууд InnoDB индексийг 767 байтаар хязгаарладаг
 * тул 191 нь аюулгүй дээд хэмжээ (191 × 4 = 764).
 */
const SLUG_LEN = 191;

/** Урт чөлөөт бичвэр — анхдагч нь хоосон мөр (DB default тавих боломжгүй) */
const bodyText = (name: string) =>
  text(name)
    .notNull()
    .$defaultFn(() => "");

/**
 * JSON багана — MySQL болон MariaDB хоёуланд ажиллана.
 *
 * MySQL 8-д JSON нь бие даасан төрөл тул драйвер өөрөө задалж объект өгдөг.
 * MariaDB-д JSON нь LONGTEXT-ийн ӨӨР НЭР бөгөөд драйвер МӨРӨӨР буцаадаг —
 * тэр үед `row.syllabus` нь массив биш мөр болж, `.map()` дуудлагууд унана.
 * Тиймээс мөр ирвэл өөрсдөө задална.
 */
const jsonCol = <T>(name: string) =>
  customType<{ data: T; driverData: string }>({
    dataType: () => "json",
    toDriver: (value: T) => JSON.stringify(value),
    fromDriver: (value: unknown) =>
      typeof value === "string" ? (JSON.parse(value) as T) : (value as T),
  })(name);

/** Үүсгэсэн / зассан огноо — апп талаас онооно (TIMESTAMP-д DEFAULT нэг л удаа) */
const nowCol = (name: string) =>
  timestamp(name)
    .notNull()
    .$defaultFn(() => new Date());

/* -------------------------------------------------------------------------- */
/* Сургалт                                                                     */
/* -------------------------------------------------------------------------- */

/** Монгол бичиг / уран бичлэгийн сургалтын зар */
export const siteCourses = mysqlTable(
  "site_courses",
  {
    id: uuidPk(),
    /** URL-д харагдах нэр: "anhan-shatnii-mongol-bichig" */
    slug: varchar("slug", { length: SLUG_LEN }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    /** anhan | dund | ahisan | huuhed */
    level: varchar("level", { length: 32 }).notNull().default("anhan"),
    /** tanhim | onlain | holimog */
    format: varchar("format", { length: 32 }).notNull().default("tanhim"),
    /** Жагсаалтад гарах богино тайлбар */
    summary: bodyText("summary"),
    /** Дэлгэрэнгүй — мөр бүр нэг догол мөр */
    body: bodyText("body"),
    /** Хөтөлбөрийн сэдвүүд — жагсаалт болж харагдана */
    syllabus: jsonCol<string[]>("syllabus")
      .notNull()
      .$defaultFn(() => []),
    /** Төгрөгөөр. 0 бол «үнэгүй» гэж харуулна */
    price: int("price").notNull().default(0),
    /** Үргэлжлэх хугацаа — 7 хоногоор */
    durationWeeks: int("duration_weeks").notNull().default(4),
    /** Чөлөөт бичвэр: "Мя, Пү — 19:00-21:00" */
    schedule: varchar("schedule", { length: 255 }).notNull().default(""),
    /**
     * `date` төрлийг мөрөөр авна ("2026-09-15"). Цагийн бүстэй timestamp
     * ашиглавал админ `<input type="date">`-д оруулсан өдөр UTC руу хөрвөхдөө
     * нэг хоногоор ухарч харагддаг.
     */
    startDate: date("start_date", { mode: "string" }),
    /** Нийт суудал. 0 бол «хязгааргүй» */
    seats: int("seats").notNull().default(0),
    /** Бүртгэгдсэн тоо — админ гараар засна */
    seatsTaken: int("seats_taken").notNull().default(0),
    location: varchar("location", { length: 255 }).notNull().default(""),
    coverUrl: varchar("cover_url", { length: 1024 }).notNull().default(""),
    /** draft | published */
    status: varchar("status", { length: 32 }).notNull().default("published"),
    /** Нүүрний слайдерт гарах эсэх */
    featured: boolean("featured").notNull().default(false),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: nowCol("created_at"),
    updatedAt: nowCol("updated_at"),
  },
  (table) => [
    uniqueIndex("site_courses_slug_idx").on(table.slug),
    index("site_courses_status_idx").on(table.status),
    index("site_courses_sort_idx").on(table.sortOrder),
  ]
);

/** Сургалтад бүртгүүлэх хүсэлт */
export const siteEnrollments = mysqlTable(
  "site_enrollments",
  {
    id: uuidPk(),
    courseId: uuidRef("course_id").references(() => siteCourses.id, {
      onDelete: "set null",
    }),
    /**
     * Сургалт устсан ч хүсэлтийн түүх уншигдахуйц үлдэх ёстой тул нэрийг
     * хуулбарлаж хадгална.
     */
    courseTitle: varchar("course_title", { length: 255 })
      .notNull()
      .default(""),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    email: varchar("email", { length: 320 }).notNull().default(""),
    note: bodyText("note"),
    /** new | confirmed | cancelled */
    status: varchar("status", { length: 32 }).notNull().default("new"),
    createdAt: nowCol("created_at"),
  },
  (table) => [
    index("site_enrollments_course_idx").on(table.courseId),
    index("site_enrollments_created_idx").on(table.createdAt),
  ]
);

/* -------------------------------------------------------------------------- */
/* Дэлгүүр                                                                     */
/* -------------------------------------------------------------------------- */

/** Захиалгат бүтээл, бичгийн хэрэгсэл, ном */
export const siteProducts = mysqlTable(
  "site_products",
  {
    id: uuidPk(),
    slug: varchar("slug", { length: SLUG_LEN }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    /** bichleg | hereglel | nom | beleg */
    category: varchar("category", { length: 32 }).notNull().default("bichleg"),
    summary: bodyText("summary"),
    body: bodyText("body"),
    price: int("price").notNull().default(0),
    /** Хямдралын өмнөх үнэ. 0 бол хямдралгүй */
    oldPrice: int("old_price").notNull().default(0),
    coverUrl: varchar("cover_url", { length: 1024 }).notNull().default(""),
    /** Нэмэлт зургууд — дэлгэрэнгүй хуудсанд */
    images: jsonCol<string[]>("images")
      .notNull()
      .$defaultFn(() => []),
    /**
     * Үлдэгдэл. `-1` = захиалгаар хийгддэг тул үлдэгдэл хамаагүй
     * (уран бичлэгийн бүтээл ихэвчлэн ийм).
     */
    stock: int("stock").notNull().default(-1),
    /** draft | published */
    status: varchar("status", { length: 32 }).notNull().default("published"),
    featured: boolean("featured").notNull().default(false),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: nowCol("created_at"),
    updatedAt: nowCol("updated_at"),
  },
  (table) => [
    uniqueIndex("site_products_slug_idx").on(table.slug),
    index("site_products_status_idx").on(table.status),
    index("site_products_category_idx").on(table.category),
  ]
);

/** Захиалгын толгой */
export const siteOrders = mysqlTable(
  "site_orders",
  {
    id: uuidPk(),
    /** Хэрэглэгчид хэлэх дугаар: "UB-260817-4F2K" */
    orderNo: varchar("order_no", { length: 32 }).notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    email: varchar("email", { length: 320 }).notNull().default(""),
    address: varchar("address", { length: 512 }).notNull().default(""),
    note: bodyText("note"),
    /** Хүргэлтийн арга: pickup | delivery */
    delivery: varchar("delivery", { length: 32 }).notNull().default("pickup"),
    subtotal: int("subtotal").notNull().default(0),
    shipping: int("shipping").notNull().default(0),
    total: int("total").notNull().default(0),
    /** new | confirmed | paid | shipped | done | cancelled */
    status: varchar("status", { length: 32 }).notNull().default("new"),
    createdAt: nowCol("created_at"),
    updatedAt: nowCol("updated_at"),
  },
  (table) => [
    uniqueIndex("site_orders_no_idx").on(table.orderNo),
    index("site_orders_status_idx").on(table.status),
    index("site_orders_created_idx").on(table.createdAt),
  ]
);

/** Захиалгын мөр */
export const siteOrderItems = mysqlTable(
  "site_order_items",
  {
    id: uuidPk(),
    orderId: uuidRef("order_id")
      .notNull()
      .references(() => siteOrders.id, { onDelete: "cascade" }),
    productId: uuidRef("product_id").references(() => siteProducts.id, {
      onDelete: "set null",
    }),
    /** Захиалгын үеийн нэр, үнэ — бүтээгдэхүүн өөрчлөгдсөн ч хөшинө */
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: SLUG_LEN }).notNull().default(""),
    price: int("price").notNull().default(0),
    qty: int("qty").notNull().default(1),
    lineTotal: int("line_total").notNull().default(0),
  },
  (table) => [index("site_order_items_order_idx").on(table.orderId)]
);

/* -------------------------------------------------------------------------- */
/* Мэдээ, тохиргоо                                                             */
/* -------------------------------------------------------------------------- */

/** Мэдээ, нийтлэл — монгол бичгийн тухай агуулга */
export const siteNews = mysqlTable(
  "site_news",
  {
    id: uuidPk(),
    slug: varchar("slug", { length: SLUG_LEN }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    excerpt: bodyText("excerpt"),
    body: bodyText("body"),
    coverUrl: varchar("cover_url", { length: 1024 }).notNull().default(""),
    /** Чөлөөт шошго: "Түүх", "Зөвлөгөө", "Арга хэмжээ" */
    tag: varchar("tag", { length: 64 }).notNull().default("Мэдээ"),
    author: varchar("author", { length: 255 })
      .notNull()
      .default("Уран бичлэг"),
    /** draft | published */
    status: varchar("status", { length: 32 }).notNull().default("published"),
    featured: boolean("featured").notNull().default(false),
    viewCount: int("view_count").notNull().default(0),
    publishedAt: nowCol("published_at"),
    createdAt: nowCol("created_at"),
    updatedAt: nowCol("updated_at"),
  },
  (table) => [
    uniqueIndex("site_news_slug_idx").on(table.slug),
    index("site_news_published_idx").on(table.publishedAt),
  ]
);

/**
 * Холбоо барих мэдээлэл, дансны дугаар зэрэг — админаас засагдана.
 * Түлхүүрийн жагсаалт `src/lib/site/settings.ts`-д тодорхойлогдсон.
 */
export const siteSettings = mysqlTable("site_settings", {
  key: varchar("key", { length: SLUG_LEN }).primaryKey(),
  value: bodyText("value"),
  updatedAt: nowCol("updated_at"),
});

/* -------------------------------------------------------------------------- */
/* Толь                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Кирилл → монгол бичгийн толь, mongoltoli.mn-ээс хураасан (~150k бичлэг).
 *
 * Яагаад санд вэ: толь нь `mongolLexicon.ts` шиг `"use client"` мод руу орвол
 * БҮХЭЛДЭЭ хөтөч рүү явна. 150k бичлэг нь хэдэн MB — хөрвүүлэгчийн хуудсыг
 * ачаалахын аргагүй болгоно. Тиймээс энд сууж, `/api/toli`-оор багцаар
 * хайгдана. `mongolLexicon.ts` нь багшаар нягталсан цөм үгсийг хадгалсаар
 * үлдэнэ — тэр нь шууд, сүлжээгүй ажилладаг хурдан зам.
 *
 * `cyrillic` нь ЖИЖИГ үсгээр хадгалагдана (эх сурвалж бүгдийг том үсгээр
 * өгдөг) — хайлт нормчлолгүй таарах ёстой.
 *
 * Нэг кирилл үг олон бичлэгтэй байж болно (омоним): `ugId` нь эх толийн
 * дугаар, хамгийн багыг нь үндсэн утга гэж үзнэ.
 */
export const siteToli = mysqlTable(
  "site_toli",
  {
    /** mongoltoli.mn дахь ug_id — эх сурвалж руу буцаж холбох түлхүүр */
    ugId: int("ug_id").primaryKey(),
    /**
     * Хайлт үргэлж энэ баганаар явна. Postgres дээр угтварын хайлтад
     * `text_pattern_ops` нэмэлт индекс шаардлагатай байсан бол MySQL-ийн
     * utf8mb4 collation нь `LIKE 'мон%'`-д индексийг шууд ашигладаг тул
     * нэг индекс хангалттай.
     */
    cyrillic: varchar("cyrillic", { length: SLUG_LEN }).notNull(),
    /** Уламжлалт монгол бичгийн Unicode хэлбэр */
    mongol: varchar("mongol", { length: 255 }).notNull(),
    createdAt: nowCol("created_at"),
  },
  (table) => [
    // Омоним олон мөр буцаана — unique биш энгийн индекс.
    index("site_toli_cyrillic_idx").on(table.cyrillic),
  ]
);

export type SiteToli = typeof siteToli.$inferSelect;
export type SiteCourse = typeof siteCourses.$inferSelect;
export type SiteEnrollment = typeof siteEnrollments.$inferSelect;
export type SiteProduct = typeof siteProducts.$inferSelect;
export type SiteOrder = typeof siteOrders.$inferSelect;
export type SiteOrderItem = typeof siteOrderItems.$inferSelect;
export type SiteOrderWithItems = SiteOrder & { items: SiteOrderItem[] };
export type SiteNews = typeof siteNews.$inferSelect;
