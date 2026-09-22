import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CourseCard from "@/components/site/CourseCard";
import EnrollForm from "@/components/site/EnrollForm";
import {
  IconBrush,
  IconCalendar,
  IconClock,
  IconPin,
  IconSeat,
} from "@/components/site/ornament/Brush";
import PageHeader from "@/components/site/PageHeader";
import Prose from "@/components/site/Prose";
import SectionHeading from "@/components/site/SectionHeading";
import { fallbackCover, formatDateOnly, formatPrice } from "@/lib/site/format";
import { getCourseBySlug, getRelatedCourses, getSettings } from "@/lib/site/queries";
import { courseFormat, courseLevel } from "@/lib/site/taxonomy";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) return { title: "Сургалт олдсонгүй" };

  return {
    title: course.title,
    description: course.summary || `${course.title} — монгол бичгийн сургалт`,
    openGraph: {
      title: course.title,
      description: course.summary,
      images: course.coverUrl ? [course.coverUrl] : undefined,
    },
  };
}

export default async function CoursePage({ params }: Params) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) notFound();

  const [related, settings] = await Promise.all([
    getRelatedCourses(course, 3),
    getSettings(),
  ]);

  const level = courseLevel(course.level);
  const format = courseFormat(course.format);
  const seatsLeft = course.seats > 0 ? course.seats - course.seatsTaken : null;
  const full = seatsLeft !== null && seatsLeft <= 0;

  /** Хажуугийн бөмбөлгүүд — хоосон утгатайг нь шүүж хаяна */
  const facts = [
    {
      icon: <IconCalendar className="h-4 w-4" />,
      term: "Эхлэх огноо",
      value: course.startDate
        ? formatDateOnly(course.startDate)
        : "Тасралтгүй элсэлт",
    },
    { icon: <IconBrush className="h-4 w-4" />, term: "Түвшин", value: level.label },
    { icon: <IconBrush className="h-4 w-4" />, term: "Хэлбэр", value: format.label },
    {
      icon: <IconClock className="h-4 w-4" />,
      term: "Үргэлжлэх",
      value: course.durationWeeks > 0 ? `${course.durationWeeks} долоо хоног` : "",
    },
    { icon: <IconClock className="h-4 w-4" />, term: "Хуваарь", value: course.schedule },
    { icon: <IconPin className="h-4 w-4" />, term: "Байршил", value: course.location },
    {
      icon: <IconSeat className="h-4 w-4" />,
      term: "Суудал",
      value:
        seatsLeft === null
          ? ""
          : full
            ? "Бүрдсэн"
            : `${seatsLeft} / ${course.seats} сул`,
    },
  ].filter((fact) => fact.value);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <PageHeader
        breadcrumbs={[
          { href: "/", label: "Нүүр" },
          { href: "/surgalt", label: "Сургалт" },
        ]}
        eyebrow={level.label}
        title={course.title}
        lead={course.summary}
      />

      {/* --- Ковер -------------------------------------------------------- */}
      <div className="relative mx-auto mt-12 max-w-5xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.coverUrl || fallbackCover("course")}
          alt={course.title}
          className="aspect-[16/9] w-full object-cover"
        />
        <span aria-hidden className="pointer-events-none absolute inset-3 frame-gold" />
      </div>

      <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        {/* --- Гол багана ------------------------------------------------- */}
        <div>
          {course.body ? <Prose text={course.body} /> : null}

          {course.syllabus.length > 0 ? (
            <section className="mx-auto mt-14 max-w-[38rem]">
              <SectionHeading title="Хөтөлбөр" as="h2" />
              <ol className="divide-y divide-[color:var(--line)]">
                {course.syllabus.map((topic, index) => (
                  <li key={topic} className="flex gap-5 py-4">
                    <span
                      aria-hidden
                      className="w-7 shrink-0 font-serif text-xl leading-none text-gold-500/70"
                    >
                      {`${index + 1}`.padStart(2, "0")}
                    </span>
                    <span className="text-[0.95rem] leading-7 text-brand-900/85 dark:text-ivory-100/78">
                      {topic}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>

        {/* --- Хажуугийн багана ------------------------------------------- */}
        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <div className="surface-raised p-6 text-center">
            <p className="eyebrow text-gold-600 dark:text-gold-400">Төлбөр</p>
            <p className="mt-3 font-serif text-4xl text-brand-950 dark:text-ivory-50">
              {course.price > 0 ? formatPrice(course.price) : "Үнэгүй"}
            </p>

            <dl className="mt-7 space-y-2 text-left">
              {facts.map((fact) => (
                <div key={fact.term} className="pill-soft">
                  <span aria-hidden className="pill-icon">
                    {fact.icon}
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-brand-900/50 dark:text-ivory-100/45">
                      {fact.term}
                    </dt>
                    <dd className="text-[0.84rem] font-semibold text-brand-950 dark:text-ivory-50">
                      {fact.value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {full ? (
            <div className="surface p-8 text-center">
              <h2 className="font-serif text-xl text-brand-950 dark:text-ivory-50">
                Бүлэг дүүрсэн
              </h2>
              <p className="mt-3 text-[0.88rem] leading-7 text-brand-900/72 dark:text-ivory-100/66">
                Дараагийн бүлгийн жагсаалтад орохыг хүсвэл{" "}
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="border-b border-gold-500/50 text-gold-700 dark:text-gold-300"
                >
                  {settings.phone}
                </a>{" "}
                дугаарт холбогдоно уу.
              </p>
            </div>
          ) : (
            <EnrollForm courseId={course.id} courseTitle={course.title} />
          )}
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mt-24">
          <SectionHeading title="Бусад сургалт" href="/surgalt" as="h2" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <CourseCard key={item.id} course={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
