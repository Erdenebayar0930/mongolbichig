import Link from "next/link";

import {
  IconBrush,
  IconCalendar,
  IconSeat,
} from "@/components/site/ornament/Brush";

import { fallbackCover, formatDateOnly, formatPrice, truncate } from "@/lib/site/format";
import { courseFormat, courseLevel } from "@/lib/site/taxonomy";
import type { SiteCourse } from "@/lib/site/db/schema";

export default function CourseCard({ course }: { course: SiteCourse }) {
  const level = courseLevel(course.level);
  const format = courseFormat(course.format);

  const seatsLeft = course.seats > 0 ? course.seats - course.seatsTaken : null;
  const full = seatsLeft !== null && seatsLeft <= 0;

  return (
    <article className="surface group flex h-full flex-col transition duration-500 hover:border-gold-500/50 hover:shadow-card-hover">
      <Link href={`/surgalt/${course.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={course.coverUrl || fallbackCover("course")}
            alt={course.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-[900ms] ease-out group-hover:scale-105"
          />
          <span
            aria-hidden
            className="frame-khee absolute inset-2 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
          <span className="absolute left-0 top-0 border border-gold-500/40 bg-brand-950/70 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-gold-200 backdrop-blur-sm">
            {level.label}
          </span>
          {full ? (
            <span className="absolute right-0 top-0 bg-seal-600/90 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-ivory-50">
              Бүрдсэн
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg font-medium leading-snug text-brand-950 dark:text-ivory-50 sm:text-xl">
          <Link
            href={`/surgalt/${course.slug}`}
            className="transition-colors duration-300 hover:text-brand-600 dark:hover:text-gold-300"
          >
            {course.title}
          </Link>
        </h3>

        {course.summary ? (
          <p className="mt-3 text-[0.9rem] leading-7 text-brand-900/72 dark:text-ivory-100/68">
            {truncate(course.summary, 120)}
          </p>
        ) : null}

        {/*
          Сургалтын гол баримтууд. Зарын хуудасны бөмбөлгүүдтэй нэг хэл —
          дүрс нь утгыг нь нэг харцаар хэлж, жагсаалт унших шаардлагагүй
          болгоно. Карт дотор тул цайвар хувилбар.
        */}
        <dl className="mt-5 space-y-2">
          {[
            {
              icon: <IconCalendar className="h-4 w-4" />,
              term: "Эхлэх",
              value: course.startDate
                ? formatDateOnly(course.startDate)
                : "Тасралтгүй элсэлт",
            },
            {
              icon: <IconBrush className="h-4 w-4" />,
              term: "Хэлбэр",
              value: `${format.label}${
                course.durationWeeks > 0
                  ? ` · ${course.durationWeeks} долоо хоног`
                  : ""
              }`,
            },
            ...(seatsLeft !== null && !full
              ? [
                  {
                    icon: <IconSeat className="h-4 w-4" />,
                    term: "Сул суудал",
                    value: `${seatsLeft}`,
                  },
                ]
              : []),
          ].map((fact) => (
            <div key={fact.term} className="pill-soft">
              <span aria-hidden className="pill-icon">
                {fact.icon}
              </span>
              <div className="min-w-0">
                <dt className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-brand-900/50 dark:text-ivory-100/45">
                  {fact.term}
                </dt>
                <dd className="text-[0.82rem] font-semibold text-brand-950 dark:text-ivory-50">
                  {fact.value}
                </dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="mt-auto pt-5">
          <span aria-hidden className="hairline mb-4 block w-full border-t" />
          <div className="flex items-center justify-between gap-4">
            <p className="font-serif text-xl text-gold-700 dark:text-gold-300">
              {course.price > 0 ? formatPrice(course.price) : "Үнэгүй"}
            </p>
            <Link
              href={`/surgalt/${course.slug}`}
              className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brand-900/60 transition-colors duration-300 hover:text-gold-600 dark:text-ivory-100/55 dark:hover:text-gold-300"
            >
              Дэлгэрэнгүй
              <span aria-hidden className="ml-2 inline-block">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
