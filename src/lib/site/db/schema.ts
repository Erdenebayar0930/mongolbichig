import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * «Уран бичлэг & Монгол өв соёл» сайтын схем.
 *
 * Бүх хүснэгт `site_` угтвартай — dashboard-тай нэг Postgres дээр сууж байгаа
 * тул drizzle.config.ts дахь `tablesFilter: ["site_*"]` энэ угтварт тулгуурлаж
 * dashboard-ын хүснэгтүүдийг хамгаална. Шинэ хүснэгт нэмэх бүрдээ угтварыг
 * заавал хадгална.
 *
 * Мөнгөн дүн бүхэлдээ **бүхэл тоо, төгрөгөөр**. Монголд мөнгө хуваагддаггүй
 * тул decimal хэрэггүй — харин float ашиглавал 1_200_000 * 3 мэтийн үржвэрт
 * дугуйруулалтын алдаа орох эрсдэлтэй.
 */

/* -------------------------------------------------------------------------- */
/* Сургалт                                                                     */
/* -------------------------------------------------------------------------- */

/** Монгол бичиг / уран бичлэгийн сургалтын зар */
export const siteCourses = pgTable(
  "site_courses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** URL-д харагдах нэр: "anhan-shatnii-mongol-bichig" */
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    /** anhan | dund | ahisan | huuhed */
    level: text("level").notNull().default("anhan"),
    /** tanhim | onlain | holimog */
    format: text("format").notNull().default("tanhim"),
    /** Жагсаалтад гарах богино тайлбар */
    summary: text("summary").notNull().default(""),
    /** Дэлгэрэнгүй — мөр бүр нэг догол мөр */
    body: text("body").notNull().default(""),
    /** Хөтөлбөрийн сэдвүүд — жагсаалт болж харагдана */
    syllabus: jsonb("syllabus").$type<string[]>().notNull().default([]),
    /** Төгрөгөөр. 0 бол «үнэгүй» гэж харуулна */
    price: integer("price").notNull().default(0),
    /** Үргэлжлэх хугацаа — 7 хоногоор */
    durationWeeks: integer("duration_weeks").notNull().default(4),
    /** Чөлөөт бичвэр: "Мя, Пү — 19:00-21:00" */
    schedule: text("schedule").notNull().default(""),
    /**
     * `date` төрлийг мөрөөр авна ("2026-09-15"). Цагийн бүстэй timestamp
     * ашиглавал админ `<input type="date">`-д оруулсан өдөр UTC руу хөрвөхдөө
     * нэг хоногоор ухарч харагддаг.
     */
    startDate: date("start_date"),
    /** Нийт суудал. 0 бол «хязгааргүй» */
    seats: integer("seats").notNull().default(0),
    /** Бүртгэгдсэн тоо — админ гараар засна */
    seatsTaken: integer("seats_taken").notNull().default(0),
    location: text("location").notNull().default(""),
    coverUrl: text("cover_url").notNull().default(""),
    /** draft | published */
    status: text("status").notNull().default("published"),
    /** Нүүрний слайдерт гарах эсэх */
    featured: boolean("featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("site_courses_slug_idx").on(table.slug),
    index("site_courses_status_idx").on(table.status),
    index("site_courses_sort_idx").on(table.sortOrder),
  ]
);

/** Сургалтад бүртгүүлэх хүсэлт */
export const siteEnrollments = pgTable(
  "site_enrollments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id").references(() => siteCourses.id, {
      onDelete: "set null",
    }),
    /**
     * Сургалт устсан ч хүсэлтийн түүх уншигдахуйц үлдэх ёстой тул нэрийг
     * хуулбарлаж хадгална.
     */
    courseTitle: text("course_title").notNull().default(""),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull().default(""),
    note: text("note").notNull().default(""),
    /** new | confirmed | cancelled */
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
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
export const siteProducts = pgTable(
  "site_products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    /** bichleg | hereglel | nom | beleg */
    category: text("category").notNull().default("bichleg"),
    summary: text("summary").notNull().default(""),
    body: text("body").notNull().default(""),
    price: integer("price").notNull().default(0),
    /** Хямдралын өмнөх үнэ. 0 бол хямдралгүй */
    oldPrice: integer("old_price").notNull().default(0),
    coverUrl: text("cover_url").notNull().default(""),
    /** Нэмэлт зургууд — дэлгэрэнгүй хуудсанд */
    images: jsonb("images").$type<string[]>().notNull().default([]),
    /**
     * Үлдэгдэл. `-1` = захиалгаар хийгддэг тул үлдэгдэл хамаагүй
     * (уран бичлэгийн бүтээл ихэвчлэн ийм).
     */
    stock: integer("stock").notNull().default(-1),
    /** draft | published */
    status: text("status").notNull().default("published"),
    featured: boolean("featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("site_products_slug_idx").on(table.slug),
    index("site_products_status_idx").on(table.status),
    index("site_products_category_idx").on(table.category),
  ]
);

/** Захиалгын толгой */
export const siteOrders = pgTable(
  "site_orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Хэрэглэгчид хэлэх дугаар: "UB-260817-4F2K" */
    orderNo: text("order_no").notNull(),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull().default(""),
    address: text("address").notNull().default(""),
    note: text("note").notNull().default(""),
    /** Хүргэлтийн арга: pickup | delivery */
    delivery: text("delivery").notNull().default("pickup"),
    subtotal: integer("subtotal").notNull().default(0),
    shipping: integer("shipping").notNull().default(0),
    total: integer("total").notNull().default(0),
    /** new | confirmed | paid | shipped | done | cancelled */
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("site_orders_no_idx").on(table.orderNo),
    index("site_orders_status_idx").on(table.status),
    index("site_orders_created_idx").on(table.createdAt),
  ]
);

/** Захиалгын мөр */
export const siteOrderItems = pgTable(
  "site_order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => siteOrders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => siteProducts.id, {
      onDelete: "set null",
    }),
    /** Захиалгын үеийн нэр, үнэ — бүтээгдэхүүн өөрчлөгдсөн ч хөшинө */
    name: text("name").notNull(),
    slug: text("slug").notNull().default(""),
    price: integer("price").notNull().default(0),
    qty: integer("qty").notNull().default(1),
    lineTotal: integer("line_total").notNull().default(0),
  },
  (table) => [index("site_order_items_order_idx").on(table.orderId)]
);

/* -------------------------------------------------------------------------- */
/* Мэдээ, тохиргоо                                                             */
/* -------------------------------------------------------------------------- */

/** Мэдээ, нийтлэл — монгол бичгийн тухай агуулга */
export const siteNews = pgTable(
  "site_news",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    body: text("body").notNull().default(""),
    coverUrl: text("cover_url").notNull().default(""),
    /** Чөлөөт шошго: "Түүх", "Зөвлөгөө", "Арга хэмжээ" */
    tag: text("tag").notNull().default("Мэдээ"),
    author: text("author").notNull().default("Уран бичлэг"),
    /** draft | published */
    status: text("status").notNull().default("published"),
    featured: boolean("featured").notNull().default(false),
    viewCount: integer("view_count").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("site_news_slug_idx").on(table.slug),
    index("site_news_published_idx").on(table.publishedAt),
  ]
);

/**
 * Холбоо барих мэдээлэл, дансны дугаар зэрэг — админаас засагдана.
 * Түлхүүрийн жагсаалт `src/lib/settings.ts`-д тодорхойлогдсон.
 */
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* Толь                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Кирилл → монгол бичгийн толь, mongoltoli.mn-ээс хураасан (~150k бичлэг).
 *
 * Яагаад Postgres-т вэ: толь нь `mongolLexicon.ts` шиг `"use client"` мод руу
 * орвол БҮХЭЛДЭЭ хөтөч рүү явна. 150k бичлэг нь хэдэн MB — хөрвүүлэгчийн
 * хуудсыг ачаалахын аргагүй болгоно. Тиймээс энд сууж, `/api/toli`-оор
 * багцаар хайгдана. `mongolLexicon.ts` нь багшаар нягталсан цөм үгсийг
 * хадгалсаар үлдэнэ — тэр нь шууд, сүлжээгүй ажилладаг хурдан зам.
 *
 * `cyrillic` нь ЖИЖИГ үсгээр хадгалагдана (эх сурвалж бүгдийг том үсгээр
 * өгдөг) — хайлт нормчлолгүй таарах ёстой.
 *
 * Нэг кирилл үг олон бичлэгтэй байж болно (омоним): `ugId` нь эх толийн
 * дугаар, хамгийн багыг нь үндсэн утга гэж үзнэ.
 */
export const siteToli = pgTable(
  "site_toli",
  {
    /** mongoltoli.mn дахь ug_id — эх сурвалж руу буцаж холбох түлхүүр */
    ugId: integer("ug_id").primaryKey(),
    cyrillic: text("cyrillic").notNull(),
    /** Уламжлалт монгол бичгийн Unicode хэлбэр */
    mongol: text("mongol").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Хайлт үргэлж кирилл үгээр явна — омоним олон мөр буцаана.
    index("site_toli_cyrillic_idx").on(table.cyrillic),
    // Угтвараар хайхад (`LIKE 'мон%'`) дээрх индекс АЖИЛЛАХГҮЙ: DB-ийн
    // collation нь `English_United States.1252` бөгөөд `LIKE`-ийн угтварын
    // оптимизац зөвхөн `C` collation эсвэл `text_pattern_ops`-той л хийгддэг.
    // Түүнгүйгээр 60k мөр бүрэн уншигдана (хэмжсэн: 5.9 мс ↔ индекстэй 0.1 мс).
    //
    // ⚠ `cyrillic >= 'мон' AND cyrillic < 'моо'` гэсэн «муж» аргыг бүү оролд —
    // энэ collation кириллийг кодын дарааллаар эрэмбэлдэггүй (ё нь е-ийн
    // дотор, ө нь о-гийн дотор, я хамгийн сүүлд) тул муж нь буруу үг цуглуулж,
    // зарим үсгийг бүрмөсөн алддаг (хэмжсэн: «я» → 811 үгийн оронд 0).
    index("site_toli_cyrillic_pattern_idx").on(
      table.cyrillic.op("text_pattern_ops")
    ),
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
