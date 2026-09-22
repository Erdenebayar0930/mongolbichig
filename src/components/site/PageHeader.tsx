import Link from "next/link";

import { KheeDivider, Ulzii } from "@/components/site/ornament/Khee";

/**
 * Дотоод хуудсуудын толгой — төвлөрсөн, улзий тусгаарлагчтай. Хуудас бүрт
 * дахин бичихийн оронд нэг л газраас ирнэ.
 */
export default function PageHeader({
  eyebrow,
  title,
  lead,
  breadcrumbs,
  mongol,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  breadcrumbs?: { href: string; label: string }[];
  /**
   * Гарчгийн босоо монгол бичгийн хувилбар. Кирилл гарчигтайгаа утга нэг тул
   * дэлгэц уншигчид давхар сонсгохгүй — зөвхөн нүдний чимэг.
   */
  mongol?: string;
}) {
  return (
    <header className="mx-auto max-w-2xl text-center">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav
          aria-label="Замчлал"
          className="mb-8 text-[0.62rem] uppercase tracking-[0.2em] text-brand-900/52 dark:text-ivory-100/46"
        >
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.href}>
              {index > 0 ? (
                <Ulzii className="mx-2 inline-block h-2.5 w-2.5 translate-y-[0.15em] text-gold-500/60" />
              ) : null}
              <Link
                href={crumb.href}
                className="transition-colors duration-300 hover:text-gold-600 dark:hover:text-gold-300"
              >
                {crumb.label}
              </Link>
            </span>
          ))}
        </nav>
      ) : null}

      {mongol ? (
        <div className="mongol-spine mx-auto mb-7 inline-block">
          <span
            aria-hidden
            className="mongol block text-[1.45rem] leading-none text-gold-600/85 dark:text-gold-400/75"
          >
            {mongol}
          </span>
        </div>
      ) : null}

      {eyebrow ? <p className="eyebrow text-gold-600 dark:text-gold-400">{eyebrow}</p> : null}

      <h1 className="mt-4 text-balance font-serif text-3xl font-medium tracking-[0.02em] text-brand-950 dark:text-ivory-50 sm:text-5xl">
        {title}
      </h1>

      <KheeDivider className="mt-7" />

      {lead ? (
        <p className="mt-6 text-[0.95rem] leading-8 text-brand-900/72 dark:text-ivory-100/66">
          {lead}
        </p>
      ) : null}
    </header>
  );
}
