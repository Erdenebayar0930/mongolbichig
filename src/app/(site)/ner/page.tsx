import type { Metadata } from "next";
import Link from "next/link";

import NameCalligraphy from "@/components/site/name/NameCalligraphy";
import PageHeader from "@/components/site/PageHeader";
import SectionHeading from "@/components/site/SectionHeading";
import { Ulzii } from "@/components/site/ornament/Khee";
import { getSettings } from "@/lib/site/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Нэрийн уран бичлэг",
  description:
    "Нэрээ монгол бичгээр бичүүлж, бэлэн загварыг нь татаж авах. Монгол болон гадаад нэр аль аль нь болно.",
  keywords: [
    "нэр монгол бичгээр",
    "монгол бичгийн хөрвүүлэгч",
    "уран бичлэг захиалга",
    "mongolian script name",
  ],
};

/** Гурван алхам — хүн юу хийхээ эхний хараагаар мэдэх ёстой */
const STEPS = [
  {
    mongol: "ᠨᠡᠷᠡ",
    title: "Нэрээ бичнэ",
    body: "Кирилл эсвэл латинаар. Сайт нэрийг тань монгол бичигт хөрвүүлж, шууд харуулна.",
  },
  {
    mongol: "ᠬᠡᠪ",
    title: "Загвараа сонгоно",
    body: "Бийр, хуурай бийр, хэвлэмэл гэсэн гурван бичлэгийн хэв. Цаас, хар бэх, улаан ерөөл гэсэн гурван материал. Алтан хүрээ, улаан тамга нэмж болно.",
  },
  {
    mongol: "ᠪᠡᠯᠡᠭ",
    title: "Татаж авна",
    body: "Зургийг PNG-ээр татаад дэлгэцийн дэвсгэр, нийтлэл, бэлэг болгоно. Хүсвэл гараар бийрдүүлж захиална.",
  },
];

export default async function NamePage({
  searchParams,
}: {
  searchParams: Promise<{ ner?: string; hev?: string }>;
}) {
  // `?ner=Батбаяр` — бэлэн загварын холбоосыг хуваалцах боломж. Хэн нэгэн
  // найзындаа илгээхэд нээхэд нь шууд тэр нэр бичигдсэн байна.
  const [settings, { ner, hev }] = await Promise.all([
    getSettings(),
    searchParams,
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <PageHeader
        mongol="ᠨᠡᠷᠡ"
        eyebrow="Үнэгүй үйлчилгээ"
        title="Нэрийн уран бичлэг"
        lead="Нэрээ уламжлалт монгол бичгээр бичүүлж, бэлэн загварыг нь тэр дороо татаж аваарай. Монгол, гадаад нэр аль аль нь болно."
      />

      <div className="mt-14">
        <NameCalligraphy
          initialName={(ner ?? "").slice(0, 40)}
          initialScript={hev ?? ""}
          phone={settings.phone}
          facebook={settings.facebook}
        />
      </div>

      {/* --- Хэрхэн ажилладаг вэ ------------------------------------------- */}
      <section className="mt-20">
        <SectionHeading title="Гурван алхам" as="h2" />
        <div className="grid gap-px bg-[color:var(--line)] sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="flex items-start gap-5 bg-[color:var(--surface)] px-6 py-8"
            >
              <span aria-hidden className="mongol-spine shrink-0">
                <span className="mongol block text-[1.5rem] leading-none text-gold-600/70 dark:text-gold-400/60">
                  {step.mongol}
                </span>
              </span>
              <div>
                <h3 className="font-serif text-lg text-brand-950 dark:text-ivory-50">
                  <span className="mr-2 text-gold-600/70 dark:text-gold-400/60">
                    {index + 1}.
                  </span>
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[0.88rem] leading-7 text-brand-900/72 dark:text-ivory-100/66">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Бичлэгийн үнэн зөв байдал -------------------------------------- */}
      <section className="hairline mt-16 border p-8 sm:p-10">
        <h2 className="flex items-baseline gap-2.5 font-serif text-xl text-brand-950 dark:text-ivory-50">
          <Ulzii className="h-3.5 w-3.5 shrink-0 translate-y-[0.1em] text-gold-500" />
          Хөрвүүлэлтийн тухай үнэнээр
        </h2>
        <div className="mt-6 max-w-2xl space-y-5 text-[0.95rem] leading-8 text-brand-900/75 dark:text-ivory-100/68">
          <p>
            Монгол бичгийн зөв бичих зүй нь кирилл дуудлагаас салангид. «Жаргал»
            гэдэг нэр сонсогдох ёсоороо биш, сонгодог бичлэгээрээ ᠵᠢᠷᠭᠠᠯ гэж
            бичигддэг. Тиймээс сайт эхлээд нягталсан толиос хайж, олдохгүй бол
            дуудлагаар нь буулгадаг — тэр тохиолдолд үр дүн нь ойролцоо байна.
          </p>
          <p>
            Хөрвүүлсэн бичгийг та өөрөө засаж болно: «Монгол бичиг» талбарт
            гараар өөрчилвөл загвар шууд шинэчлэгдэнэ. Харин бэлэг, хана чимэх
            бүтээл захиалах бол багш эцсийн бичлэгийг гараар нягталж, залруулж
            өгнө — үүнд нэмэлт төлбөр авахгүй.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/surgalt" className="btn-gold">
            Бичгээ өөрөө сурах
          </Link>
          <Link href="/delguur?angilal=bichleg" className="btn-quiet">
            Бэлэн бүтээл үзэх
          </Link>
        </div>
      </section>
    </div>
  );
}
