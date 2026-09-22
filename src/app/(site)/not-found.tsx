import Link from "next/link";

import { KheeDivider } from "@/components/site/ornament/Khee";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-28 text-center">
      <p className="font-serif text-[5rem] font-medium leading-none text-gold-500/35">
        404
      </p>
      <h1 className="mt-6 font-serif text-2xl font-medium text-brand-950 dark:text-ivory-50">
        Хуудас олдсонгүй
      </h1>
      <KheeDivider className="mt-7" />
      <p className="mt-6 text-[0.95rem] leading-8 text-brand-900/68 dark:text-ivory-100/58">
        Хайж байсан хуудас устсан эсвэл хаяг нь өөрчлөгдсөн байж магадгүй.
      </p>
      <Link href="/" className="btn-gold mt-10">
        Нүүр хуудас
      </Link>
    </div>
  );
}
