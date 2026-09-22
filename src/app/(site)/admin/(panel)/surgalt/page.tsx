import Link from "next/link";

import AdminHeading from "@/components/site/admin/AdminHeading";
import { formatDateOnly, formatPrice } from "@/lib/site/format";
import { adminListCourses } from "@/lib/site/queries";
import { courseLevel } from "@/lib/site/taxonomy";

export const metadata = { title: "Сургалт" };

export default async function AdminCoursesPage() {
  const courses = await adminListCourses();

  return (
    <>
      <AdminHeading
        title="Сургалт"
        count={courses.length}
        action={{ href: "/admin/surgalt/shine", label: "Шинэ сургалт" }}
      />

      {courses.length === 0 ? (
        <p className="border border-dashed border-gold-500/30 p-14 text-center text-[0.85rem] text-brand-900/55 dark:text-ivory-100/50">
          Сургалт хараахан бүртгээгүй байна.
        </p>
      ) : (
        <ul className="divide-y divide-[color:var(--line)] border-y hairline">
          {courses.map((course) => {
            const level = courseLevel(course.level);
            const draft = course.status !== "published";

            return (
              <li
                key={course.id}
                className="flex flex-wrap items-center gap-x-5 gap-y-2 py-4"
              >
                <Link
                  href={`/admin/surgalt/${course.id}`}
                  className="min-w-0 flex-1 transition-colors duration-300 hover:text-gold-700 dark:hover:text-gold-300"
                >
                  <span className="block truncate text-[0.95rem] text-brand-950 dark:text-ivory-50">
                    {course.title}
                  </span>
                  <span className="mt-1 block truncate text-[0.75rem] text-brand-900/48 dark:text-ivory-100/44">
                    /surgalt/{course.slug}
                  </span>
                </Link>

                <span className={`chip shrink-0 ${level.chip}`}>{level.label}</span>

                {draft ? (
                  <span className="chip shrink-0 border-[color:var(--line)] text-brand-900/50 dark:text-ivory-100/45">
                    Ноорог
                  </span>
                ) : null}

                {course.featured ? (
                  <span
                    aria-label="Нүүрний слайдерт"
                    title="Нүүрний слайдерт"
                    className="shrink-0 text-gold-500"
                  >
                    ★
                  </span>
                ) : null}

                <span className="w-32 shrink-0 text-right text-[0.8rem] text-brand-900/55 dark:text-ivory-100/50">
                  {course.startDate ? formatDateOnly(course.startDate) : "Тасралтгүй"}
                </span>

                <span className="w-28 shrink-0 text-right text-[0.85rem] tabular-nums text-brand-950 dark:text-ivory-50">
                  {course.price > 0 ? formatPrice(course.price) : "Үнэгүй"}
                </span>

                <span className="w-24 shrink-0 text-right text-[0.8rem] tabular-nums text-brand-900/55 dark:text-ivory-100/50">
                  {course.seats > 0
                    ? `${course.seatsTaken}/${course.seats}`
                    : `${course.seatsTaken} бүртгэл`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
