import Link from "next/link";

import AdminHeading from "@/components/site/admin/AdminHeading";
import { formatShortDate } from "@/lib/site/format";
import { adminListNews } from "@/lib/site/queries";

export const metadata = { title: "Мэдээ" };

export default async function AdminNewsPage() {
  const news = await adminListNews();

  return (
    <>
      <AdminHeading
        title="Мэдээ"
        count={news.length}
        action={{ href: "/admin/medee/shine", label: "Шинэ мэдээ" }}
      />

      {news.length === 0 ? (
        <p className="border border-dashed border-gold-500/30 p-14 text-center text-[0.85rem] text-brand-900/55 dark:text-ivory-100/50">
          Мэдээ хараахан бичээгүй байна.
        </p>
      ) : (
        <ul className="divide-y divide-[color:var(--line)] border-y hairline">
          {news.map((post) => (
            <li
              key={post.id}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 py-4"
            >
              <Link
                href={`/admin/medee/${post.id}`}
                className="min-w-0 flex-1 transition-colors duration-300 hover:text-gold-700 dark:hover:text-gold-300"
              >
                <span className="block truncate text-[0.95rem] text-brand-950 dark:text-ivory-50">
                  {post.title}
                </span>
                <span className="mt-1 block truncate text-[0.75rem] text-brand-900/48 dark:text-ivory-100/44">
                  /medee/{post.slug}
                </span>
              </Link>

              <span className="chip shrink-0 border-[color:var(--line)] text-brand-900/60 dark:text-ivory-100/55">
                {post.tag}
              </span>

              {post.status !== "published" ? (
                <span className="chip shrink-0 border-[color:var(--line)] text-brand-900/50 dark:text-ivory-100/45">
                  Ноорог
                </span>
              ) : null}

              <span className="w-28 shrink-0 text-right text-[0.8rem] text-brand-900/55 dark:text-ivory-100/50">
                {formatShortDate(post.publishedAt)}
              </span>

              <span className="w-20 shrink-0 text-right text-[0.8rem] tabular-nums text-brand-900/45 dark:text-ivory-100/40">
                {post.viewCount} үз
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
