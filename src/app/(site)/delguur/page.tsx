import type { Metadata } from "next";
import Link from "next/link";

import PageHeader from "@/components/site/PageHeader";
import ProductCard from "@/components/site/ProductCard";
import { formatPrice } from "@/lib/site/format";
import { getProductCounts, getProducts, getSettings } from "@/lib/site/queries";
import { PRODUCT_CATEGORIES } from "@/lib/site/taxonomy";
import { settingNumber } from "@/lib/site/settings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Дэлгүүр",
  description:
    "Уран бичлэгийн захиалгат бүтээл, бийр бэх, монгол бичгийн ном, бэлэг дурсгал.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ angilal?: string }>;
}) {
  const { angilal } = await searchParams;

  const active = PRODUCT_CATEGORIES.some((item) => item.value === angilal)
    ? angilal
    : undefined;

  const [products, counts, settings] = await Promise.all([
    getProducts({ category: active, limit: 60 }),
    getProductCounts(),
    getSettings(),
  ]);

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const freeFrom = settingNumber(settings.freeShippingFrom, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <PageHeader
        mongol="ᠳᠡᠯᠭᠡᠭᠦᠷ"
        eyebrow="Захиалга авна"
        title="Дэлгүүр"
        lead="Гараар бичсэн уран бичлэгийн бүтээл, бичгийн хэрэгсэл, ном. Сагсалж захиалгаа үлдээхэд бид утсаар холбогдоно."
      />

      {freeFrom > 0 ? (
        <p className="mx-auto mt-8 max-w-xl border border-gold-500/35 px-5 py-3 text-center text-[0.78rem] uppercase tracking-[0.14em] text-gold-700 dark:text-gold-300">
          {formatPrice(freeFrom)}-өөс дээш захиалгад хүргэлт үнэгүй
        </p>
      ) : null}

      {/* --- Ангиллын шүүлтүүр -------------------------------------------- */}
      <nav
        aria-label="Ангиллаар шүүх"
        className="mt-10 flex flex-wrap items-center justify-center gap-3"
      >
        <Link
          href="/delguur"
          aria-current={!active ? "page" : undefined}
          className={`chip transition-colors duration-300 ${
            active
              ? "border-[color:var(--line)] text-brand-900/60 hover:text-gold-700 dark:text-ivory-100/55"
              : "border-gold-500 bg-gold-500 text-brand-950"
          }`}
        >
          Бүгд {total > 0 ? `· ${total}` : ""}
        </Link>
        {PRODUCT_CATEGORIES.map((category) => (
          <Link
            key={category.value}
            href={`/delguur?angilal=${category.value}`}
            aria-current={active === category.value ? "page" : undefined}
            className={`chip transition-colors duration-300 ${
              active === category.value
                ? "border-gold-500 bg-gold-500 text-brand-950"
                : "border-[color:var(--line)] text-brand-900/60 hover:text-gold-700 dark:text-ivory-100/55"
            }`}
          >
            {category.label}
            {counts[category.value] ? ` · ${counts[category.value]}` : ""}
          </Link>
        ))}
      </nav>

      {products.length > 0 ? (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="mt-16 border border-dashed border-gold-500/30 p-14 text-center text-[0.85rem] uppercase tracking-[0.16em] text-brand-900/55 dark:text-ivory-100/50">
          Энэ ангилалд бүтээгдэхүүн алга
        </p>
      )}
    </div>
  );
}
