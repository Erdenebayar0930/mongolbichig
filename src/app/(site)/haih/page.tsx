import type { Metadata } from "next";

import CourseCard from "@/components/site/CourseCard";
import NewsCard from "@/components/site/NewsCard";
import PageHeader from "@/components/site/PageHeader";
import ProductCard from "@/components/site/ProductCard";
import SectionHeading from "@/components/site/SectionHeading";
import { search } from "@/lib/site/queries";

export const metadata: Metadata = { title: "Хайлт" };

// Хайлтын үр дүн бүрэн динамик — кэшлэхгүй.
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();

  // Хоёроос богино үгээр хайвал бараг бүх мөр таарна — утгагүй тул хайхгүй.
  const results =
    term.length >= 2
      ? await search(term)
      : { courses: [], products: [], news: [] };

  const total =
    results.courses.length + results.products.length + results.news.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <PageHeader eyebrow="Сайт дотор" title="Хайлт" />

      <form
        action="/haih"
        role="search"
        className="mx-auto mt-10 flex max-w-xl items-center gap-4"
      >
        <label htmlFor="q" className="sr-only">
          Хайх үг
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={term}
          autoFocus
          placeholder="Сургалт, бүтээл, нийтлэл…"
          className="field"
        />
        <button type="submit" className="btn-gold shrink-0">
          Хайх
        </button>
      </form>

      {term.length >= 2 ? (
        <p className="mt-8 text-center text-[0.72rem] uppercase tracking-[0.18em] text-brand-900/55 dark:text-ivory-100/50">
          «{term}» — {total} илэрц
        </p>
      ) : null}

      {results.courses.length > 0 ? (
        <section className="mt-14">
          <SectionHeading title="Сургалт" as="h2" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {results.courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      ) : null}

      {results.products.length > 0 ? (
        <section className="mt-14">
          <SectionHeading title="Дэлгүүр" as="h2" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {results.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {results.news.length > 0 ? (
        <section className="mt-14">
          <SectionHeading title="Мэдээ" as="h2" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {results.news.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ) : null}

      {term.length >= 2 && total === 0 ? (
        <p className="mt-16 border border-dashed border-gold-500/30 p-14 text-center text-[0.85rem] uppercase tracking-[0.16em] text-brand-900/55 dark:text-ivory-100/50">
          Илэрц олдсонгүй
        </p>
      ) : null}
    </div>
  );
}
