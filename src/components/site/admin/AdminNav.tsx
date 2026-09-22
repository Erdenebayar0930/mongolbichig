"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "@/lib/site/actions/admin";

const LINKS = [
  { href: "/admin", label: "Самбар" },
  { href: "/admin/surgalt", label: "Сургалт" },
  { href: "/admin/delguur", label: "Дэлгүүр" },
  { href: "/admin/zahialga", label: "Захиалга" },
  { href: "/admin/burtgel", label: "Бүртгэл" },
  { href: "/admin/medee", label: "Мэдээ" },
  { href: "/admin/tohirgoo", label: "Тохиргоо" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="hairline flex flex-wrap items-center gap-x-1 gap-y-3 border-b pb-4">
      <Link
        href="/"
        className="mr-4 flex items-center gap-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold-700 dark:text-gold-300"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.svg" alt="" width={165} height={147} className="h-6 w-auto" />
        Сайт
      </Link>

      <nav className="flex flex-wrap items-center gap-1">
        {LINKS.map((link) => {
          // "/admin" нь бүх хаягийн угтвар тул түүнийг зөвхөн яг таарвал
          // идэвхтэй гэж үзнэ — эс бөгөөс бүх хуудсанд «Самбар» гэрэлтэнэ.
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 ${
                active
                  ? "text-gold-700 dark:text-gold-300"
                  : "text-brand-900/55 hover:text-brand-900 dark:text-ivory-100/50 dark:hover:text-ivory-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <form action={logout} className="ml-auto">
        <button
          type="submit"
          className="px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-brand-900/45 transition-colors duration-300 hover:text-rose-700 dark:text-ivory-100/45 dark:hover:text-rose-400"
        >
          Гарах
        </button>
      </form>
    </header>
  );
}
