import Link from "next/link";

import { KheeDivider } from "@/components/site/ornament/Khee";
import { NAV } from "@/lib/site/nav";
import { PRODUCT_CATEGORIES } from "@/lib/site/taxonomy";
import type { Settings } from "@/lib/site/settings";

export default function SiteFooter({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-brand-950 text-ivory-100">
      <div aria-hidden className="rule-gold" />
      <div aria-hidden className="khee-band" />

      {/* --- Тамга ба уриа ------------------------------------------------- */}
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-14 text-center sm:px-6">
        {/*
          Тамга голдоо, хоёр тал нь босоо бичиг — уламжлалт бичээсийн адил
          гурван багана. Утга нь доорх кирилл нэртэйгээ давхцаж байгаа тул
          босоо бичгүүд дэлгэц уншигчид сонсдохгүй.
        */}
        <div className="flex items-center justify-center gap-8">
          <span
            aria-hidden
            className="mongol hidden text-[1.15rem] leading-none text-gold-300/50 sm:block"
          >
            ᠥᠪ ᠰᠣᠶᠣᠯ
          </span>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo.svg"
            alt=""
            width={165}
            height={147}
            className="h-16 w-auto shrink-0 opacity-95"
          />

          <span
            aria-hidden
            className="mongol hidden text-[1.15rem] leading-none text-gold-300/50 sm:block"
          >
            ᠮᠣᠩᠭᠣᠯ ᠪᠢᠴᠢᠭ
          </span>
        </div>
        <p className="mt-5 font-serif text-xl tracking-[0.05em] text-ivory-50">
          Уран бичлэг &amp; Монгол өв соёл
        </p>
        <p className="mx-auto mt-4 max-w-md text-[0.85rem] leading-7 text-ivory-100/60">
          {settings.aboutText}
        </p>
        <KheeDivider className="mt-8" />
      </div>

      {/* --- Багануудууд --------------------------------------------------- */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 sm:grid-cols-3 sm:px-6">
        <div>
          <h2 className="eyebrow text-gold-400/90">Цэс</h2>
          <ul className="mt-5 space-y-3 text-[0.88rem]">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-ivory-100/72 transition-colors duration-300 hover:text-gold-300"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/sags"
                className="text-ivory-100/72 transition-colors duration-300 hover:text-gold-300"
              >
                Сагс, захиалга
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="eyebrow text-gold-400/90">Дэлгүүр</h2>
          <ul className="mt-5 space-y-3 text-[0.88rem]">
            {PRODUCT_CATEGORIES.map((category) => (
              <li key={category.value}>
                <Link
                  href={`/delguur?angilal=${category.value}`}
                  className="text-ivory-100/72 transition-colors duration-300 hover:text-gold-300"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="eyebrow text-gold-400/90">Холбоо барих</h2>
          <ul className="mt-5 space-y-3 text-[0.88rem] text-ivory-100/72">
            {settings.address ? <li>{settings.address}</li> : null}
            {settings.phone ? (
              <li>
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="border-b border-gold-500/30 pb-0.5 transition-colors duration-300 hover:border-gold-400 hover:text-gold-300"
                >
                  {settings.phone}
                </a>
                {settings.phone2 ? `, ${settings.phone2}` : null}
              </li>
            ) : null}
            {settings.email ? (
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="border-b border-gold-500/30 pb-0.5 transition-colors duration-300 hover:border-gold-400 hover:text-gold-300"
                >
                  {settings.email}
                </a>
              </li>
            ) : null}
            {settings.facebook ? (
              <li>
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="border-b border-gold-500/30 pb-0.5 transition-colors duration-300 hover:border-gold-400 hover:text-gold-300"
                >
                  Facebook хуудас
                </a>
              </li>
            ) : null}
            {settings.workingHours ? (
              <li className="text-ivory-100/55">{settings.workingHours}</li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-6 text-[0.68rem] uppercase tracking-[0.18em] text-ivory-100/45 sm:flex-row sm:justify-between sm:px-6">
          <p>© {year} Уран бичлэг. Бүх эрх хамгаалагдсан.</p>
          <div className="flex items-center gap-5">
            <Link
              href="/nuutslal"
              className="transition-colors duration-300 hover:text-gold-300"
            >
              Нууцлал
            </Link>
            {/* Админ руу орох цорын ганц холбоос — эрэлхийлээд олох
                шаардлагагүй, нэвтрэлт нь хамгаалалт болно. */}
            <Link
              href="/admin"
              className="transition-colors duration-300 hover:text-gold-300"
            >
              Админ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
