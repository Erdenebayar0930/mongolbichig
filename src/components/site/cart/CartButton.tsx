"use client";

import Link from "next/link";

import { useCart } from "./CartProvider";

/**
 * Цэсэн дэх сагсны товч. Тоолуур нь localStorage-оос ирдэг тул серверийн
 * зурагдалтад байхгүй — `ready` болтол тэмдгийг нуух нь hydration зөрөхөөс
 * сэргийлнэ.
 */
export default function CartButton() {
  const { count, ready } = useCart();

  return (
    <Link
      href="/sags"
      aria-label={count > 0 ? `Сагс — ${count} бараа` : "Сагс"}
      className="relative grid h-9 w-9 place-items-center text-ivory-100/70 transition-colors duration-300 hover:text-gold-300"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[1.15rem] w-[1.15rem]"
        aria-hidden
      >
        <path d="M4 7h16l-1.3 11.2a2 2 0 0 1-2 1.8H7.3a2 2 0 0 1-2-1.8z" />
        <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
      </svg>

      {ready && count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center bg-gold-500 px-1 text-[0.6rem] font-bold leading-none text-brand-950">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
