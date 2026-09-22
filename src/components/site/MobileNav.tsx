"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { NAV } from "@/lib/site/nav";
import { Ulzii } from "@/components/site/ornament/Khee";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Хуудас солигдоход цэс өөрөө хаагдана — эс бөгөөс буцах товч дарахад
  // задарсан хэвээрээ үлддэг.
  useEffect(() => setOpen(false), [pathname]);

  // Цэс нээлттэй үед ард талын хуудас гүйлгэхийг хориглоно.
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="grid h-10 w-10 place-items-center text-ivory-100/85 transition-colors duration-300 hover:text-gold-300"
      >
        <span className="sr-only">Цэс</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="h-5 w-5"
          aria-hidden
        >
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open ? (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 bottom-0 top-[3.25rem] z-50 overflow-y-auto bg-brand-950/97 backdrop-blur-md"
        >
          <ul className="mx-auto max-w-7xl divide-y divide-gold-500/15 px-6 py-4">
            {[...NAV, { href: "/sags", label: "Сагс" }].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between py-5 text-sm font-semibold uppercase tracking-[0.18em] text-ivory-100/90"
                >
                  {item.label}
                  <Ulzii className="h-3.5 w-3.5 text-gold-500/70" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
