import type { Metadata, Viewport } from "next";
import { Manrope, Noto_Sans_Mongolian, Playfair_Display } from "next/font/google";

import "./globals.css";

import { CartProvider } from "@/components/site/cart/CartProvider";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { getSettings } from "@/lib/site/queries";

// Кирилл дэмждэг фонтууд — "cyrillic" subset-гүй бол монгол текст fallback
// фонт руу унаж, толгойн бичиг тэс өөр харагдана.
const sans = Manrope({
  subsets: ["cyrillic", "latin"],
  display: "swap",
  variable: "--font-site",
});

// Playfair Display — өндөр контрасттай, сонгодог сэтгүүлийн гарчгийн фонт.
// Зөвхөн том хэмжээнд хэрэглэнэ; жижиг текст Manrope-оор явна.
const display = Playfair_Display({
  weight: ["400", "500", "600", "700"],
  subsets: ["cyrillic", "latin"],
  display: "swap",
  variable: "--font-display",
});

// Уламжлалт босоо монгол бичиг — зөвхөн чимэглэлийн хэсэгт (`.mongol`).
// Хэрэглэгчийн компьютерт монгол бичгийн фонт байх баталгаа байхгүй тул
// сайт өөрөө авчирна.
const mongol = Noto_Sans_Mongolian({
  weight: "400",
  subsets: ["mongolian"],
  display: "swap",
  variable: "--font-mongol-script",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3200"
  ),
  title: {
    default: "Уран бичлэг & Монгол өв соёл",
    template: "%s | Уран бичлэг",
  },
  description:
    "Монгол бичиг, уран бичлэгийн сургалт болон захиалгат бүтээл, бичгийн хэрэгслийн дэлгүүр.",
  keywords: [
    "монгол бичиг",
    "уран бичлэг",
    "каллиграф",
    "монгол бичгийн сургалт",
    "босоо бичиг",
  ],
  openGraph: {
    type: "website",
    locale: "mn_MN",
    siteName: "Уран бичлэг & Монгол өв соёл",
  },
};

export const viewport: Viewport = {
  // Хөтчийн хаягийн мөр толгойн тугтай нийлэх ёстой.
  themeColor: "#0e0a06",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <html
      lang="mn"
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} ${mongol.variable}`}
    >
      <head>
        {/*
          Горимыг зурагдахаас ӨМНӨ тавина — эс бөгөөс харанхуй горимтой
          хэрэглэгчид эхний агшинд цагаан дэлгэц анивчина.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=localStorage.getItem("site-theme");var d=p==="dark"||(!p&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-800"
        >
          Үндсэн агуулга руу шилжих
        </a>

        {/* Сагс нь хуудас солигдоход алдагдах ёсгүй тул хамгийн гадна талд */}
        <CartProvider>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter settings={settings} />
        </CartProvider>
      </body>
    </html>
  );
}
