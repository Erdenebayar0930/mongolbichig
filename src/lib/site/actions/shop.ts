"use server";

import { randomBytes } from "node:crypto";

import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/site/db";
import {
  siteCourses,
  siteEnrollments,
  siteOrderItems,
  siteOrders,
  siteProducts,
} from "@/lib/site/db/schema";
import { getSettings } from "@/lib/site/queries";
import { settingNumber } from "@/lib/site/settings";

import type { FormState } from "./form-state";

/**
 * Нийтэд нээлттэй үйлдлүүд — захиалга өгөх, сургалтад бүртгүүлэх.
 *
 * Гол зарчим: **клиентээс ирсэн үнэд хэзээ ч итгэхгүй**. Сагс нь хөтөч дэх
 * localStorage-д сууж байгаа тул хэрэглэгч үнийг нь чөлөөтэй засаж чадна.
 * Тиймээс slug, тоо ширхэгийг л авч, үнийг DB-ээс дахин уншиж бодно.
 */

/* -------------------------------------------------------------------------- */
/* Туслахууд                                                                   */
/* -------------------------------------------------------------------------- */

function text(formData: FormData, name: string, max = 500) {
  return String(formData.get(name) ?? "")
    .trim()
    .slice(0, max);
}

/** Монголын дугаар 8 оронтой. Зай, зураас, +976-г үл тоомсорлоно. */
function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "").replace(/^976/, "");
  return digits.length === 8 ? digits : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * "UB-260817-1A2B3C". Огноо нь эзэнд нь харахад ойлгомжтой, сүүлийн санамсаргүй
 * хэсэг нь бусдын захиалгыг дугаар таамаглан үзэхээс хамгаална.
 */
function makeOrderNo() {
  const now = new Date();
  const stamp = [
    String(now.getFullYear()).slice(2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  return `UB-${stamp}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

type IncomingItem = { slug: string; qty: number };

/** Сагсны JSON-ыг задлана. Гэмтсэн бол хоосон буцаана. */
function parseItems(raw: string): IncomingItem[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const items = parsed.flatMap((entry): IncomingItem[] => {
      if (typeof entry !== "object" || entry === null) return [];
      const item = entry as Record<string, unknown>;
      const qty = Math.floor(Number(item.qty));

      if (typeof item.slug !== "string" || !Number.isFinite(qty) || qty < 1) {
        return [];
      }

      return [{ slug: item.slug, qty: Math.min(99, qty) }];
    });

    // Нэг бүтээгдэхүүн хоёр мөр болж ирвэл нийлүүлнэ.
    const merged = new Map<string, number>();
    for (const item of items) {
      merged.set(item.slug, Math.min(99, (merged.get(item.slug) ?? 0) + item.qty));
    }

    return [...merged].slice(0, 50).map(([slug, qty]) => ({ slug, qty }));
  } catch {
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/* Захиалга                                                                    */
/* -------------------------------------------------------------------------- */

export async function placeOrder(
  _previous: FormState,
  formData: FormData
): Promise<FormState> {
  const customerName = text(formData, "customerName", 120);
  const phone = normalizePhone(text(formData, "phone", 40));
  const email = text(formData, "email", 160);
  const address = text(formData, "address", 400);
  const note = text(formData, "note", 1000);
  const delivery = text(formData, "delivery", 20) === "delivery"
    ? "delivery"
    : "pickup";

  const fields: Record<string, string> = {};

  if (customerName.length < 2) fields.customerName = "Нэрээ бичнэ үү.";
  if (!phone) fields.phone = "8 оронтой утасны дугаар оруулна уу.";
  if (email && !isEmail(email)) fields.email = "И-мэйл хаяг буруу байна.";
  if (delivery === "delivery" && address.length < 5) {
    fields.address = "Хүргэлтийн хаягаа бичнэ үү.";
  }

  const incoming = parseItems(text(formData, "items", 20_000));
  if (incoming.length === 0) fields.items = "Сагс хоосон байна.";

  if (Object.keys(fields).length > 0) {
    return { ok: false, error: "Маягтыг гүйцэд бөглөнө үү.", fields };
  }

  try {
    const products = await db
      .select()
      .from(siteProducts)
      .where(eq(siteProducts.status, "published"));

    const bySlug = new Map(products.map((product) => [product.slug, product]));

    const lines = incoming.flatMap((item) => {
      const product = bySlug.get(item.slug);
      if (!product) return [];

      // `stock === -1` — захиалгаар хийгддэг тул үлдэгдэл шалгахгүй.
      const qty =
        product.stock >= 0 ? Math.min(item.qty, product.stock) : item.qty;
      if (qty < 1) return [];

      return [
        {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          qty,
          lineTotal: product.price * qty,
        },
      ];
    });

    if (lines.length === 0) {
      return {
        ok: false,
        error:
          "Сагсанд байгаа бүтээгдэхүүн олдсонгүй эсвэл дууссан байна. Сагсаа шинэчилнэ үү.",
      };
    }

    const settings = await getSettings();
    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const freeFrom = settingNumber(settings.freeShippingFrom, 0);
    const shipping =
      delivery === "delivery" && (freeFrom === 0 || subtotal < freeFrom)
        ? settingNumber(settings.shippingFee, 0)
        : 0;

    const order = {
      customerName,
      phone,
      email,
      address: delivery === "delivery" ? address : "",
      note,
      delivery,
      subtotal,
      shipping,
      total: subtotal + shipping,
    };

    // Дугаар давхцах магадлал бага ч тэг биш — цөөн удаа дахин оролдоно.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const orderNo = makeOrderNo();

      try {
        /**
         * MySQL-д `INSERT ... RETURNING` байхгүй бөгөөд `insertId` нь
         * AUTO_INCREMENT-д л утгатай. id нь varchar(36) UUID тул мөрийг
         * буцааж уншихын оронд түлхүүрийг ЭНД үүсгэж, хоёр insert-д
         * хоёуланд нь дамжуулна.
         */
        const orderId = crypto.randomUUID();

        await db.transaction(async (tx) => {
          await tx.insert(siteOrders).values({ ...order, id: orderId, orderNo });

          await tx.insert(siteOrderItems).values(
            lines.map((line) => ({ ...line, orderId }))
          );

          // Тоолж буй бүтээгдэхүүний үлдэгдлийг хасна.
          for (const line of lines) {
            await tx
              .update(siteProducts)
              .set({ stock: sql`greatest(${siteProducts.stock} - ${line.qty}, 0)` })
              .where(
                sql`${siteProducts.id} = ${line.productId} and ${siteProducts.stock} >= 0`
              );
          }
        });

        return { ok: true, orderNo };
      } catch (error) {
        // Зөвхөн дугаарын давхцалыг дахин оролдоно; бусад алдааг доош дамжуулна.
        //
        // ⚠ Алдааны МЕССЕЖЭЭР шалгаж болохгүй. Drizzle нь драйверын алдааг
        // ороож, `message`-ыг «Failed query: insert into …» болгон сольдог тул
        // индексийн нэр тэнд ОГТ ОРОХГҮЙ — мессежээр шалгавал давхцал бүр
        // хэрэглэгч рүү алдаа болж гарна. Жинхэнэ mysql2 алдаа нь `cause`
        // дотор сууна: code = "ER_DUP_ENTRY", sqlMessage дотор индексийн нэр.
        const cause = (error as { cause?: { code?: string; sqlMessage?: string } })
          .cause;

        const isOrderNoClash =
          cause?.code === "ER_DUP_ENTRY" &&
          (cause.sqlMessage ?? "").includes("site_orders_no_idx");

        if (!isOrderNoClash) throw error;
      }
    }

    throw new Error("Захиалгын дугаар үүсгэж чадсангүй.");
  } catch (error) {
    console.error("[placeOrder]", error);
    return {
      ok: false,
      error:
        "Захиалгыг хадгалж чадсангүй. Түр хүлээгээд дахин оролдоно уу, эсвэл утсаар холбогдоно уу.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Сургалтад бүртгүүлэх                                                        */
/* -------------------------------------------------------------------------- */

export async function enroll(
  _previous: FormState,
  formData: FormData
): Promise<FormState> {
  const courseId = text(formData, "courseId", 60);
  const name = text(formData, "name", 120);
  const phone = normalizePhone(text(formData, "phone", 40));
  const email = text(formData, "email", 160);
  const note = text(formData, "note", 1000);

  const fields: Record<string, string> = {};

  if (name.length < 2) fields.name = "Нэрээ бичнэ үү.";
  if (!phone) fields.phone = "8 оронтой утасны дугаар оруулна уу.";
  if (email && !isEmail(email)) fields.email = "И-мэйл хаяг буруу байна.";

  if (Object.keys(fields).length > 0) {
    return { ok: false, error: "Маягтыг гүйцэд бөглөнө үү.", fields };
  }

  try {
    const [course] = await db
      .select({ id: siteCourses.id, title: siteCourses.title })
      .from(siteCourses)
      .where(eq(siteCourses.id, courseId))
      .limit(1);

    if (!course) {
      return { ok: false, error: "Сургалт олдсонгүй." };
    }

    await db.insert(siteEnrollments).values({
      courseId: course.id,
      courseTitle: course.title,
      name,
      phone,
      email,
      note,
    });

    return { ok: true };
  } catch (error) {
    console.error("[enroll]", error);
    return {
      ok: false,
      error: "Хүсэлтийг илгээж чадсангүй. Дахин оролдоно уу.",
    };
  }
}
