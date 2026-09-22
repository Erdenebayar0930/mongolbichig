import type { Metadata } from "next";
import Link from "next/link";

import CourseCard from "@/components/site/CourseCard";
import EnrollBanner from "@/components/site/EnrollBanner";
import PageHeader from "@/components/site/PageHeader";
import { COURSE_LEVELS } from "@/lib/site/taxonomy";
import { getCourses } from "@/lib/site/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Сургалт",
  description:
    "Монгол бичиг, уран бичлэгийн анхан, дунд, ахисан шатны сургалтын хуваарь, төлбөр, бүртгэл.",
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ tuvshin?: string }>;
}) {
  const { tuvshin } = await searchParams;

  // Танихгүй утга ирвэл шүүлтгүйгээр үзүүлнэ — хаягийн мөрөнд юу ч бичиж
  // болох тул хоосон хуудас гаргахаас илүү бүгдийг харуулсан нь дээр.
  const active = COURSE_LEVELS.some((level) => level.value === tuvshin)
    ? tuvshin
    : undefined;

  const courses = await getCourses({ level: active, limit: 48 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <PageHeader
        mongol="ᠰᠤᠷᠭᠠᠯ"
        eyebrow="Хуваарь ба бүртгэл"
        title="Сургалт"
        lead="Монгол бичгийн үндсээс уран бичлэгийн ахисан шат хүртэл. Танхим болон онлайнаар."
      />

      {/* --- Элсэлтийн зар ------------------------------------------------- */}
      {/* Жагсаалтын эхний сургалт — эрэмбэ нь админы дараалал, дараа нь
          эхлэх огноогоор явдаг тул хамгийн ойрын нээлттэй бүлэг дээр гарна. */}
      {courses.length > 0 ? (
        <div className="mt-12">
          <EnrollBanner course={courses[0]} />
        </div>
      ) : null}

      {/* --- Түвшний шүүлтүүр --------------------------------------------- */}
      <nav
        aria-label="Түвшнээр шүүх"
        className="mt-14 flex flex-wrap items-center justify-center gap-3"
      >
        <Link
          href="/surgalt"
          aria-current={!active ? "page" : undefined}
          className={`chip transition-colors duration-300 ${
            active
              ? "border-[color:var(--line)] text-brand-900/60 hover:text-gold-700 dark:text-ivory-100/55"
              : "border-gold-500 bg-gold-500 text-brand-950"
          }`}
        >
          Бүгд
        </Link>
        {COURSE_LEVELS.map((level) => (
          <Link
            key={level.value}
            href={`/surgalt?tuvshin=${level.value}`}
            aria-current={active === level.value ? "page" : undefined}
            className={`chip transition-colors duration-300 ${
              active === level.value
                ? "border-gold-500 bg-gold-500 text-brand-950"
                : "border-[color:var(--line)] text-brand-900/60 hover:text-gold-700 dark:text-ivory-100/55"
            }`}
          >
            {level.label}
          </Link>
        ))}
      </nav>

      {courses.length > 0 ? (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <p className="mt-16 border border-dashed border-gold-500/30 p-14 text-center text-[0.85rem] uppercase tracking-[0.16em] text-brand-900/55 dark:text-ivory-100/50">
          Энэ түвшинд одоогоор нээлттэй сургалт алга
        </p>
      )}
    </div>
  );
}
