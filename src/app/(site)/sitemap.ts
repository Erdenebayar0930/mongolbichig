import type { MetadataRoute } from "next";

import { NAV } from "@/lib/site/nav";
import { getCourses, getNews, getProducts } from "@/lib/site/queries";

/**
 * Сайтын зураглал — `/sitemap.xml`.
 *
 * Хайлтын систем шинэ сургалт, бараа, мэдээг өөрөө олтол хэдэн долоо хоног
 * өнгөрдөг. Зураглал нь тэдгээрийг шууд зааж өгнө.
 *
 * ⚠ Зөвхөн `(site)` бүлгийн НИЙТИЙН замууд орно. Удирдлагын хэсэг
 * (`/udirdlaga`, `/inventory`, `/users` …) болон уран бичлэгийн админ
 * (`/admin`) нь нэвтрэлт шаарддаг хувийн хуудсууд тул энд байх ёсгүй —
 * [robots.ts](./robots.ts) тэднийг тусад нь хаана.
 */

/** DB унасан үед ч зураглал хоосон биш, статик замуудтайгаа гарна. */
export const dynamic = "force-dynamic";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

/** Зураглалд оруулах бичлэгийн дээд тоо — нэг ангилалд. */
const MAX = 1000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, products, news] = await Promise.all([
    getCourses({ limit: MAX }),
    getProducts({ limit: MAX }),
    getNews(MAX),
  ]);

  // Цэсэн дэх статик хуудсууд. `/haih` (хайлт) ба `/sags` (сагс) нь ЗОРИУДААР
  // ороогүй: хайлтын үр дүн нь параметрээс хамаардаг, сагс нь хэрэглэгч бүрд
  // өөр — хоёулаа индексжүүлэх утгагүй.
  const staticPages: MetadataRoute.Sitemap = NAV.map((item) => ({
    url: `${BASE}${item.href === "/" ? "" : item.href}`,
    changeFrequency: item.href === "/" ? "daily" : "weekly",
    priority: item.href === "/" ? 1 : 0.7,
  }));

  return [
    ...staticPages,
    ...courses.map((course) => ({
      url: `${BASE}/surgalt/${course.slug}`,
      lastModified: course.updatedAt ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${BASE}/delguur/${product.slug}`,
      lastModified: product.updatedAt ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...news.map((item) => ({
      url: `${BASE}/medee/${item.slug}`,
      lastModified: item.updatedAt ?? item.publishedAt ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
