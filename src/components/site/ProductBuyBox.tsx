"use client";

import Link from "next/link";
import { useState } from "react";

import AddToCart from "./cart/AddToCart";
import { useCart, type CartItem } from "./cart/CartProvider";
import { formatPrice } from "@/lib/site/format";

/**
 * Тоо ширхэг сонгох + сагсанд хийх. Хоёулаа нэг л төлөв хуваалцдаг тул нэг
 * бүрэлдэхүүн: тоог өөрчлөөд сагсанд хийхэд яг тэр тоо орох ёстой.
 */
export default function ProductBuyBox({
  item,
  stock,
}: {
  item: Omit<CartItem, "qty">;
  /** -1 = захиалгаар, 0 = дууссан, >0 = үлдэгдэл */
  stock: number;
}) {
  const [qty, setQty] = useState(1);
  const { items } = useCart();

  const soldOut = stock === 0;
  const max = stock > 0 ? Math.min(stock, 99) : 99;
  const inCart = items.find((row) => row.slug === item.slug)?.qty ?? 0;

  return (
    <div>
      <div className="flex items-baseline gap-4">
        <p className="font-serif text-3xl text-brand-950 dark:text-ivory-50">
          {formatPrice(item.price * qty)}
        </p>
        {qty > 1 ? (
          <p className="text-[0.8rem] text-brand-900/55 dark:text-ivory-100/50">
            {formatPrice(item.price)} × {qty}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex items-stretch gap-3">
        <div className="hairline flex items-center border">
          <button
            type="button"
            onClick={() => setQty((value) => Math.max(1, value - 1))}
            disabled={soldOut || qty <= 1}
            aria-label="Тоог хасах"
            className="grid h-12 w-11 place-items-center text-lg text-brand-900/70 transition-colors duration-300 hover:text-gold-600 disabled:opacity-35 dark:text-ivory-100/65"
          >
            −
          </button>
          <span
            aria-live="polite"
            className="w-10 text-center text-[0.95rem] tabular-nums text-brand-950 dark:text-ivory-50"
          >
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((value) => Math.min(max, value + 1))}
            disabled={soldOut || qty >= max}
            aria-label="Тоог нэмэх"
            className="grid h-12 w-11 place-items-center text-lg text-brand-900/70 transition-colors duration-300 hover:text-gold-600 disabled:opacity-35 dark:text-ivory-100/65"
          >
            +
          </button>
        </div>

        <AddToCart
          item={item}
          qty={qty}
          disabled={soldOut}
          className="btn-solid flex-1"
        />
      </div>

      {inCart > 0 ? (
        <p className="mt-4 text-[0.82rem] text-brand-900/68 dark:text-ivory-100/62">
          Сагсанд {inCart} ширхэг байна.{" "}
          <Link
            href="/sags"
            className="border-b border-gold-500/50 text-gold-700 dark:text-gold-300"
          >
            Захиалга үргэлжлүүлэх
          </Link>
        </p>
      ) : null}

      <p className="mt-4 text-[0.82rem] leading-6 text-brand-900/60 dark:text-ivory-100/55">
        {soldOut
          ? "Одоогоор дууссан. Дахин хэзээ бэлэн болохыг утсаар лавлана уу."
          : stock > 0
            ? `Үлдэгдэл ${stock} ширхэг.`
            : "Захиалгаар хийгддэг тул бэлэн болох хугацааг ярилцаж тохирно."}
      </p>
    </div>
  );
}
