import Link from "next/link";

import {
  BrushSwipe,
  IconBrush,
  IconCalendar,
  IconClock,
  IconPin,
  IconSeat,
  IconTag,
  InkWash,
} from "@/components/site/ornament/Brush";
import { Ulzii } from "@/components/site/ornament/Khee";
import { fallbackCover, formatDateOnly, formatPrice } from "@/lib/site/format";
import { courseFormat } from "@/lib/site/taxonomy";
import type { SiteCourse } from "@/lib/site/db/schema";

/**
 * Элсэлтийн зар — хэвлэмэл зурагт хуудасны бүтцийг вэб рүү буулгав.
 *
 * Зурагт хуудсанд ажилладаг гурван зүйлийг авав: гарчгийн ард бийрээр
 * татсан алтан зурвас, булангуудын бэхэн будаг, гол мэдээллийг тус тусад нь
 * тодруулсан дугуй булантай бөмбөлгүүд. Ялгаа нь — энд бүх утга өгөгдлийн
 * сангаас ирнэ: админ хугацаа солиход зар нь өөрөө шинэчлэгдэнэ, дахин
 * зураг хийх шаардлагагүй.
 */
export default function EnrollBanner({ course }: { course: SiteCourse }) {
  const format = courseFormat(course.format);
  const seatsLeft = course.seats > 0 ? course.seats - course.seatsTaken : null;
  const full = seatsLeft !== null && seatsLeft <= 0;

  const facts = [
    {
      icon: <IconCalendar />,
      label: "Хугацаа",
      value: course.startDate
        ? `${formatDateOnly(course.startDate)}-нд эхэлнэ`
        : "Тасралтгүй элсэлт",
    },
    {
      icon: <IconClock />,
      label: "Хуваарь",
      value:
        course.schedule ||
        (course.durationWeeks > 0 ? `${course.durationWeeks} долоо хоног` : ""),
    },
    {
      icon: <IconBrush />,
      label: "Хэлбэр",
      value: format.label,
    },
    {
      icon: <IconTag />,
      label: "Төлбөр",
      value: course.price > 0 ? formatPrice(course.price) : "Үнэгүй",
    },
    {
      icon: <IconSeat />,
      label: "Суудал",
      value: full
        ? "Бүрдсэн"
        : seatsLeft !== null
          ? `${seatsLeft} сул`
          : "Нээлттэй",
    },
    {
      icon: <IconPin />,
      label: "Хаана",
      value: course.location,
    },
  ].filter((fact) => fact.value);

  return (
    <section className="surface relative overflow-hidden">
      {/* Бэхэн будаг — зөвхөн булангуудад, хэлбэр нь тодрох ёсгүй */}
      <InkWash
        className="pointer-events-none absolute -left-20 -top-24 h-72 w-80 blur-[22px] text-brand-900/[0.06] dark:text-ivory-100/[0.05]"
      />
      <InkWash
        className="pointer-events-none absolute -bottom-28 -right-12 h-80 w-96 rotate-180 blur-[26px] text-gold-600/[0.13] dark:text-gold-400/[0.1]"
      />

      <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center lg:gap-12 lg:p-12">
        {/* --- Зүүн: бичвэр --------------------------------------------- */}
        <div>
          {/* Алтан татлагын дээр суусан шошго */}
          <p className="relative inline-block px-4 py-1.5">
            <BrushSwipe className="absolute inset-0 h-full w-full text-gold-500/90" />
            <span className="relative font-serif text-[0.95rem] font-medium italic text-brand-950">
              Уран бичлэгийн
            </span>
          </p>

          <h2 className="mt-4 text-balance font-sans text-[1.9rem] font-extrabold uppercase leading-[1.08] tracking-[-0.01em] text-brand-950 dark:text-ivory-50 sm:text-[2.6rem]">
            {course.title}
          </h2>

          <p className="mt-3 font-serif text-2xl italic text-gold-600 dark:text-gold-300 sm:text-3xl">
            {full ? "бүлэг бүрдлээ" : "элсэлт авч байна!"}
          </p>

          <p className="mt-5 flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.2em] text-brand-900/60 dark:text-ivory-100/55">
            <span aria-hidden className="h-px w-8 bg-gold-500/60" />
            <Ulzii className="h-3 w-3 shrink-0 text-gold-500" />
            {course.durationWeeks > 0
              ? `${course.durationWeeks} долоо хоногийн багц хичээл`
              : "Багц хичээл"}
            <span aria-hidden className="h-px w-8 bg-gold-500/60" />
          </p>

          {/* --- Мэдээллийн бөмбөлгүүд --------------------------------- */}
          <dl className="mt-8 grid gap-3 sm:grid-cols-2">
            {facts.map((fact) => (
              <div key={fact.label} className="pill">
                <span aria-hidden className="pill-icon">
                  {fact.icon}
                </span>
                <div className="min-w-0">
                  <dt className="pill-label">{fact.label}</dt>
                  <dd className="pill-value truncate">{fact.value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href={`/surgalt/${course.slug}`} className="btn-solid">
              {full ? "Дэлгэрэнгүй" : "Бүртгүүлэх"}
            </Link>
            <Link href="/ner" className="btn-quiet">
              Нэрээ бичүүлэх
            </Link>
          </div>
        </div>

        {/* --- Баруун: зураг ба дугуй тэмдэг ---------------------------- */}
        <div className="relative mx-auto w-full max-w-xs lg:max-w-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={course.coverUrl || fallbackCover("course")}
            alt=""
            aria-hidden
            className="aspect-square w-full object-cover"
          />
          <span aria-hidden className="frame-khee pointer-events-none absolute inset-3" />

          {/*
            Зурагт хуудасны дугуй тэмдэг. Зургийн ирмэг дээр давхарлан суух
            нь хоёр өөр зүйлийг нэг эвлүүлэг болгоно.
          */}
          <div className="absolute -bottom-6 -left-6 grid h-32 w-32 place-items-center rounded-full bg-brand-950 p-4 text-center shadow-card sm:h-36 sm:w-36">
            <div>
              <IconBrush className="mx-auto h-6 w-6 text-gold-400" />
              <p className="mt-1.5 font-serif text-[0.82rem] italic leading-tight text-gold-300">
                Уран бичлэгээр
              </p>
              <p className="mt-1 text-[0.58rem] uppercase leading-snug tracking-[0.1em] text-ivory-100/70">
                өв соёлоо
                <br />
                өвлүүл
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
