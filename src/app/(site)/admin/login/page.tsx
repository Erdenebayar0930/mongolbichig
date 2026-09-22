import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import LoginForm from "@/components/site/admin/LoginForm";
import { KheeDivider } from "@/components/site/ornament/Khee";
import { isAdmin } from "@/lib/site/admin/auth";

export const metadata: Metadata = {
  title: "Админ нэвтрэх",
  robots: { index: false },
};

// Cookie уншдаг тул кэшлэх боломжгүй.
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  // Нэвтэрсэн хүнд нэвтрэх маягт харуулах утгагүй.
  if (await isAdmin()) redirect("/admin");

  return (
    <div className="mx-auto max-w-md px-4 py-24 sm:px-6">
      <div className="text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo.svg"
          alt=""
          width={165}
          height={147}
          className="mx-auto h-14 w-auto opacity-90"
        />
        <h1 className="mt-6 font-serif text-2xl text-brand-950 dark:text-ivory-50">
          Админ нэвтрэх
        </h1>
        <KheeDivider className="mt-6" />
      </div>

      <LoginForm />

      <p className="mt-8 text-center text-[0.78rem] text-brand-900/55 dark:text-ivory-100/50">
        <Link href="/" className="transition-colors hover:text-gold-600">
          ← Сайт руу буцах
        </Link>
      </p>
    </div>
  );
}
