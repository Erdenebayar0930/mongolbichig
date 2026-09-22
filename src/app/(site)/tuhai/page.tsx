import type { Metadata } from "next";
import Link from "next/link";

import PageHeader from "@/components/site/PageHeader";
import Prose from "@/components/site/Prose";
import SectionHeading from "@/components/site/SectionHeading";
import { getSettings } from "@/lib/site/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Бидний тухай",
  description:
    "Уран бичлэг & Монгол өв соёл — сургалт, захиалгат бүтээлийн студи. Холбоо барих мэдээлэл.",
};

/** Босоо монгол бичгээр бичсэн чимэглэл — утга нь хажуудаа кириллээр давхарлана */
const MOTTO = [
  { mongol: "ᠮᠣᠩᠭᠣᠯ ᠪᠢᠴᠢᠭ", label: "Монгол бичиг" },
  { mongol: "ᠤᠷᠠᠨ ᠪᠢᠴᠢᠯᠭᠡ", label: "Уран бичлэг" },
  { mongol: "ᠥᠪ ᠰᠣᠶᠣᠯ", label: "Өв соёл" },
];

export default async function AboutPage() {
  const settings = await getSettings();

  const contacts = [
    { term: "Утас", value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` },
    settings.phone2
      ? {
          term: "Нэмэлт утас",
          value: settings.phone2,
          href: `tel:${settings.phone2.replace(/\s/g, "")}`,
        }
      : null,
    { term: "И-мэйл", value: settings.email, href: `mailto:${settings.email}` },
    { term: "Хаяг", value: settings.address, href: "" },
    { term: "Ажиллах цаг", value: settings.workingHours, href: "" },
    { term: "Facebook", value: "Уран бичлэг & Монгол өв соёл", href: settings.facebook },
  ].filter((row): row is { term: string; value: string; href: string } =>
    Boolean(row && row.value)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <PageHeader
        mongol="ᠥᠪ ᠰᠣᠶᠣᠯ"
        eyebrow="Танилцуулга"
        title="Бидний тухай"
        lead={settings.aboutText}
      />

      {/* --- Босоо бичгийн чимэглэл --------------------------------------- */}
      <section className="relative mt-14 overflow-hidden bg-brand-950 px-6 py-14">
        <div
          aria-hidden
          className="absolute inset-0 bg-[url('/brand/khee.svg')] bg-[length:120px_120px] opacity-[0.06]"
        />
        <span aria-hidden className="pointer-events-none absolute inset-4 frame-gold" />
        <div className="relative flex flex-wrap items-start justify-center gap-12 sm:gap-20">
          {MOTTO.map((entry) => (
            <div key={entry.label} className="text-center">
              {/* Багана бүр ижил өндөртэй — эс бөгөөс доорх кирилл шошгууд
                  үгийн уртаас хамаараад шат шиг тэгширхээ болино. */}
              <span
                aria-hidden
                className="mongol-spine mx-auto flex h-48 items-center justify-center"
              >
                <span className="mongol text-[2rem] leading-none text-gold-300">
                  {entry.mongol}
                </span>
              </span>
              <p className="mt-6 text-[0.62rem] uppercase tracking-[0.24em] text-gold-200/65">
                {entry.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <div>
          <SectionHeading title="Юу хийдэг вэ" as="h2" />
          <Prose
            text={`Бид монгол бичгийг өдөр тутмын хэрэглээ болгож, уран бичлэгийн урлагийг сурталчлах зорилготой сургалт, бүтээлийн студи юм. Анхан шатнаас эхлэн үсэг таних, үг холбох, бийр барих техник, хэв маягийн ялгааг дараалалтай заана.

Сургалт нь танхим болон онлайнаар явагдана. Хичээл бүр дадлагатай — анги дүүрэн цаас, бэх, бийр байх бөгөөд суралцагч эхний өдрөөсөө гараараа бичиж эхэлнэ.

«Бичиг бол хэлний хувцас, уран бичлэг бол түүний хатгамал.»

Мөн захиалгаар уран бичлэгийн бүтээл гүйцэтгэнэ: нэр, ерөөл, айлын өргөө чимэх бичээс, гэрчилгээ, тэмдэглэлт ойн бэлэг. Хүссэн үг, хэмжээ, хүрээг ярилцаж тохирно.`}
          />

          {/* Бичээсийн адил төгсгөлд нь тамга. Гоёл тул нэрлэхгүй. */}
          <div className="prose-site mt-10 flex justify-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/tamga.svg"
              alt=""
              aria-hidden
              width={96}
              height={96}
              className="tamga h-16 w-16 -rotate-3 opacity-80"
            />
          </div>
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <div className="surface-raised p-6">
            <h2 className="eyebrow text-gold-600 dark:text-gold-400">
              Холбоо барих
            </h2>

            <dl className="mt-6 space-y-4 text-[0.88rem]">
              {contacts.map((contact) => (
                <div key={contact.term}>
                  <dt className="text-[0.68rem] uppercase tracking-[0.18em] text-brand-900/55 dark:text-ivory-100/50">
                    {contact.term}
                  </dt>
                  <dd className="mt-1.5 text-brand-950 dark:text-ivory-50">
                    {contact.href ? (
                      <a
                        href={contact.href}
                        target={contact.href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          contact.href.startsWith("http")
                            ? "noreferrer noopener"
                            : undefined
                        }
                        className="border-b border-gold-500/40 pb-0.5 transition-colors duration-300 hover:border-gold-500 hover:text-gold-700 dark:hover:text-gold-300"
                      >
                        {contact.value}
                      </a>
                    ) : (
                      contact.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="surface p-6 text-center">
            <p className="font-serif text-lg text-brand-950 dark:text-ivory-50">
              Сургалтад бүртгүүлэх үү?
            </p>
            <p className="mt-3 text-[0.85rem] leading-6 text-brand-900/68 dark:text-ivory-100/62">
              Нээлттэй бүлгүүдийн хуваарь, төлбөрийг сургалтын хуудсаас үзнэ үү.
            </p>
            <Link href="/surgalt" className="btn-gold mt-6 w-full">
              Сургалт үзэх
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
