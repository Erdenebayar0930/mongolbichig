import type { Metadata } from "next";
import { notFound } from "next/navigation";

import NewsCard from "@/components/site/NewsCard";
import PageHeader from "@/components/site/PageHeader";
import Prose from "@/components/site/Prose";
import { Ulzii } from "@/components/site/ornament/Khee";
import SectionHeading from "@/components/site/SectionHeading";
import {
  fallbackCover,
  formatDate,
  readingMinutes,
  toIsoDate,
} from "@/lib/site/format";
import { bumpNewsView, getNewsBySlug, getRelatedNews } from "@/lib/site/queries";

/**
 * Үзэлтийн тоог нэмэхийн тулд кэшлэхгүй. Хэрэв `revalidate` тавибал тоо нь
 * кэш шинэчлэгдэх бүрд л нэмэгдэж, утгагүй болно.
 */
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);

  if (!post) return { title: "Мэдээ олдсонгүй" };

  return {
    title: post.title,
    description: post.excerpt || post.title,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: toIsoDate(post.publishedAt),
      images: post.coverUrl ? [post.coverUrl] : undefined,
    },
  };
}

export default async function NewsArticlePage({ params }: Params) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);

  if (!post) notFound();

  const related = await getRelatedNews(post, 3);
  // Тоолуур хуудсыг саатуулах ёсгүй — үр дүнг нь хүлээхгүй.
  void bumpNewsView(post.id);

  return (
    <article className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <PageHeader
        breadcrumbs={[
          { href: "/", label: "Нүүр" },
          { href: "/medee", label: "Мэдээ" },
        ]}
        eyebrow={post.tag}
        title={post.title}
        lead={post.excerpt}
      />

      <p className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[0.65rem] uppercase tracking-[0.18em] text-brand-900/55 dark:text-ivory-100/50">
        <time dateTime={toIsoDate(post.publishedAt)}>
          {formatDate(post.publishedAt)}
        </time>
        <Ulzii className="h-3 w-3 shrink-0 text-gold-500/80" />
        <span>{post.author}</span>
        <Ulzii className="h-3 w-3 shrink-0 text-gold-500/80" />
        <span>{readingMinutes(post.body)} мин уншина</span>
      </p>

      <div className="relative mx-auto mt-12 max-w-4xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.coverUrl || fallbackCover("medee")}
          alt={post.title}
          className="aspect-[16/9] w-full object-cover"
        />
        <span aria-hidden className="pointer-events-none absolute inset-3 frame-gold" />
      </div>

      <div className="mt-14">
        <Prose text={post.body} />
      </div>

      {related.length > 0 ? (
        <section className="mt-24">
          <SectionHeading title="Бусад нийтлэл" href="/medee" as="h2" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <NewsCard key={item.id} post={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
