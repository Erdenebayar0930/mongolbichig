import Link from "next/link";

import CartButton from "./cart/CartButton";
import MobileNav from "./MobileNav";
import SearchBox from "./SearchBox";
import ThemeToggle from "./ThemeToggle";
import { Gal, Ulzii } from "@/components/site/ornament/Khee";
import { NAV } from "@/lib/site/nav";

/**
 * Толгой хэсэг — тэгш хэмтэй, төвлөрсөн байрлал. Тансаг харагдац нь өнгө
 * ихсэхээс биш, зай, тэгш хэм, нимгэн алтан зураасаас төрдөг.
 *
 * Бүтэц нь уламжлалт бичээсийг дуурайв: голд нь тамга ба нэр, хоёр хажууд нь
 * дээрээс доош уншигдах босоо бичгийн багана, доод ирмэгт нь алхан хээ.
 */
export default function SiteHeader() {
  return (
    <header>
      {/* --- Туг ----------------------------------------------------------- */}
      <div className="relative overflow-hidden bg-brand-950">
        {/* Гүн хөх дэвсгэр — төвөөсөө гэрэлтсэн байдалтай */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,var(--color-brand-800),var(--color-brand-950)_70%)]"
        />
        {/* Алхан хээ — мэдэгдэхээргүй бүдэг, зөвхөн гадаргууг «даавуутай» болгоно */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[url('/brand/khee.svg')] bg-[length:120px_120px] opacity-[0.07]"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-7 text-center sm:px-6 sm:py-11">
          {/*
            Хоёр хажуугийн босоо бичиг. Утга нь гарчигтайгаа давхцаж байгаа
            тул дэлгэц уншигчид сонсгохгүй. Нарийн дэлгэцэд багтахгүй учир
            зөвхөн lg-ээс дээш гарна.
          */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-6 hidden items-center lg:flex xl:left-14"
          >
            <div className="mongol-spine">
              <span className="mongol block text-[1.35rem] leading-none text-gold-300/55">
                ᠮᠣᠩᠭᠣᠯ ᠪᠢᠴᠢᠭ
              </span>
            </div>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-6 hidden items-center lg:flex xl:right-14"
          >
            <div className="mongol-spine-l">
              <span className="mongol block text-[1.35rem] leading-none text-gold-300/55">
                ᠤᠷᠠᠨ ᠪᠢᠴᠢᠯᠭᠡ
              </span>
            </div>
          </div>

          {/*
            Логоны бүтэц: дээр нь гал, дунд нь бичээс, доор нь тамга. Толгой
            хэсэг ч мөн тэр дарааллыг барина.
          */}
          <Gal className="mx-auto h-8 w-8 text-seal-500 drop-shadow-[0_0_22px_rgba(212,42,30,0.5)] sm:h-11 sm:w-11" />

          <p className="eyebrow mt-5 flex items-center justify-center gap-3 text-gold-400/90">
            <span
              aria-hidden
              className="h-px w-8 bg-gradient-to-r from-transparent to-gold-500/70 sm:w-14"
            />
            Монгол бичгийн өв
            <span
              aria-hidden
              className="h-px w-8 bg-gradient-to-l from-transparent to-gold-500/70 sm:w-14"
            />
          </p>

          <Link href="/" className="mt-5 inline-block" aria-label="Нүүр хуудас">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo.svg"
              alt="Уран бичлэг тамга"
              width={165}
              height={147}
              className="mx-auto h-[4.25rem] w-auto drop-shadow-[0_8px_26px_rgba(212,42,30,0.38)] sm:h-24"
            />
          </Link>

          <Link href="/" className="mt-5 block">
            <h1 className="text-balance font-serif text-[1.35rem] font-medium leading-tight tracking-[0.06em] text-ivory-50 sm:text-4xl lg:text-[2.85rem]">
              Уран бичлэг <span className="text-gold-500/70">&amp;</span> Монгол
              өв соёл
            </h1>
          </Link>

          <p className="mt-4 text-[0.68rem] uppercase tracking-[0.28em] text-gold-200/70 sm:text-xs">
            Сургалт <span className="text-gold-500/60">·</span> Уран бүтээл{" "}
            <span className="text-gold-500/60">·</span> Захиалга
          </p>
        </div>

        {/*
          Тугны доод ирмэг: алхан хээний зурвас, дор нь алтан үс. Хоёулаа
          `relative` байх ёстой — тугны дэвсгэрийн градиент нь `absolute`
          давхарга тул байрлалгүй ах дүү элементүүдээ дараад далдалчихна.
        */}
        <div aria-hidden className="khee-band relative" />
        <div aria-hidden className="rule-gold relative" />
      </div>

      {/* --- Цэс ----------------------------------------------------------- */}
      {/* Бүрэн дүүрэн: тунгалаг байхад цайвар горимд доорх цаасан өнгийг
          соруулж, тугнаас тасарсан бүдэг зурвас мэт харагддаг. Цэс нь тугны
          үргэлжлэл учир яг ижил өнгөтэй байх ёстой. */}
      <nav className="sticky top-0 z-40 border-b border-gold-500/25 bg-brand-950">
        <div className="mx-auto flex max-w-7xl items-center px-2 sm:px-4">
          <MobileNav />

          {/* Баруун талын товчлууруудтай ижил өргөнтэй хоосон зай — цэс
              жинхэнэ утгаараа төвдөө байхын тулд. */}
          <div aria-hidden className="hidden shrink-0 md:block md:w-[7.5rem]" />

          <ul className="hidden min-w-0 flex-1 items-center justify-center md:flex">
            {NAV.map((item, index) => (
              <li key={item.href} className="flex items-center">
                {index > 0 ? (
                  <Ulzii className="mx-0.5 h-3 w-3 shrink-0 text-gold-500/45 lg:mx-1.5" />
                ) : null}
                <Link
                  href={item.href}
                  className="group relative px-2.5 py-4 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ivory-100/80 transition-colors duration-300 hover:text-gold-300 lg:px-3.5 lg:text-[0.74rem]"
                >
                  {item.label}
                  {/* Доогуур нь алтан зураас — hover дээр төвөөсөө дэлгэгдэнэ */}
                  <span
                    aria-hidden
                    className="absolute inset-x-2.5 bottom-2.5 h-px origin-center scale-x-0 bg-gold-500 transition-transform duration-300 group-hover:scale-x-100 lg:inset-x-3.5"
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex shrink-0 items-center justify-end gap-1 py-2 md:ml-0 md:w-[7.5rem]">
            <SearchBox />
            <CartButton />
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
