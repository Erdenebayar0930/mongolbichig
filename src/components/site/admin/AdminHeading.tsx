import Link from "next/link";

export default function AdminHeading({
  title,
  count,
  action,
}: {
  title: string;
  count?: number;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-7 flex flex-wrap items-baseline justify-between gap-4">
      <h1 className="font-serif text-2xl text-brand-950 dark:text-ivory-50">
        {title}
        {count != null ? (
          <span className="ml-3 text-[0.8rem] font-sans tracking-[0.16em] text-brand-900/45 dark:text-ivory-100/40">
            {count}
          </span>
        ) : null}
      </h1>

      {action ? (
        <Link href={action.href} className="btn-gold">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
