import "server-only";

import {
  replyToComment,
  sendMessengerImage,
  sendMessengerText,
  type FacebookConfig,
  type FeedChange,
  type MessagingEvent,
  type WebhookBody,
} from "@/lib/site/facebook";
import { convertWithToli } from "@/lib/site/mongolConvert";
import { MAX_POSTER_CHARS, renderPoster } from "@/lib/site/mongolPoster";

/**
 * Facebook бот — хуудасны сэтгэгдэл ба Messenger-ийн мессежийг уншиж, доторх
 * кирилл бичвэрийг монгол бичгээр буулгасан ЗУРГААР хариулна.
 *
 * Яагаад зургаар вэ: монгол бичгийн юникод (U+1800–U+18AF) нь ихэнх утсанд
 * фонтгүй тул сэтгэгдэлд бичвэрээр буулгавал хэрэглэгчийн дэлгэц дээр
 * дөрвөлжин хайрцаг эгнэнэ. Зураг нь хаана ч ижил харагдана.
 */

/* -------------------------------------------------------------------------- */
/* Давхардал                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Facebook нь хариу 200 аваагүй гэж үзвэл вэбхүүкийг ДАХИН илгээдэг — сүлжээ
 * саатсан, эсвэл манай зурагдалт удсан тохиолдолд нэг сэтгэгдэлд хоёр удаа
 * хариулах эрсдэлтэй. Тиймээс боловсруулсан ID-г санана.
 *
 * ⚠ Санах ой нь процессын дотор — PM2 сэргээхэд цэвэрлэгдэнэ, олон хувь
 * (instance) ажиллуулбал хуваалцагдахгүй. Хуудас нь нэг л процесстой
 * (`exec_mode: fork`) тул одоохондоо хангалттай; олон хувь болгох үед үүнийг
 * DB эсвэл Redis рүү зөөх ёстой.
 */
const seen = new Map<string, number>();
const SEEN_LIMIT = 1000;

function alreadyHandled(id: string): boolean {
  if (seen.has(id)) return true;

  seen.set(id, Date.now());
  // Хамгийн эртнийг нь хаяна — `Map` нь оруулсан дарааллаа хадгалдаг.
  while (seen.size > SEEN_LIMIT) {
    const oldest = seen.keys().next().value;
    if (oldest === undefined) break;
    seen.delete(oldest);
  }
  return false;
}

/* -------------------------------------------------------------------------- */
/* Бичвэр бэлдэх                                                               */
/* -------------------------------------------------------------------------- */

/** Кирилл үсэг байхгүй бол хөрвүүлэх юм алга. */
const CYRILLIC = /[А-Яа-яЁёӨөҮү]/;

/**
 * Хэрэглэгчийн бичвэрийг цэвэрлэнэ.
 *
 * Тэмдэглэгээ (`@нэр`), холбоос, эможи нь монгол бичигт буудаггүй тул хасна —
 * эс бөгөөс зураг дээр «ᠬᠲᠲᠫᠰ» гэсэн утгагүй урт багана босно.
 */
function tidy(raw: string): string {
  return raw
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/@\S+/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

export type Bichig = { png: Buffer; caption: string; note: string };

/**
 * Кирилл бичвэрээс зураг бэлдэнэ. Хөрвүүлэх юм байхгүй бол `null`.
 */
export async function bichigFor(raw: string): Promise<Bichig | null> {
  const cleaned = tidy(raw);
  if (!cleaned || !CYRILLIC.test(cleaned)) return null;

  // Урт бичвэрийг таслана — үлдсэн нь зурагт танигдахааргүй жижиг болно.
  const caption =
    cleaned.length > MAX_POSTER_CHARS
      ? `${cleaned.slice(0, MAX_POSTER_CHARS).trimEnd()}…`
      : cleaned;

  const converted = await convertWithToli(caption);
  if (!converted.text.trim()) return null;

  const png = await renderPoster({ script: converted.text, caption });

  // Толинд олдоогүй үг нь дуудлагаар тааварласан бичлэгтэй — үүнийг нуух нь
  // хэрэглэгчийг төөрөгдүүлнэ. Бичгийн багш зөв эсэхийг шалгах ёстой гэдгийг
  // хариу дотор нь хэлнэ.
  const note =
    converted.unknown.length > 0
      ? "Зарим үгийг толиос олоогүй тул дуудлагаар бичив — шалгаарай."
      : "";

  return { png, caption, note };
}

/** Сэтгэгдлийн хариунд явах бичвэр. */
function commentMessage(bichig: Bichig): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const lines = [`«${bichig.caption}» — монгол бичгээр.`];
  if (bichig.note) lines.push(bichig.note);
  if (site) lines.push(`Өөрөө хөрвүүлэх: ${site}/horvuulegch`);
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* Үйл явдал боловсруулах                                                      */
/* -------------------------------------------------------------------------- */

async function handleComment(
  change: FeedChange,
  config: FacebookConfig,
): Promise<void> {
  if (change.item !== "comment" || change.verb !== "add") return;

  const commentId = change.comment_id;
  if (!commentId || !change.message) return;

  // ⚠ ХАМГИЙН ЧУХАЛ ШАЛГАЛТ: өөрийнхөө хариунд хариулахгүй. Хуудас өөрөө
  // сэтгэгдэл бичихэд Facebook мөн адил вэбхүүк илгээдэг тул үүнгүйгээр бот
  // өөртэйгөө эцэс төгсгөлгүй яриа өрнүүлнэ.
  if (change.from?.id === config.pageId) return;

  if (alreadyHandled(`comment:${commentId}`)) return;

  const bichig = await bichigFor(change.message);
  if (!bichig) return;

  await replyToComment(commentId, commentMessage(bichig), bichig.png, config);
}

async function handleMessage(
  event: MessagingEvent,
  config: FacebookConfig,
): Promise<void> {
  // `is_echo` нь хуудас өөрөө илгээсэн мессежийн цуурай — давхар хариулахаас
  // сэргийлж хаяна.
  if (event.message?.is_echo) return;

  const sender = event.sender?.id;
  const text = event.message?.text;
  if (!sender || !text || sender === config.pageId) return;

  const mid = event.message?.mid;
  if (mid && alreadyHandled(`message:${mid}`)) return;

  const bichig = await bichigFor(text);
  if (!bichig) {
    // Чатад чимээгүй болих нь эвгүй — хүн хариу хүлээж байна.
    await sendMessengerText(
      sender,
      "Кирилл үгээ бичээрэй — монгол бичгээр зурж илгээе.",
      config,
    );
    return;
  }

  await sendMessengerImage(sender, bichig.png, config);
  if (bichig.note) await sendMessengerText(sender, bichig.note, config);
}

/**
 * Вэбхүүкийн бүх үйл явдлыг боловсруулна.
 *
 * Нэг үйл явдал дээр гарсан алдаа нь дараагийнхыг зогсоох ёсгүй — тиймээс
 * тус бүрийг тусад нь барьж, лог руу бичээд цааш үргэлжилнэ.
 */
export async function handleWebhook(
  body: WebhookBody,
  config: FacebookConfig,
): Promise<void> {
  const jobs: Promise<void>[] = [];

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "feed" || !change.value) continue;
      jobs.push(handleComment(change.value, config));
    }
    for (const event of entry.messaging ?? []) {
      jobs.push(handleMessage(event, config));
    }
  }

  const results = await Promise.allSettled(jobs);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[facebook] хариу илгээх амжилтгүй:", result.reason);
    }
  }
}
