import { bichigFor } from "@/lib/site/facebookBot";

/**
 * Монгол бичгийн зураг — Facebook ботын зурдаг ЯГ ТЭР зураг.
 *
 *   GET /api/bichig?text=сайн байна уу
 *
 * Хоёр зорилготой: ботыг Facebook-гүйгээр шалгах (вэбхүүк тохируулахаас өмнө
 * зураг нь ямар харагдахыг харах), мөн хуваалцах зураг хэрэгтэй үед ашиглах.
 *
 * Бот болон энэ хаяг НЭГ функц дуудна — тусад нь хувилбал хоёр нь салж, шалгасан
 * зураг чинь ботынхоос өөр болно.
 */
export const runtime = "nodejs";

/** Зурагдалт нь хэдэн зуун миллисекунд авдаг тул хариуг удаан хадгалуулна. */
const CACHE = "public, max-age=86400, s-maxage=604800, immutable";

export async function GET(request: Request) {
  const text = new URL(request.url).searchParams.get("text") ?? "";

  if (!text.trim()) {
    return Response.json({ error: "`text` параметр хоосон байна" }, { status: 400 });
  }

  const bichig = await bichigFor(text);
  if (!bichig) {
    return Response.json(
      { error: "Кирилл үг олдсонгүй — хөрвүүлэх юм алга" },
      { status: 422 },
    );
  }

  return new Response(new Uint8Array(bichig.png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": CACHE,
      // Толинд олдоогүй үг байсан эсэхийг шалгагчид мэдэгдэнэ — зураг дээр
      // харагдахгүй мэдээлэл.
      "X-Bichig-Note": encodeURIComponent(bichig.note),
    },
  });
}
