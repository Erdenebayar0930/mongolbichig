import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Facebook Graph API-тай харилцах нимгэн давхарга.
 *
 * Зөвхөн ботод хэрэгтэй хоёр үйлдэл: **сэтгэгдэлд хариу бичих** ба
 * **Messenger-ээр хариу илгээх**. Хоёулаа зургийг ФАЙЛААР (multipart) илгээнэ —
 * `attachment_url`-аар илгээвэл зураг нь нийтэд нээлттэй хаягтай байх шаардлага
 * гарч, локал хөгжүүлэлт (ngrok-гүй) болон дотоод сүлжээнд ажиллахаа болино.
 */

/**
 * Graph API-ийн хувилбар.
 *
 * Facebook хувилбар бүрийг гарснаас ~2 жилийн дараа хаадаг бөгөөд хаагдсан
 * хувилбар руу хийсэн дуудлага алдаа буцаана. Тиймээс энэ тоог үе үе шинэчилнэ:
 * Graph API Explorer дээр аль хувилбар анхдагчаар сонгогдож байгааг хараад,
 * `FB_GRAPH_VERSION`-оор дарж туршаад дараа нь энд бичнэ.
 */
const VERSION = process.env.FB_GRAPH_VERSION ?? "v26.0";
const GRAPH = `https://graph.facebook.com/${VERSION}`;

export type FacebookConfig = {
  pageId: string;
  pageToken: string;
  appSecret: string;
  verifyToken: string;
};

/**
 * Тохиргоог уншина. Дутуу бол `null` — бот чимээгүй унтарна.
 *
 * Дөрвүүлээ ЗААВАЛ хэрэгтэй: `appSecret` байхгүй бол гарын үсэг шалгах
 * боломжгүй болж, вэбхүүк нь хэн ч дуудаж болох нээлттэй хаалга болно.
 */
export function facebookConfig(): FacebookConfig | null {
  const pageId = process.env.FB_PAGE_ID;
  const pageToken = process.env.FB_PAGE_ACCESS_TOKEN;
  const appSecret = process.env.FB_APP_SECRET;
  const verifyToken = process.env.FB_VERIFY_TOKEN;

  if (!pageId || !pageToken || !appSecret || !verifyToken) return null;
  return { pageId, pageToken, appSecret, verifyToken };
}

/**
 * `X-Hub-Signature-256` толгойг шалгана.
 *
 * Гарын үсэг нь биеийн **түүхий байт** дээр тооцоологддог тул дуудагч тал
 * `request.text()`-ээр авсан яг тэр мөрийг дамжуулах ёстой — JSON болгож задлаад
 * буцаан цуглуулбал зай, талбарын дараалал өөрчлөгдөж гарын үсэг зөрнө.
 */
export function verifySignature(
  rawBody: string,
  header: string | null,
  appSecret: string,
): boolean {
  if (!header?.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest();
  const received = Buffer.from(header.slice("sha256=".length), "hex");

  // Урт нь зөрвөл `timingSafeEqual` шиднэ — өмнө нь шалгана.
  if (received.length !== expected.length) return false;
  return timingSafeEqual(received, expected);
}

/* -------------------------------------------------------------------------- */
/* Вэбхүүкийн ачааллын хэлбэр                                                  */
/* -------------------------------------------------------------------------- */

/** Хуудасны хананд болсон үйл явдал (сэтгэгдэл, лайк, пост…). */
export type FeedChange = {
  item?: string;
  verb?: string;
  comment_id?: string;
  post_id?: string;
  parent_id?: string;
  message?: string;
  from?: { id?: string; name?: string };
};

/** Messenger-ийн нэг мессеж. */
export type MessagingEvent = {
  sender?: { id?: string };
  recipient?: { id?: string };
  message?: { mid?: string; text?: string; is_echo?: boolean };
};

export type WebhookBody = {
  object?: string;
  entry?: {
    id?: string;
    changes?: { field?: string; value?: FeedChange }[];
    messaging?: MessagingEvent[];
  }[];
};

/* -------------------------------------------------------------------------- */
/* Илгээх                                                                      */
/* -------------------------------------------------------------------------- */

async function graph(url: string, form: FormData): Promise<void> {
  const response = await fetch(url, { method: "POST", body: form });
  if (response.ok) return;

  // Graph нь алдааны учрыг биедээ хэлдэг (жишээ нь токен хугацаа дууссан) —
  // статус кодыг ганцаар нь бичвэл лог дээрээс юу ч ойлгохгүй.
  const detail = await response.text().catch(() => "");
  throw new Error(`Graph ${response.status}: ${detail.slice(0, 400)}`);
}

/** Зургийг multipart талбар болгоно. */
function imageField(png: Buffer): Blob {
  return new Blob([new Uint8Array(png)], { type: "image/png" });
}

/**
 * Сэтгэгдэлд ЗУРГААР хариу бичнэ.
 *
 * Facebook нь сэтгэгдлийн хариуг зөвхөн НЭГ ШАТ гүнзгий зөвшөөрдөг: хариунд
 * бичсэн хариу нь эх сэтгэгдэлд очно. Тиймээс `commentId`-г шууд дамжуулж
 * болно — Facebook өөрөө зөв салаанд байрлуулна.
 */
export async function replyToComment(
  commentId: string,
  message: string,
  png: Buffer,
  config: FacebookConfig,
): Promise<void> {
  const form = new FormData();
  form.append("access_token", config.pageToken);
  if (message) form.append("message", message);
  form.append("source", imageField(png), "bichig.png");

  await graph(`${GRAPH}/${encodeURIComponent(commentId)}/comments`, form);
}

/** Messenger-ээр зураг илгээнэ. */
export async function sendMessengerImage(
  recipientId: string,
  png: Buffer,
  config: FacebookConfig,
): Promise<void> {
  const form = new FormData();
  form.append("access_token", config.pageToken);
  form.append("recipient", JSON.stringify({ id: recipientId }));
  form.append("messaging_type", "RESPONSE");
  form.append(
    "message",
    JSON.stringify({
      attachment: { type: "image", payload: { is_reusable: false } },
    }),
  );
  form.append("filedata", imageField(png), "bichig.png");

  await graph(`${GRAPH}/me/messages`, form);
}

/** Messenger-ээр энгийн бичвэр илгээнэ. */
export async function sendMessengerText(
  recipientId: string,
  text: string,
  config: FacebookConfig,
): Promise<void> {
  const form = new FormData();
  form.append("access_token", config.pageToken);
  form.append("recipient", JSON.stringify({ id: recipientId }));
  form.append("messaging_type", "RESPONSE");
  form.append("message", JSON.stringify({ text }));

  await graph(`${GRAPH}/me/messages`, form);
}
