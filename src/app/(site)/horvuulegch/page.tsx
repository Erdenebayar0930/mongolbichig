import type { Metadata } from "next";
import Link from "next/link";

import PageHeader from "@/components/site/PageHeader";
import SectionHeading from "@/components/site/SectionHeading";
import TextConverter from "@/components/site/text/TextConverter";
import { Ulzii } from "@/components/site/ornament/Khee";

export const metadata: Metadata = {
  title: "Бичвэрийн хөрвүүлэгч",
  description:
    "Албан бичиг, урсгал кирилл бичвэрийг уламжлалт монгол бичигт хөрвүүлнэ. Тийн ялгалын нөхцөлийг дүрмээр нь салгаж, эргэлзээтэй үгийг тодруулж харуулна.",
  keywords: [
    "монгол бичгийн хөрвүүлэгч",
    "албан бичиг монгол бичгээр",
    "кирилл монгол бичиг хөрвүүлэх",
    "mongolian script converter",
  ],
};

/** Хөрвүүлэлт яагаад ийм бүтэцтэй болохыг тайлбарлах гурван зүйл */
const NOTES = [
  {
    mongol: "ᠲᠣᠯᠢ",
    title: "Толь эхэлж ярина",
    body: "Монгол бичгийн зөв бичих зүйг кирилл дуудлагаас гаргаж авах боломжгүй. «Тушаал» нь сонсогдох ёсоороо биш, сонгодог бичлэгээрээ ᠲᠤᠰᠢᠶᠠᠯ гэж бичигддэг. Тиймээс сайт эхлээд нягталсан толиос хайдаг.",
  },
  {
    mongol: "ᠨᠥᠬᠥᠴᠡᠯ",
    title: "Нөхцөл тусдаа бичигдэнэ",
    body: "Сонгодог бичигт тийн ялгалын нөхцөл язгуураасаа салж, нарийн зайгаар бичигддэг: улсын → ᠤᠯᠤᠰ ᠤᠨ. Нөхцлийн хэлбэрийг язгуурын сонгодог бичлэгээс сонгоно — «сарын» нь кириллээр гийгүүлэгчээр төгссөн ч ᠰᠠᠷᠠ эгшгээр төгсдөг тул ᠶᠢᠨ болно.",
  },
  {
    mongol: "ᠬᠢᠨᠠᠯᠲᠠ",
    title: "Эргэлзээтэйг нуухгүй",
    body: "Толинд байхгүй үгийг дуудлагаар буулгаад улаанаар тэмдэглэнэ. Албан бичиг хэвлэгдэж, гарын үсэг зурагддаг тул ямар ч арга 100% автомат байж чадахгүй — эргэлзээтэйг нь харуулах нь шударга.",
  },
];

export default function ConverterPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <PageHeader
        mongol="ᠪᠢᠴᠢᠭ"
        eyebrow="Үнэгүй үйлчилгээ"
        title="Бичвэрийн хөрвүүлэгч"
        lead="Албан бичиг, өгүүлбэр, урсгал бичвэрийг уламжлалт монгол бичигт хөрвүүлнэ. Тийн ялгалын нөхцөлийг дүрмээр нь салгаж, толинд байхгүй үгийг тодруулж харуулна."
      />

      <div className="mt-14">
        <TextConverter />
      </div>

      {/* --- Хэрхэн ажилладаг вэ ------------------------------------------- */}
      <section className="mt-20">
        <SectionHeading title="Хөрвүүлэлт хэрхэн явагддаг вэ" as="h2" />
        <div className="grid gap-px bg-[color:var(--line)] sm:grid-cols-3">
          {NOTES.map((note) => (
            <div
              key={note.title}
              className="flex items-start gap-5 bg-[color:var(--surface)] px-6 py-8"
            >
              <span aria-hidden className="mongol-spine shrink-0">
                <span className="mongol block text-[1.5rem] leading-none text-gold-600/70 dark:text-gold-400/60">
                  {note.mongol}
                </span>
              </span>
              <div>
                <h3 className="font-serif text-lg text-brand-950 dark:text-ivory-50">
                  {note.title}
                </h3>
                <p className="mt-2.5 text-[0.88rem] leading-7 text-brand-900/72 dark:text-ivory-100/66">
                  {note.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Хязгаар -------------------------------------------------------- */}
      <section className="hairline mt-16 border p-8 sm:p-10">
        <h2 className="flex items-baseline gap-2.5 font-serif text-xl text-brand-950 dark:text-ivory-50">
          <Ulzii className="h-3.5 w-3.5 shrink-0 translate-y-[0.1em] text-gold-500" />
          Юуг нь хараахан чадахгүй вэ
        </h2>
        <div className="mt-6 max-w-2xl space-y-5 text-[0.95rem] leading-8 text-brand-900/75 dark:text-ivory-100/68">
          <p>
            Толь өсөх тусам хөрвүүлэлт сайжирна. Одоогийн толь албан бичгийн
            хамгийн олон давтагддаг үгсийг хамарсан бөгөөд{" "}
            <strong className="font-semibold">багш хараахан нягтлаагүй</strong>{" "}
            — тиймээс ихэнх үг «ноорог» гэж тэмдэглэгдэнэ.
          </p>
          <p>
            Үйл үгийн нөхцөл (-х, -в, -сан, -ж) монгол бичигт язгуартаа залгаа
            бичигддэг тул тэдгээрийг салгадаггүй: түгээмэл хэлбэрүүдийг толинд
            бүтнээр нь бүртгэсэн. Толинд байхгүй үйл үг дуудлагаар гарна.
          </p>
          <p>
            Тоонд залгасан нөхцөл («20-ны») тухайн тоо хэрхэн уншигдахаас
            хамаардаг тул үргэлж тааварласан гэж тэмдэглэгдэнэ.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/ner" className="btn-gold">
            Нэрээ бичүүлэх
          </Link>
          <Link href="/surgalt" className="btn-quiet">
            Бичгээ өөрөө сурах
          </Link>
        </div>
      </section>
    </div>
  );
}
