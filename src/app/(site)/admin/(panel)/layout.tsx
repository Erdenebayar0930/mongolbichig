import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminNav from "@/components/site/admin/AdminNav";
import { isAdmin } from "@/lib/site/admin/auth";

export const metadata: Metadata = {
  title: { default: "Админ", template: "%s | Админ" },
  robots: { index: false, follow: false },
};

// Cookie уншдаг тул статик болгож болохгүй.
export const dynamic = "force-dynamic";

/**
 * Хамгаалагдсан хэсэг. `/admin/login` нь энэ бүлгээс гадуур байгаа тул
 * нэвтрэх маягт өөрөө шалгалтад баригдахгүй.
 *
 * ⚠️ Энэ шалгалт нь зөвхөн **харагдац**-ыг хамгаална. Server Action-ууд
 * шууд POST-оор дуудагдаж болдог тул тэдгээр нь өөрсдөө `requireAdmin()`
 * дуудна.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <AdminNav />
      <div className="mt-10">{children}</div>
    </div>
  );
}
