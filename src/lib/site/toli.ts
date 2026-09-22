import "server-only";

import { inArray } from "drizzle-orm";

import { db } from "@/lib/site/db";
import { siteToli } from "@/lib/site/db/schema";

/**
 * Их тайлбар толийн багц хайлт.
 *
 * `/api/toli` маршрут ба Facebook бот хоёулаа үүнийг дууддаг. Бот нь нэг
 * процесс дотроо DB-тэй суудаг тул өөр дээрээ HTTP тойрог үүсгэх нь утгагүй —
 * харин омонимын эрэмбэ, нормчлол хоёр ХОЁУЛАНД НЬ ижил байх ёстой тул
 * логикийг маршрутад биш энд байрлуулав.
 */

/** Нэг хайлтад авах үгийн дээд тоо — санамсаргүй/хортой их ачааллаас хамгаална. */
export const MAX_TOLI_WORDS = 500;

export type ToliLookup = {
  /** ҮНДСЭН бичлэг — үг тутамд нэг */
  found: Record<string, string>;
  /** Олон бичлэгтэй үгсийн БҮХ хувилбар, эх толийн дугаараар эрэмбэлэгдсэн */
  variants: Record<string, string[]>;
};

/**
 * Хайлтын түлхүүрийг нормчилно.
 *
 * ⚠ Нормчлол нь импорттой ЯГ ижил байх ёстой (жижиг үсэг, тайрсан) — эс
 * бөгөөс индекс ажиллахгүй, хайлт чимээгүй хоосон буцна.
 */
export function normalizeToliWords(raw: readonly unknown[]): string[] {
  return [
    ...new Set(
      raw
        .filter((word): word is string => typeof word === "string")
        .map((word) => word.trim().toLowerCase())
        .filter(Boolean),
    ),
  ].slice(0, MAX_TOLI_WORDS);
}

export async function lookupToli(words: string[]): Promise<ToliLookup> {
  if (words.length === 0) return { found: {}, variants: {} };

  const rows = await db
    .select({
      ugId: siteToli.ugId,
      cyrillic: siteToli.cyrillic,
      mongol: siteToli.mongol,
    })
    .from(siteToli)
    .where(inArray(siteToli.cyrillic, words));

  // Омоним: нэг кирилл үг олон бичлэгтэй. Бичлэг бүрийн ХАМГИЙН БАГА ug_id-аар
  // эрэмбэлнэ — эх толинд эхэлж бүртгэгдсэн нь ерөнхийдөө үндсэн утга.
  //
  // ⚠ Давтамжаар («хамгийн олон удаа тохиолдсон бичлэг») эрэмбэлж үзсэн боловч
  // сайжруулдаггүй: 1535 омонимын 197-г өөрчилж, заримыг зөв («сар» ᠰᠠᠷᠠᠨ →
  // ᠰᠠᠷ᠎ᠠ), заримыг буруу болгодог («нар» ᠨᠠᠷᠠ → ᠨᠠᠷ, олон тооны нөхцөл рүү).
  // Тиймээс эрэмбэ нь зөвхөн САНАЛ — эцсийн сонголтыг хүн хийнэ.
  const firstId = new Map<string, Map<string, number>>();
  for (const row of rows) {
    const spellings = firstId.get(row.cyrillic) ?? new Map<string, number>();
    const seen = spellings.get(row.mongol);
    if (seen === undefined || row.ugId < seen) spellings.set(row.mongol, row.ugId);
    firstId.set(row.cyrillic, spellings);
  }

  const found: Record<string, string> = {};
  const variants: Record<string, string[]> = {};
  for (const [cyrillic, spellings] of firstId) {
    const ordered = [...spellings.entries()]
      .sort((a, b) => a[1] - b[1])
      .map(([mongol]) => mongol);
    found[cyrillic] = ordered[0];
    if (ordered.length > 1) variants[cyrillic] = ordered;
  }

  return { found, variants };
}
