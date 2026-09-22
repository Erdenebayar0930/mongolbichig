"use client";

import { useEffect, useState } from "react";

/**
 * Гэрэл/харанхуй сэлгүүр. Сонголтыг localStorage-д хадгална — эхний зурагдалт
 * дээр анивчихаас сэргийлэх скрипт layout.tsx-ийн <head> дотор сууна.
 */
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setReady(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    try {
      localStorage.setItem("site-theme", next ? "dark" : "light");
    } catch {
      // Хувийн горимд localStorage хаалттай байж болно — алдаа биш
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Гэрэлтэй горим" : "Харанхуй горим"}
      className="grid h-9 w-9 place-items-center text-ivory-100/70 transition-colors duration-300 hover:text-gold-300"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="h-[1.15rem] w-[1.15rem]"
        aria-hidden
      >
        {ready && dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
          </>
        ) : (
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
        )}
      </svg>
    </button>
  );
}
