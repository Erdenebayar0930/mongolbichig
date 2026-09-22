import Link from "next/link";

import AddToCart from "./cart/AddToCart";
import { fallbackCover, formatPrice, truncate } from "@/lib/site/format";
import { productCategory } from "@/lib/site/taxonomy";
import type { SiteProduct } from "@/lib/site/db/schema";

export default function ProductCard({ product }: { product: SiteProduct }) {
  const category = productCategory(product.category);
  const cover = product.coverUrl || fallbackCover(product.category);
  // `stock === -1` — захиалгаар хийгддэг тул үлдэгдэл ярих утгагүй.
  const soldOut = product.stock === 0;

  return (
    <article className="surface group flex h-full flex-col transition duration-500 hover:border-gold-500/50 hover:shadow-card-hover">
      <Link href={`/delguur/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-[900ms] ease-out group-hover:scale-105"
          />
          <span
            aria-hidden
            className="frame-khee absolute inset-2 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
          <span className="absolute left-0 top-0 border border-gold-500/40 bg-brand-950/70 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-gold-200 backdrop-blur-sm">
            {category.label}
          </span>
          {soldOut ? (
            <span className="absolute inset-0 grid place-items-center bg-brand-950/70 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-ivory-100">
              Дууссан
            </span>
          ) : product.oldPrice > product.price ? (
            <span className="absolute right-0 top-0 bg-gold-500 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-brand-950">
              Хямдрал
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-[1.05rem] font-medium leading-snug text-brand-950 dark:text-ivory-50">
          <Link
            href={`/delguur/${product.slug}`}
            className="transition-colors duration-300 hover:text-brand-600 dark:hover:text-gold-300"
          >
            {product.name}
          </Link>
        </h3>

        {product.summary ? (
          <p className="mt-2.5 text-[0.85rem] leading-6 text-brand-900/70 dark:text-ivory-100/64">
            {truncate(product.summary, 90)}
          </p>
        ) : null}

        <div className="mt-auto pt-5">
          <div className="flex items-baseline gap-3">
            <p className="font-serif text-xl text-gold-700 dark:text-gold-300">
              {formatPrice(product.price)}
            </p>
            {product.oldPrice > product.price ? (
              <p className="text-[0.8rem] text-brand-900/45 line-through dark:text-ivory-100/40">
                {formatPrice(product.oldPrice)}
              </p>
            ) : null}
          </div>

          <AddToCart
            className="btn-quiet mt-4 w-full"
            disabled={soldOut}
            item={{
              slug: product.slug,
              name: product.name,
              price: product.price,
              coverUrl: cover,
            }}
          />
        </div>
      </div>
    </article>
  );
}
