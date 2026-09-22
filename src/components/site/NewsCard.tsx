import Link from "next/link";
import { Ulzii } from "@/components/site/ornament/Khee";

import {
  fallbackCover,
  formatShortDate,
  toIsoDate,
  truncate,
} from "@/lib/site/format";
import type { SiteNews } from "@/lib/site/db/schema";

export default function NewsCard({
  post,
  size = "md",
}: {
  post: SiteNews;
  size?: "sm" | "md";
}) {
  return (
    <article className="surface group flex h-full flex-col transition duration-500 hover:border-gold-500/50 hover:shadow-card-hover">
      <Link href={`/medee/${post.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverUrl || fallbackCover("medee")}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-[900ms] ease-out group-hover:scale-105"
          />
          <span
            aria-hidden
            className="frame-khee absolute inset-2 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
          <span className="absolute left-0 top-0 border border-gold-500/40 bg-brand-950/70 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-gold-200 backdrop-blur-sm">
            {post.tag}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3
          className={`font-serif font-medium text-brand-950 dark:text-ivory-50 ${
            size === "sm" ? "text-[0.98rem] leading-snug" : "text-lg leading-snug sm:text-xl"
          }`}
        >
          <Link
            href={`/medee/${post.slug}`}
            className="transition-colors duration-300 hover:text-brand-600 dark:hover:text-gold-300"
          >
            {post.title}
          </Link>
        </h3>

        {size === "md" && post.excerpt ? (
          <p className="mt-3 text-[0.9rem] leading-7 text-brand-900/72 dark:text-ivory-100/68">
            {truncate(post.excerpt, 120)}
          </p>
        ) : null}

        <div className="mt-auto pt-5">
          <span aria-hidden className="hairline mb-3 block w-full border-t" />
          <div className="flex items-center gap-2.5 text-[0.65rem] uppercase tracking-[0.16em] text-brand-900/55 dark:text-ivory-100/50">
            <time dateTime={toIsoDate(post.publishedAt)}>
              {formatShortDate(post.publishedAt)}
            </time>
            <Ulzii className="h-3 w-3 shrink-0 text-gold-500/80" />
            <span>{post.author}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
