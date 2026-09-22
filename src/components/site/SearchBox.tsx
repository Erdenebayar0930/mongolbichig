"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Цэсний баруун талын хайлт. Хаалттай үедээ зөвхөн товчлуур — цэсний
 * тэгш хэмийг эвдэхгүй. Дарахад талбар нь урсгалаас гадуур, цэсний мөрийн
 * дээгүүр зүүн тийш дэлгэгдэнэ.
 */
export default function SearchBox() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Escape дарахад хаана — талбар цэсийг халхалсан хэвээр үлдэх ёсгүй.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <form
      action="/haih"
      role="search"
      className="relative flex items-center"
      onSubmit={(event) => {
        const value = inputRef.current?.value.trim();
        if (!value) {
          event.preventDefault();
          setOpen(true);
          inputRef.current?.focus();
        }
      }}
    >
      <label htmlFor="site-search" className="sr-only">
        Хайх
      </label>
      <input
        ref={inputRef}
        id="site-search"
        type="search"
        name="q"
        placeholder="Хайх…"
        tabIndex={open ? undefined : -1}
        onBlur={() => {
          if (!inputRef.current?.value) setOpen(false);
        }}
        className={`absolute right-10 top-1/2 h-8 -translate-y-1/2 border-0 border-b bg-brand-950/95 text-[0.8rem] tracking-wide text-ivory-100 backdrop-blur transition-all duration-300 placeholder:text-ivory-100/40 focus:border-gold-400 focus:outline-none ${
          open
            ? "w-44 border-gold-500/40 px-2 opacity-100 sm:w-64"
            : "w-0 border-transparent px-0 opacity-0"
        }`}
      />
      <button
        type="submit"
        aria-label="Хайх"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid h-9 w-9 place-items-center text-ivory-100/70 transition-colors duration-300 hover:text-gold-300"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="h-[1.1rem] w-[1.1rem]"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </form>
  );
}
