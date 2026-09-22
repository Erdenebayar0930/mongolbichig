"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  checkPassword,
  endSession,
  requireAdmin,
  startSession,
} from "@/lib/site/admin/auth";
import { db } from "@/lib/site/db";
import {
  siteCourses,
  siteEnrollments,
  siteNews,
  siteOrders,
  siteProducts,
  siteSettings,
} from "@/lib/site/db/schema";
import { slugify } from "@/lib/site/format";
import { SETTING_KEYS } from "@/lib/site/settings";

import type { FormState } from "./form-state";

/**
 * Админы үйлдлүүд.
 *
 * Server Action нь UI-аас үл хамааран шууд POST-оор дуудагдаж болдог тул
 * `/admin` доторх layout дахь шалгалт **хангалтгүй** — бичдэг функц бүр
 * өөрөө `requireAdmin()`-ыг эхэнд дуудна.
 */

/* -------------------------------------------------------------------------- */
/* Туслахууд                                                                   */
/* -------------------------------------------------------------------------- */

function text(formData: FormData, name: string, max = 5000) {
  return String(formData.get(name) ?? "")
    .trim()
    .slice(0, max);
}

function int(formData: FormData, name: string, fallback = 0) {
  const parsed = Number.parseInt(text(formData, name, 20), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(formData: FormData, name: string) {
  return formData.get(name) != null;
}

/** Мөр тус бүрийг нэг элемент болгоно — хөтөлбөр, зургийн жагсаалтад */
function lines(formData: FormData, name: string) {
  return text(formData, name, 8000)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 60);
}

/** Хоосон бол `null` — `date` багана хоосон мөр хүлээж авдаггүй */
function dateOrNull(formData: FormData, name: string) {
  const value = text(formData, name, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Далд талбараас ирсэн id-г Postgres руу өгөхийн өмнө шалгана */
function uuidOrEmpty(value: string) {
  return UUID.test(value) ? value : "";
}

/**
 * Давхардахгүй slug. Гарчгаас үүсгээд, аль хэдийн эзэлсэн бол "-2", "-3"…
 * гэж нэмнэ. `ignoreId` нь засварлаж буй мөрийг өөрийг нь тооцохгүй байхад.
 *
 * Гурван хүснэгтэд ижил ажилладаг тул хүснэгтийн объект биш нэрийг авав —
 * drizzle-ийн select builder-т гурван өөр хүснэгтийн нэгдлийг дамжуулбал
 * баганын төрлүүд нийлэхгүй.
 */
async function uniqueSlug(
  tableName: "site_courses" | "site_products" | "site_news",
  desired: string,
  fallbackFrom: string,
  ignoreId: string
) {
  const base = slugify(desired || fallbackFrom);
  // MySQL-д UUID төрөл байхгүй — id нь varchar(36) тул хөрвүүлэлт хэрэггүй.
  const guard = ignoreId ? sql`and id <> ${ignoreId}` : sql.empty();

  for (let suffix = 0; suffix < 50; suffix += 1) {
    const candidate = suffix === 0 ? base : `${base}-${suffix + 1}`;

    // mysql2 нь `[rows, fields]` хос буцаана — pg-ийн `.rows`-той адилгүй.
    const [rows] = await db.execute(sql`
      select 1 from ${sql.identifier(tableName)}
      where slug = ${candidate} ${guard}
      limit 1
    `);

    if ((rows as unknown as unknown[]).length === 0) return candidate;
  }

  // 50 хувилбар бүгд эзэлсэн — практикт тохиолдохгүй, гэхдээ давхцахаас
  // хамгаалахын тулд цагийн тэмдэг нэмнэ.
  return `${base}-${Date.now().toString(36)}`;
}

/** Нийтэд харагдах бүх хуудсыг шинэчилнэ — засвар шууд ил гарна */
function revalidatePublic() {
  for (const path of ["/", "/surgalt", "/delguur", "/medee", "/tuhai"]) {
    revalidatePath(path, path === "/" ? "page" : "layout");
  }
}

/* -------------------------------------------------------------------------- */
/* Нэвтрэх                                                                     */
/* -------------------------------------------------------------------------- */

export async function login(
  _previous: FormState,
  formData: FormData
): Promise<FormState> {
  const password = String(formData.get("password") ?? "");

  try {
    if (!checkPassword(password)) {
      return { ok: false, error: "Нууц үг буруу байна." };
    }

    await startSession();
  } catch (error) {
    console.error("[admin login]", error);
    return {
      ok: false,
      error:
        "Нэвтрэлт тохируулагдаагүй байна. ADMIN_PASSWORD, ADMIN_SESSION_SECRET-ээ .env.local-д нэмнэ үү.",
    };
  }

  // redirect нь хяналтын урсгалын онцгой тохиолдол шиддэг — try дотор
  // байвал catch нь барьж аваад нэвтрэлт бүтэлгүйтсэн мэт харагдана.
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

/* -------------------------------------------------------------------------- */
/* Сургалт                                                                     */
/* -------------------------------------------------------------------------- */

export async function saveCourse(formData: FormData) {
  await requireAdmin();

  const id = uuidOrEmpty(text(formData, "id", 60));
  const title = text(formData, "title", 200) || "Нэргүй сургалт";
  const slug = await uniqueSlug("site_courses", text(formData, "slug", 80), title, id);

  const values = {
    slug,
    title,
    level: text(formData, "level", 20) || "anhan",
    format: text(formData, "format", 20) || "tanhim",
    summary: text(formData, "summary", 500),
    body: text(formData, "body", 20_000),
    syllabus: lines(formData, "syllabus"),
    price: Math.max(0, int(formData, "price")),
    durationWeeks: Math.max(0, int(formData, "durationWeeks", 4)),
    schedule: text(formData, "schedule", 200),
    startDate: dateOrNull(formData, "startDate"),
    seats: Math.max(0, int(formData, "seats")),
    seatsTaken: Math.max(0, int(formData, "seatsTaken")),
    location: text(formData, "location", 300),
    coverUrl: text(formData, "coverUrl", 500),
    status: bool(formData, "published") ? "published" : "draft",
    featured: bool(formData, "featured"),
    sortOrder: int(formData, "sortOrder"),
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(siteCourses).set(values).where(eq(siteCourses.id, id));
  } else {
    await db.insert(siteCourses).values(values);
  }

  revalidatePublic();
  revalidatePath(`/surgalt/${slug}`);
  redirect("/admin/surgalt");
}

export async function deleteCourse(formData: FormData) {
  await requireAdmin();

  const id = uuidOrEmpty(text(formData, "id", 60));
  if (id) await db.delete(siteCourses).where(eq(siteCourses.id, id));

  revalidatePublic();
  redirect("/admin/surgalt");
}

/* -------------------------------------------------------------------------- */
/* Бүтээгдэхүүн                                                                */
/* -------------------------------------------------------------------------- */

export async function saveProduct(formData: FormData) {
  await requireAdmin();

  const id = uuidOrEmpty(text(formData, "id", 60));
  const name = text(formData, "name", 200) || "Нэргүй бүтээгдэхүүн";
  const slug = await uniqueSlug("site_products", text(formData, "slug", 80), name, id);

  const values = {
    slug,
    name,
    category: text(formData, "category", 20) || "bichleg",
    summary: text(formData, "summary", 500),
    body: text(formData, "body", 20_000),
    price: Math.max(0, int(formData, "price")),
    oldPrice: Math.max(0, int(formData, "oldPrice")),
    coverUrl: text(formData, "coverUrl", 500),
    images: lines(formData, "images"),
    // -1 = захиалгаар хийгддэг тул хязгааргүй
    stock: Math.max(-1, int(formData, "stock", -1)),
    status: bool(formData, "published") ? "published" : "draft",
    featured: bool(formData, "featured"),
    sortOrder: int(formData, "sortOrder"),
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(siteProducts).set(values).where(eq(siteProducts.id, id));
  } else {
    await db.insert(siteProducts).values(values);
  }

  revalidatePublic();
  revalidatePath(`/delguur/${slug}`);
  redirect("/admin/delguur");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  const id = uuidOrEmpty(text(formData, "id", 60));
  if (id) await db.delete(siteProducts).where(eq(siteProducts.id, id));

  revalidatePublic();
  redirect("/admin/delguur");
}

/* -------------------------------------------------------------------------- */
/* Мэдээ                                                                       */
/* -------------------------------------------------------------------------- */

export async function saveNews(formData: FormData) {
  await requireAdmin();

  const id = uuidOrEmpty(text(formData, "id", 60));
  const title = text(formData, "title", 250) || "Нэргүй мэдээ";
  const slug = await uniqueSlug("site_news", text(formData, "slug", 80), title, id);
  const publishedAt = dateOrNull(formData, "publishedAt");

  const values = {
    slug,
    title,
    excerpt: text(formData, "excerpt", 500),
    body: text(formData, "body", 40_000),
    coverUrl: text(formData, "coverUrl", 500),
    tag: text(formData, "tag", 60) || "Мэдээ",
    author: text(formData, "author", 120) || "Уран бичлэг",
    status: bool(formData, "published") ? "published" : "draft",
    featured: bool(formData, "featured"),
    // Огноогүй бол одоогийн цаг — "2026-09-15" мөрийг орон нутгийн үд гэж
    // уншуулснаар цагийн бүсээс болж өдөр ухрахаас сэргийлнэ.
    publishedAt: publishedAt ? new Date(`${publishedAt}T12:00:00`) : new Date(),
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(siteNews).set(values).where(eq(siteNews.id, id));
  } else {
    await db.insert(siteNews).values(values);
  }

  revalidatePublic();
  revalidatePath(`/medee/${slug}`);
  redirect("/admin/medee");
}

export async function deleteNews(formData: FormData) {
  await requireAdmin();

  const id = uuidOrEmpty(text(formData, "id", 60));
  if (id) await db.delete(siteNews).where(eq(siteNews.id, id));

  revalidatePublic();
  redirect("/admin/medee");
}

/* -------------------------------------------------------------------------- */
/* Захиалга, бүртгэл                                                           */
/* -------------------------------------------------------------------------- */

export async function setOrderStatus(formData: FormData) {
  await requireAdmin();

  const id = uuidOrEmpty(text(formData, "id", 60));
  const status = text(formData, "status", 20);

  if (id && status) {
    await db
      .update(siteOrders)
      .set({ status, updatedAt: new Date() })
      .where(eq(siteOrders.id, id));
  }

  revalidatePath("/admin/zahialga");
  revalidatePath(`/admin/zahialga/${id}`);
}

export async function setEnrollmentStatus(formData: FormData) {
  await requireAdmin();

  const id = uuidOrEmpty(text(formData, "id", 60));
  const status = text(formData, "status", 20);

  if (id && status) {
    await db
      .update(siteEnrollments)
      .set({ status })
      .where(eq(siteEnrollments.id, id));
  }

  revalidatePath("/admin/burtgel");
}

/* -------------------------------------------------------------------------- */
/* Тохиргоо                                                                    */
/* -------------------------------------------------------------------------- */

export async function saveSettings(formData: FormData) {
  await requireAdmin();

  for (const key of SETTING_KEYS) {
    const value = text(formData, key, 2000);

    await db
      .insert(siteSettings)
      .values({ key, value, updatedAt: new Date() })
      .onDuplicateKeyUpdate({ set: { value, updatedAt: new Date() } });
  }

  revalidatePublic();
  redirect("/admin/tohirgoo");
}
