"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export type Slide = {
  href: string;
  title: string;
  excerpt: string;
  cover: string;
  /** Зүүн дээд булангийн шошго: «Анхан шат», «Шинэ бүтээл» */
  badge: string;
  /** Доод мөрийн жижиг тэмдэглэгээ: эхлэх огноо эсвэл үнэ */
  meta: string;
  /** Товчны бичиг — сургалт бол «Дэлгэрэнгүй», бүтээл бол «Захиалах» */
  cta: string;
};

/**
 * Нүүрний том слайдер. 7 секунд тутам өөрөө солигдоно, гэхдээ хулгана дээр
 * нь очих буюу гараас чиглүүлэх үед зогсоно. Бүх слайд DOM-д байгаа —
 * зөвхөн ил/далд нь солигдоно, ингэснээр зураг бүрд дахин ачаалахгүй.
 */
export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (delta: number) => {
      setIndex((current) => (current + delta + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;

    const timer = setInterval(() => go(1), 7000);
    return () => clearInterval(timer);
  }, [go, paused, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="grid h-64 place-items-center border border-dashed border-gold-500/30 text-[0.75rem] uppercase tracking-[0.2em] text-brand-900/52 dark:text-ivory-100/46">
        Онцлох мэдээлэл алга
      </div>
    );
  }

  const current = slides[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Онцлох"
      className="hairline group relative overflow-hidden border bg-brand-950 shadow-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Гарчиг, тайлбар нь доод ирмэгт наалддаг тул хайрцаг хэт нам байвал
          дээшээ халина. Өргөн нэмэгдэх тусам хайрцгийг аажмаар намсгана. */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] xl:aspect-[16/9]">
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.href}
            aria-hidden={slideIndex !== index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              slideIndex === index ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.cover}
              alt={slide.title}
              className="h-full w-full object-cover"
              loading={slideIndex === 0 ? "eager" : "lazy"}
            />
            {/* Ковер зурган дээрөө бичигтэй байж болно — гарчиг түүнтэй
                зөрчилдөхгүйн тулд доод талыг нь бүрэн бүрхэх хөшиг. */}
            <div className="absolute inset-0 bg-brand-950/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/86 via-40% to-brand-950/10" />
          </div>
        ))}

        <span
          aria-hidden
          className="pointer-events-none absolute inset-4 frame-gold sm:inset-6"
        />

        <div className="absolute inset-x-0 bottom-0 p-7 sm:p-12">
          <p className="eyebrow inline-block border border-gold-500/40 bg-brand-950/70 px-3 py-1.5 text-gold-200 backdrop-blur-sm">
            {current.badge}
          </p>

          <h2 className="mt-5 max-w-3xl text-balance font-serif text-2xl font-medium leading-[1.2] text-ivory-50 sm:text-4xl">
            <Link
              href={current.href}
              className="transition-colors duration-300 hover:text-gold-200"
            >
              {current.title}
            </Link>
          </h2>

          {current.excerpt ? (
            <p className="mt-4 hidden max-w-xl text-[0.92rem] leading-7 text-ivory-100/72 sm:block">
              {current.excerpt}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href={current.href}
              className="border border-gold-500/70 px-6 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-gold-200 transition duration-300 hover:bg-gold-500 hover:text-brand-950"
            >
              {current.cta}
            </Link>
            <p className="flex items-center gap-3 text-[0.62rem] uppercase tracking-[0.22em] text-gold-300/70">
              <span aria-hidden className="h-px w-8 bg-gold-500/60" />
              {current.meta}
            </p>
          </div>
        </div>

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Өмнөх"
              className="absolute left-6 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center border border-gold-400/45 text-gold-200 opacity-0 transition duration-500 hover:bg-gold-500 hover:text-brand-950 focus-visible:opacity-100 group-hover:opacity-100 sm:left-10"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="h-4 w-4"
              >
                <path d="m15 6-6 6 6 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Дараах"
              className="absolute right-6 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center border border-gold-400/45 text-gold-200 opacity-0 transition duration-500 hover:bg-gold-500 hover:text-brand-950 focus-visible:opacity-100 group-hover:opacity-100 sm:right-10"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="h-4 w-4"
              >
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>

            <div className="absolute right-7 top-7 flex items-center gap-2 sm:right-12 sm:top-12">
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.href}
                  type="button"
                  onClick={() => setIndex(slideIndex)}
                  aria-label={`${slideIndex + 1}-р слайд`}
                  aria-current={slideIndex === index}
                  // Зураас нь нимгэн ч дарах талбай нь хуруунд багтахуйц байх
                  // ёстой — тиймээс өндрийг эргэн тойрны зайгаар авав.
                  className="group/dot flex h-6 items-center"
                >
                  <span
                    className={`block h-px transition-all duration-500 ${
                      slideIndex === index
                        ? "w-10 bg-gold-400"
                        : "w-5 bg-ivory-100/46 group-hover/dot:bg-ivory-100/70"
                    }`}
                  />
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
