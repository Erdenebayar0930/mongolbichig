import { NextResponse } from "next/server";

import { lookupToli, normalizeToliWords } from "@/lib/site/toli";

/**
 * Кирилл → монгол бичгийн багц хайлт.
 *
 *   POST /api/toli   { "words": ["аав", "ээж", "сар"] }
 *   → {
 *       "found":    { "аав": "ᠠᠪᠤ", "сар": "ᠰᠠᠷᠠᠨ", ... },
 *       "variants": { "сар": ["ᠰᠠᠷᠠᠨ", "ᠰᠠᠷ᠎ᠠ", "ᠰᠠᠷ"], ... }
 *     }
 *
 * `found` нь ҮНДСЭН бичлэг, `variants` нь БҮХ бичлэг. Хоёрыг тусад нь буцаах
 * шалтгаан: 52457 толгой үгийн 1535 нь олон бичлэгтэй бөгөөд алийг нь сонгохыг
 * зөвхөн УТГА шийднэ — «сар» нь ᠰᠠᠷᠠᠨ (тэнгэрийн бие) ч, ᠰᠠᠷ᠎ᠠ (хугацаа) ч
 * байж болно. Аль нь болохыг машин мэдэхгүй тул хоёуланг нь дамжуулж,
 * сонголтыг хүнд үлдээнэ.
 *
 * Яагаад POST вэ: хөрвүүлэгч урсгал бичвэрийг илгээдэг тул нэг хүсэлтэд
 * хэдэн зуун үг багтаж, GET-ийн URL уртын хязгаарт мөргөнө.
 *
 * Яагаад багцаар вэ: үг тутамд нэг хүсэлт явуулбал 200 үгт 200 удаагийн
 * тойрог үүснэ. Хөрвүүлэгч мэдэхгүй бүх үгээ нэг дор асууна.
 *
 * Хайлтын бодит логик нь [toli.ts](../../../lib/toli.ts)-д — Facebook бот
 * түүнийг HTTP-гүйгээр шууд дууддаг.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON биш байна" }, { status: 400 });
  }

  const raw = (payload as { words?: unknown })?.words;
  if (!Array.isArray(raw)) {
    return NextResponse.json(
      { error: "`words` нь массив байх ёстой" },
      { status: 400 },
    );
  }

  const words = normalizeToliWords(raw);
  if (words.length === 0) return NextResponse.json({ found: {} });

  const { found, variants } = await lookupToli(words);

  return NextResponse.json(
    { found, variants },
    {
      // Толь бараг өөрчлөгддөггүй — CDN болон хөтөчид удаан хадгалуулна.
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
    },
  );
}
