import Link from "next/link";

import AlphabetTicker from "@/components/site/AlphabetTicker";
import CourseCard from "@/components/site/CourseCard";
import HeroSlider, { type Slide } from "@/components/site/HeroSlider";
import NewsCard from "@/components/site/NewsCard";
import { EverUgalz, KheeDivider } from "@/components/site/ornament/Khee";
import ProductCard from "@/components/site/ProductCard";
import SectionHeading from "@/components/site/SectionHeading";
import {
  fallbackCover,
  formatDateOnly,
  formatPrice,
  truncate,
} from "@/lib/site/format";
import {
  getCourses,
  getFeaturedCourses,
  getFeaturedProducts,
  getNews,
  getProducts,
  getSettings,
} from "@/lib/site/queries";
import { courseLevel, productCategory } from "@/lib/site/taxonomy";

// Контент DB-д байгаа тул хуудсыг богино хугацаанд кэшлээд шинэчилнэ.
export const revalidate = 60;

/** Гурван амлалт — сайтын мөн чанарыг эхний дэлгэцэд хэлнэ */
const PROMISES = [
  {
    title: "Үндсээс нь",
    body: "Толгой үсгээс эхлээд үг холбох, цэг таслал хүртэл дараалалтай. Өмнөх мэдлэг шаардахгүй.",
    mongol: "ᠮᠣᠩᠭᠣᠯ",
  },
  {
    title: "Бийрийн доор",
    body: "Уран бичлэг бол зөвхөн үсэг биш — амьсгал, шугамын хэмнэл. Багштайгаа нүүр тулан суралцана.",
    mongol: "ᠪᠢᠴᠢᠭ",
  },
  {
    title: "Гартаа үлдэнэ",
    body: "Захиалгат бүтээл, бийр бэх, гарын авлагыг сургалтын дараа ч ашиглаж, бэлэг болгоно.",
    mongol: "ᠤᠷᠠᠨ",
  },
];

/**
 * Бичгийн дөрвөн эрдэнэ — бийр, бэх, цаас, хорго. Эртний бичээчийн ширээн
 * дээр байх ёстой дөрвөн зүйл. Дэлгүүрийн ангилал руу хөтлөх боловч эхлээд
 * тэдгээр нь юу болохыг тайлбарлана.
 */
const TREASURES = [
  {
    mongol: "ᠪᠢᠷ",
    title: "Бийр",
    body: "Үсгийн амьсгал бийрийн үзүүрт нуугдана. Хялгасны хатуу зөөлөн нь татлагын аяыг шийднэ.",
    href: "/delguur?angilal=hereglel",
  },
  {
    mongol: "ᠪᠡᠬᠡ",
    title: "Бэх",
    body: "Хар бэх цаасанд шингэж, хатсан хойноо ч гялалзана. Өтгөн нь хүчтэй, шингэн нь зөөлөн мөр үлдээнэ.",
    href: "/delguur?angilal=hereglel",
  },
  {
    mongol: "ᠴᠠᠭᠠᠰᠤ",
    title: "Цаас",
    body: "Бэх хэр тархахыг цаас шийднэ. Уран бичлэгт баримал, шингээмтгий цаас тохирно.",
    href: "/delguur?angilal=hereglel",
  },
  {
    mongol: "ᠨᠣᠮ",
    title: "Ном",
    body: "Хэв маягийг нүдээр сурна. Дүрмийн ном, хэвлэмэл дэвтэр нь бийрийн хамгийн чимээгүй багш.",
    href: "/delguur?angilal=nom",
  },
];

export default async function HomePage() {
  const [
    featuredCourses,
    featuredProducts,
    courses,
    products,
    news,
    settings,
  ] = await Promise.all([
    getFeaturedCourses(3),
    getFeaturedProducts(2),
    getCourses({ limit: 3 }),
    getProducts({ limit: 4 }),
    getNews(3),
    getSettings(),
  ]);

  // Онцлохоор тэмдэглэсэн зүйл байхгүй бол сүүлийн контентоор нөхнө —
  // шинэ сайт «Онцлох мэдээлэл алга» гэсэн хоосон хайрцгаар нээгдэх ёсгүй.
  const heroCourses = featuredCourses.length > 0 ? featuredCourses : courses;
  const heroProducts =
    featuredProducts.length > 0 ? featuredProducts : products.slice(0, 2);

  const slides: Slide[] = [
    ...heroCourses.map(
      (course): Slide => ({
        href: `/surgalt/${course.slug}`,
        title: course.title,
        excerpt: truncate(course.summary, 160),
        cover: course.coverUrl || fallbackCover("course"),
        badge: `Сургалт · ${courseLevel(course.level).label}`,
        meta: course.startDate
          ? `${formatDateOnly(course.startDate)}-нд эхэлнэ`
          : "Тасралтгүй элсэлт",
        cta: "Бүртгүүлэх",
      })
    ),
    ...heroProducts.map(
      (product): Slide => ({
        href: `/delguur/${product.slug}`,
        title: product.name,
        excerpt: truncate(product.summary, 160),
        cover: product.coverUrl || fallbackCover(product.category),
        badge: `Дэлгүүр · ${productCategory(product.category).label}`,
        meta: formatPrice(product.price),
        cta: "Захиалах",
      })
    ),
  ];

  const empty =
    courses.length === 0 && products.length === 0 && news.length === 0;

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <HeroSlider slides={slides} />

        {/* --- Гурван амлалт ---------------------------------------------- */}
        <section className="mt-16 grid gap-px bg-[color:var(--line)] sm:grid-cols-3">
          {PROMISES.map((promise) => (
            <div
              key={promise.title}
              className="flex items-start gap-5 bg-[color:var(--surface)] px-6 py-8"
            >
              {/*
                Босоо монгол бичиг — гоёл. Кирилл гарчигтай утга нь давхцаж
                байгаа тул дэлгэц уншигчид сонсгох хэрэггүй.
              */}
              <span aria-hidden className="mongol-spine shrink-0">
                <span className="mongol block text-[1.6rem] leading-none text-gold-600/70 dark:text-gold-400/60">
                  {promise.mongol}
                </span>
              </span>
              <div>
                <h2 className="font-serif text-lg text-brand-950 dark:text-ivory-50">
                  {promise.title}
                </h2>
                <p className="mt-2.5 text-[0.88rem] leading-7 text-brand-900/72 dark:text-ivory-100/66">
                  {promise.body}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* --- Цагаан толгой ------------------------------------------------ */}
        <div className="mt-14">
          <p
            aria-hidden
            className="eyebrow mb-5 text-center text-gold-600 dark:text-gold-400"
          >
            Монгол бичгийн цагаан толгой
          </p>
          <AlphabetTicker />
        </div>

        {/* --- Нэрийн бичлэг ------------------------------------------------- */}
        <section className="hairline mt-14 grid items-center gap-8 border p-8 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-10 sm:p-10">
          <span aria-hidden className="mongol-spine hidden shrink-0 sm:block">
            <span className="mongol block text-[1.7rem] leading-none text-gold-600/70 dark:text-gold-400/60">
              ᠨᠡᠷᠡ
            </span>
          </span>

          <div>
            <p className="eyebrow text-gold-600 dark:text-gold-400">Үнэгүй</p>
            <h2 className="mt-3 font-serif text-2xl text-brand-950 dark:text-ivory-50">
              Нэрээ монгол бичгээр бичүүлээд аваарай
            </h2>
            <p className="mt-3 max-w-xl text-[0.9rem] leading-7 text-brand-900/72 dark:text-ivory-100/66">
              Нэрээ бичихэд сайт монгол бичигт хөрвүүлж, цаас, бэх, тамгатай
              бэлэн загвар болгож харуулна. Зургийг нь тэр дор нь татаж авна.
              Монгол, гадаад нэр аль аль нь болно.
            </p>
          </div>

          <Link href="/ner" className="btn-gold shrink-0">
            Нэрээ бичих
          </Link>
        </section>

        {/* --- Сургалт ------------------------------------------------------ */}
        {courses.length > 0 ? (
          <section className="mt-20">
            <SectionHeading
              title="Нээлттэй сургалт"
              href="/surgalt"
              hrefLabel="Бүх сургалт"
            />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        ) : null}

        {/* --- Ишлэл -------------------------------------------------------- */}
        <section className="relative mt-20 overflow-hidden bg-brand-950 px-6 py-16 text-center sm:px-16 sm:py-20">
          {/* Гэрийн ханын хайрцаглалт — сургаал үг гэрийн дотор эгшиглэнэ */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[url('/brand/hana.svg')] bg-[length:92px_92px] opacity-[0.1]"
          />
          <span aria-hidden className="pointer-events-none absolute inset-4 frame-gold" />

          {/* Хүрээний дөрвөн буланд эвэр угалз. Эргэлт нь булан бүрд өөр —
              мушгиа нь үргэлж дотогшоо харна. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-4 text-gold-500/45"
          >
            <EverUgalz className="absolute left-0 top-0 h-7 w-7" />
            <EverUgalz className="absolute right-0 top-0 h-7 w-7 rotate-90" />
            <EverUgalz className="absolute bottom-0 right-0 h-7 w-7 rotate-180" />
            <EverUgalz className="absolute bottom-0 left-0 h-7 w-7 -rotate-90" />
          </span>

          <div className="relative">
            <p className="eyebrow text-gold-400/80">Өдрийн үг</p>
            <p className="mx-auto mt-6 max-w-2xl text-balance font-serif text-xl italic leading-relaxed text-ivory-50 sm:text-2xl">
              «{settings.heroQuote}»
            </p>
            <KheeDivider className="mt-7" />
            <p className="mt-4 text-[0.65rem] uppercase tracking-[0.24em] text-gold-300/70">
              {settings.heroQuoteAuthor}
            </p>
          </div>
        </section>

        {/* --- Дөрвөн эрдэнэ ------------------------------------------------- */}
        <section className="mt-20">
          <SectionHeading title="Бичгийн дөрвөн эрдэнэ" />
          <div className="grid gap-px bg-[color:var(--line)] sm:grid-cols-2 lg:grid-cols-4">
            {TREASURES.map((treasure) => (
              <Link
                key={treasure.title}
                href={treasure.href}
                className="group flex gap-5 bg-[color:var(--surface)] px-6 py-7 transition-colors duration-500 hover:bg-[color:var(--surface-2)]"
              >
                <span aria-hidden className="mongol-spine shrink-0">
                  <span className="mongol block text-[1.45rem] leading-none text-gold-600/70 transition-colors duration-500 group-hover:text-gold-600 dark:text-gold-400/60 dark:group-hover:text-gold-300">
                    {treasure.mongol}
                  </span>
                </span>
                <span className="block">
                  <span className="block font-serif text-lg text-brand-950 dark:text-ivory-50">
                    {treasure.title}
                  </span>
                  <span className="mt-2.5 block text-[0.85rem] leading-7 text-brand-900/70 dark:text-ivory-100/64">
                    {treasure.body}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* --- Дэлгүүр ------------------------------------------------------ */}
        {products.length > 0 ? (
          <section className="mt-20">
            <SectionHeading
              title="Захиалгат бүтээл"
              href="/delguur"
              hrefLabel="Дэлгүүр"
            />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}

        {/* --- Мэдээ -------------------------------------------------------- */}
        {news.length > 0 ? (
          <section className="mt-20">
            <SectionHeading title="Мэдээ, нийтлэл" href="/medee" />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((post) => (
                <NewsCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        ) : null}

        {/* --- Холбоо барих ------------------------------------------------- */}
        <section className="hairline relative mt-20 overflow-hidden border px-6 py-14 text-center">
          {/*
            Бүтээл дуусахад улаан тамга дарна — тэр ёсоор нүүр хуудсын сүүлчийн
            блокт тамга тавив. Чимэглэл тул дэлгэц уншигчид нэрлэхгүй.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/tamga.svg"
            alt=""
            aria-hidden
            width={96}
            height={96}
            className="tamga pointer-events-none absolute -right-3 bottom-2 h-20 w-20 -rotate-6 opacity-70 sm:right-6 sm:h-24 sm:w-24"
          />
          <h2 className="font-serif text-2xl text-brand-950 dark:text-ivory-50 sm:text-3xl">
            Асуух зүйл байна уу?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[0.92rem] leading-7 text-brand-900/72 dark:text-ivory-100/66">
            Сургалтын хуваарь, захиалгат бүтээлийн хэмжээ, үнийн талаар утсаар
            эсвэл Facebook хуудсаар шууд холбогдоорой.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="btn-solid">
              {settings.phone}
            </a>
            <Link href="/tuhai" className="btn-gold">
              Бидний тухай
            </Link>
          </div>
        </section>

        {empty ? (
          <div className="mt-10 border border-dashed border-gold-500/30 p-14 text-center">
            <p className="font-serif text-xl text-brand-900 dark:text-ivory-50">
              Контент хараахан ороогүй байна
            </p>
            <p className="mt-3 text-sm text-brand-900/68 dark:text-ivory-100/58">
              Өгөгдлийн санг бэлдэхийн тулд{" "}
              <code className="bg-brand-950/5 px-1.5 py-0.5 text-brand-700 dark:bg-white/10 dark:text-gold-300">
                npm run db:push &amp;&amp; npm run db:seed
              </code>{" "}
              командыг ажиллуулна уу.
            </p>
            <Link href="/admin" className="btn-gold mt-8">
              Админ руу орох
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}
