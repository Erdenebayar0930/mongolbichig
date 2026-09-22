import Link from "next/link";

import { Ulzii } from "@/components/site/ornament/Khee";

/**
 * Блокийн гарчиг — серифээр, доогуураа алтан үс шиг нимгэн зураастай.
 * Өмнө нь улзий тавьсан нь блок бүрийг нэг гэр бүлийн зүйл мэт харагдуулна.
 */
export default function SectionHeading({
  title,
  href,
  hrefLabel = "Бүгд",
  as: Tag = "h2",
}: {
  title: string;
  href?: string;
  hrefLabel?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between gap-6">
        <Tag className="flex items-baseline gap-2.5 font-serif text-lg font-medium tracking-[0.03em] text-brand-950 dark:text-ivory-50 sm:text-xl">
          <Ulzii className="h-3.5 w-3.5 shrink-0 translate-y-[0.1em] text-gold-500" />
          {title}
        </Tag>

        {href ? (
          <Link
            href={href}
            className="group shrink-0 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brand-900/60 transition-colors duration-300 hover:text-gold-600 dark:text-ivory-100/55 dark:hover:text-gold-300"
          >
            {hrefLabel}
            <span
              aria-hidden
              className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        ) : null}
      </div>

      <div aria-hidden className="rule-gold mt-3" />
    </div>
  );
}
