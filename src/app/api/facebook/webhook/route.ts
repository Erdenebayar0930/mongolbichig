import { after } from "next/server";

import { facebookConfig, verifySignature, type WebhookBody } from "@/lib/site/facebook";
import { handleWebhook } from "@/lib/site/facebookBot";

/**
 * Facebook вэбхүүк — хуудасны сэтгэгдэл ба Messenger-ийн мессежийг хүлээж авна.
 *
 *   GET  /api/facebook/webhook   Facebook-ийн хаяг баталгаажуулах гар барилт
 *   POST /api/facebook/webhook   Үйл явдал
 *
 * Тохируулах алхмуудыг [docs/facebook-bot.md](../../../../../docs/site/facebook-bot.md)
 * дотор бичив.
 */

// Зурагдалт нь `sharp` (нэйтив) ашигладаг тул Edge дээр ажиллахгүй, мөн хариу
// нь хэзээ ч кэшлэгдэх ёсгүй.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Хаяг баталгаажуулалт. Facebook нь вэбхүүкийг бүртгэх үед энэ хаяг руу нэг
 * удаа GET илгээж, `hub.challenge`-г ЯГ буцаахыг шаарддаг.
 */
export function GET(request: Request) {
  const config = facebookConfig();
  if (!config) return new Response("Тохируулаагүй", { status: 503 });

  const params = new URL(request.url).searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode !== "subscribe" || token !== config.verifyToken || !challenge) {
    return new Response("Баталгаажуулалт амжилтгүй", { status: 403 });
  }

  // Хэрэв JSON болгож боовол Facebook хүлээж авахгүй — цэвэр бичвэр байх ёстой.
  return new Response(challenge, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  const config = facebookConfig();
  if (!config) return new Response("Тохируулаагүй", { status: 503 });

  // ⚠ ТҮҮХИЙ бие. `request.json()`-оор уншаад буцаан цуглуулбал зай, талбарын
  // дараалал өөрчлөгдөж гарын үсэг зөрнө.
  const raw = await request.text();

  if (!verifySignature(raw, request.headers.get("x-hub-signature-256"), config.appSecret)) {
    return new Response("Гарын үсэг зөрж байна", { status: 401 });
  }

  let body: WebhookBody;
  try {
    body = JSON.parse(raw) as WebhookBody;
  } catch {
    return new Response("JSON биш байна", { status: 400 });
  }

  if (body.object !== "page") return new Response("EVENT_RECEIVED");

  // Хөрвүүлэлт, зурагдалт, Graph руу илгээх нь хэдэн секунд авч болно. Facebook
  // хариуг удаан хүлээвэл вэбхүүкийг ДАХИН илгээж, улмаар унтраадаг — тиймээс
  // ажлыг хариуны ДАРАА гүйцэтгэнэ.
  after(async () => {
    try {
      await handleWebhook(body, config);
    } catch (error) {
      console.error("[facebook] вэбхүүк боловсруулахад алдаа:", error);
    }
  });

  return new Response("EVENT_RECEIVED");
}
