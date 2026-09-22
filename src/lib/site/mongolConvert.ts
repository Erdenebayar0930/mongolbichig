import "server-only";

import {
  convertText,
  rememberToli,
  type ConvertedText,
  type ConvertOptions,
} from "@/lib/site/mongolText";
import { lookupToli } from "@/lib/site/toli";

/**
 * Сервер талын хөрвүүлэлт — толийг оролцуулаад.
 *
 * Хөтөч дээрх [TextConverter](../components/text/TextConverter.tsx) үүнийг
 * хоёр алхмаар хийдэг: эхлээд багцад суусан дүрмээр хөрвүүлж, олдоогүй
 * язгууруудыг `/api/toli`-оос асууж, дараа нь ДАХИН хөрвүүлдэг. Ботод ч яг тэр
 * зан үйл хэрэгтэй — эс бөгөөс 54 мянган үгтэй толь хажууд байхад бот дуудлагаар
 * таасаар байх болно.
 *
 * Ялгаа нь ганцхан: HTTP тойрог хэрэггүй, DB-г шууд асууна.
 */
export async function convertWithToli(
  input: string,
  options: ConvertOptions = {},
): Promise<ConvertedText> {
  const first = convertText(input, options);

  // ⚠ `unknown` биш `lookups`. `unknown` нь хүнд үзүүлэх ГАДААД хэлбэр
  // («хэрэгжилтэд»), харин толинд зөвхөн ТОЛГОЙ ҮГ байдаг («хэрэгжилт»).
  // Гадаад хэлбэрээр асуувал хариу бараг үргэлж хоосон ирнэ.
  const missing = first.lookups.map((word) => word.toLowerCase());
  if (missing.length === 0) return first;

  let found: Record<string, string> = {};
  let variants: Record<string, string[]> = {};
  try {
    ({ found, variants } = await lookupToli(missing));
  } catch (error) {
    // DB унасан ч хөрвүүлэгч ажилласаар байх ёстой — багцад суусан дүрэм нь
    // бие даан хангалттай. Хариуг чимээгүй орхиж эхний үр дүнг буцаана.
    console.error("[mongol] толь хайх амжилтгүй:", error);
    return first;
  }

  if (Object.keys(found).length === 0) return first;

  // `rememberToli` нь модулийн кэшийг өөрчилдөг — процессын турш хуваалцагдана.
  // Толь өөрчлөгддөггүй, хэрэглэгчийн өгөгдөл биш тул аюулгүй.
  rememberToli(found, variants);

  return convertText(input, options);
}
