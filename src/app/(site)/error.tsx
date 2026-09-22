"use client";

import { useEffect } from "react";
import Link from "next/link";

import { KheeDivider } from "@/components/site/ornament/Khee";

/**
 * Сайтын алдааны хамгаалалт.
 *
 * Үүнгүйгээр серверийн ямар нэг алдаа (DB унасан, гуравдагч үйлчилгээ хариу
 * өгөөгүй) нь Next-ийн үндсэн саарал дэлгэцийг гаргадаг — сайтын хэвээс тэс
 * өөр, монголоор ч биш.
 *
 * ⚠ Энэ нь `layout.tsx` доторх алдааг БАРИХГҮЙ — Next-ийн error boundary нь
 * зөвхөн доод түвшний хуудсуудыг хамардаг. Толгой, хөл дэх алдаа нь бүлгийн
 * root руу хальж, хөтчийн үндсэн алдааны хуудас гарна.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Серверийн лог дээр стек аль хэдийн бий. Энд `digest`-ийг бичих нь
    // хэрэглэгчийн хэлсэн зүйлийг тухайн бичлэгтэй холбох цорын ганц түлхүүр.
    console.error("[site] хуудас гарахад алдаа:", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-28 text-center">
      <p className="font-serif text-[5rem] font-medium leading-none text-gold-500/35">
        ⚠
      </p>
      <h1 className="mt-6 font-serif text-2xl font-medium text-brand-950 dark:text-ivory-50">
        Хуудас гарахад алдаа гарлаа
      </h1>
      <KheeDivider className="mt-7" />
      <p className="mt-6 text-[0.95rem] leading-8 text-brand-900/68 dark:text-ivory-100/58">
        Түр зуурын саатал байж магадгүй. Дахин оролдоод үзнэ үү — давтагдвал
        бидэнд мэдэгдээрэй.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className="btn-gold">
          Дахин оролдох
        </button>
        <Link
          href="/"
          className="text-[0.95rem] text-brand-900/68 underline-offset-4 hover:underline dark:text-ivory-100/58"
        >
          Нүүр хуудас
        </Link>
      </div>

      {error.digest ? (
        <p className="mt-8 font-mono text-xs text-brand-900/40 dark:text-ivory-100/35">
          Алдааны дугаар: {error.digest}
        </p>
      ) : null}
    </div>
  );
}
