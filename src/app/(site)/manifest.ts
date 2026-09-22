import type { MetadataRoute } from "next";

/**
 * PWA manifest. Next.js үүнийг /manifest.webmanifest болгон гаргаж,
 * <link rel="manifest"> шошгыг өөрөө нэмнэ — layout.tsx-д гараар бичих
 * шаардлагагүй.
 *
 * icon-уудыг scripts/generate-brand-assets.mjs гаргана. Хөтөч эдгээр файлыг
 * татаж чадахгүй бол "Install" санал ОГТ гарахгүй тул тэдгээр ЗААВАЛ репод
 * байх ёстой — .gitignore-т бүү оруул.
 *
 * "any" ба "maskable"-ыг тусад нь заасан: Android нь maskable-ыг дурын
 * хэлбэрээр (тойрог, squircle) тайрдаг тул захаас 20% аюулгүй бүстэй өөр
 * файл хэрэгтэй. Нэг файлаар хуваалцвал нэг нь тайрагдаж, нөгөө нь хэт жижиг
 * харагдана.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Уран бичлэг & Монгол өв соёл",
    short_name: "Уран бичлэг",
    description:
      "Монгол бичиг, уран бичлэгийн сургалт болон захиалгат бүтээл, бичгийн хэрэгслийн дэлгүүр.",
    start_url: "/",
    display: "standalone",
    lang: "mn",
    // Дэвсгэр нь layout.tsx-ийн viewport.themeColor-той ижил байх ёстой —
    // эс бөгөөс апп нээгдэх агшинд өнгө үсэрнэ.
    background_color: "#0e0a06",
    theme_color: "#0e0a06",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
