import type { MetadataRoute } from "next";

/**
 * `/robots.txt` — хайлтын роботод юу индексжүүлэхийг заана.
 *
 * ⚠ Энэ репо нь НЭГ апп-аар хоёр бүтээгдэхүүн үйлчилдэг тул хориглох
 * жагсаалт нь зөвхөн уран бичлэгийн админаар хязгаарлагдахгүй: Бид туслая
 * дашбоардын бүх зам мөн адил нэг домэйн дор сууж байна. Тэдгээр нь
 * нэвтрэлтээр хамгаалагдсан ч индексжүүлэх нь утгагүй — хайлтын үр дүнд
 * нэвтрэх хуудас гарч ирнэ.
 *
 * ⚠ Файл нь `app/`-ын ҮНДЭСТ байх ЁСТОЙ, route group дотор биш. `sitemap.ts`
 * нь сегмент бүрд байж болдог (нэг сайт олон зураглалтай байж болно) тул
 * `(site)/` дотроос ажилладаг — `robots` нь домэйнд ганц учир Next түүнийг
 * зөвхөн үндэснээс хайна. Бүлэг дотор тавихад ЧИМЭЭГҮЙ алга болно: алдаа
 * гарахгүй, зүгээр л /robots.txt нь 404 болно.
 */
const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // Уран бичлэгийн админ
        "/admin",
        // Бид туслая — удирдлагын систем
        "/udirdlaga",
        "/inventory",
        "/users",
        "/reports",
        "/documents",
        "/backup",
        "/ai-analysis",
        "/settings",
        "/profile",
        "/notifications",
        "/admin-access",
        "/unauthorized",
        "/login",
        "/register",
        "/reset-password",
        "/signin",
        "/signup",
        // TailAdmin-ын жишиг хуудсууд — бүтээгдэхүүний хэсэг биш
        "/ui",
        // Хэрэглэгч тус бүрд өөр, эсвэл параметрээс хамаарсан хуудсууд
        "/sags",
        "/haih",
        "/zahialga",
        "/api",
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
