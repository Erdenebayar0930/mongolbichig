import AdminHeading from "@/components/site/admin/AdminHeading";
import { setEnrollmentStatus } from "@/lib/site/actions/admin";
import { formatDateTime } from "@/lib/site/format";
import { adminListEnrollments } from "@/lib/site/queries";
import { ENROLLMENT_STATUSES, enrollmentStatus } from "@/lib/site/taxonomy";

export const metadata = { title: "Сургалтын бүртгэл" };

export default async function AdminEnrollmentsPage() {
  const enrollments = await adminListEnrollments();

  return (
    <>
      <AdminHeading title="Сургалтын бүртгэл" count={enrollments.length} />

      {enrollments.length === 0 ? (
        <p className="border border-dashed border-gold-500/30 p-14 text-center text-[0.85rem] text-brand-900/55 dark:text-ivory-100/50">
          Бүртгэлийн хүсэлт алга.
        </p>
      ) : (
        <ul className="divide-y divide-[color:var(--line)] border-y hairline">
          {enrollments.map((entry) => {
            const status = enrollmentStatus(entry.status);

            return (
              <li
                key={entry.id}
                className="flex flex-wrap items-start gap-x-5 gap-y-3 py-5"
              >
                <span className="w-32 shrink-0 text-[0.76rem] text-brand-900/50 dark:text-ivory-100/45">
                  {formatDateTime(entry.createdAt)}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-[0.95rem] text-brand-950 dark:text-ivory-50">
                    {entry.name}{" "}
                    <a
                      href={`tel:${entry.phone}`}
                      className="ml-2 border-b border-gold-500/40 text-[0.85rem] transition-colors hover:text-gold-700 dark:hover:text-gold-300"
                    >
                      {entry.phone}
                    </a>
                  </p>
                  <p className="mt-1 text-[0.8rem] text-brand-900/58 dark:text-ivory-100/52">
                    {entry.courseTitle}
                    {entry.email ? ` · ${entry.email}` : ""}
                  </p>
                  {entry.note ? (
                    <p className="mt-2 whitespace-pre-line text-[0.82rem] leading-6 text-brand-900/70 dark:text-ivory-100/62">
                      {entry.note}
                    </p>
                  ) : null}
                </div>

                <span className={`chip shrink-0 ${status.chip}`}>
                  {status.label}
                </span>

                {/* Төлөв бүрд тусдаа маягт — JS-гүйгээр ч ажиллана */}
                <div className="flex shrink-0 gap-2">
                  {ENROLLMENT_STATUSES.filter(
                    (option) => option.value !== entry.status
                  ).map((option) => (
                    <form key={option.value} action={setEnrollmentStatus}>
                      <input type="hidden" name="id" value={entry.id} />
                      <input type="hidden" name="status" value={option.value} />
                      <button
                        type="submit"
                        className="border px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-brand-900/55 transition-colors duration-300 hover:border-gold-500/60 hover:text-gold-700 dark:text-ivory-100/50 dark:hover:text-gold-300"
                        style={{ borderColor: "var(--line)" }}
                      >
                        {option.label}
                      </button>
                    </form>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
