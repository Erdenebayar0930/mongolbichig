/**
 * Админаас орж ирсэн энгийн текстийг догол мөр болгоно.
 *
 * HTML-ийг зориуд дэмжээгүй: админ нь итгэлтэй хүн ч гэсэн `dangerouslySet
 * InnerHTML` нь нэг л өдөр хаа нэгтээгээс хуулсан бичвэрээр дамжин XSS болдог.
 * Хоосон мөрөөр эсвэл мөр бүрээр нь тасалж, React өөрөө зугтаалт хийнэ.
 */
export default function Prose({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n{2,}|\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return (
    <div className="prose-site">
      {paragraphs.map((paragraph, index) =>
        // «» дотор эхэлсэн мөрийг ишлэл гэж үзнэ — уран бичлэгийн тухай
        // бичвэрт сургаал үг байнга орж ирдэг.
        paragraph.startsWith("«") ? (
          <blockquote key={index}>{paragraph}</blockquote>
        ) : (
          <p key={index}>{paragraph}</p>
        )
      )}
    </div>
  );
}
