import type { Metadata } from "next";

import NewsCard from "@/components/site/NewsCard";
import PageHeader from "@/components/site/PageHeader";
import { getNews } from "@/lib/site/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Мэдээ",
  description:
    "Монгол бичгийн түүх, уран бичлэгийн арга барил, сургалтын зар, арга хэмжээний мэдээ.",
};

export default async function NewsPage() {
  const news = await getNews(36);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <PageHeader
        mongol="ᠮᠡᠳᠡᠭᠡ"
        eyebrow="Уншлага"
        title="Мэдээ, нийтлэл"
        lead="Монгол бичгийн түүх, бийр барих арга, сургалтын зар болон бидний оролцсон арга хэмжээ."
      />

      {news.length > 0 ? (
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((post) => (
            <NewsCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="mt-16 border border-dashed border-gold-500/30 p-14 text-center text-[0.85rem] uppercase tracking-[0.16em] text-brand-900/55 dark:text-ivory-100/50">
          Мэдээ хараахан ороогүй байна
        </p>
      )}
    </div>
  );
}
