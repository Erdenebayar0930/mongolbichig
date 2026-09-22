import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PageHeader from "@/components/site/PageHeader";
import ProductBuyBox from "@/components/site/ProductBuyBox";
import ProductCard from "@/components/site/ProductCard";
import ProductGallery from "@/components/site/ProductGallery";
import Prose from "@/components/site/Prose";
import SectionHeading from "@/components/site/SectionHeading";
import { fallbackCover, formatPrice } from "@/lib/site/format";
import { getProductBySlug, getRelatedProducts, getSettings } from "@/lib/site/queries";
import { productCategory } from "@/lib/site/taxonomy";
import { settingNumber } from "@/lib/site/settings";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Бүтээгдэхүүн олдсонгүй" };

  return {
    title: product.name,
    description: product.summary || `${product.name} — уран бичлэгийн дэлгүүр`,
    openGraph: {
      title: product.name,
      description: product.summary,
      images: product.coverUrl ? [product.coverUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [related, settings] = await Promise.all([
    getRelatedProducts(product, 4),
    getSettings(),
  ]);

  const category = productCategory(product.category);
  const cover = product.coverUrl || fallbackCover(product.category);
  // Ковер нь эхний зураг — жагсаалтад давхардвал нэг л удаа гарна.
  const images = [cover, ...product.images.filter((image) => image !== cover)];
  const freeFrom = settingNumber(settings.freeShippingFrom, 0);
  const shippingFee = settingNumber(settings.shippingFee, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <PageHeader
        breadcrumbs={[
          { href: "/", label: "Нүүр" },
          { href: "/delguur", label: "Дэлгүүр" },
          { href: `/delguur?angilal=${product.category}`, label: category.label },
        ]}
        eyebrow={category.label}
        title={product.name}
        lead={product.summary}
      />

      <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={images} alt={product.name} />

        <div className="lg:pt-4">
          {product.oldPrice > product.price ? (
            <p className="mb-2 text-[0.85rem] text-brand-900/50 line-through dark:text-ivory-100/45">
              {formatPrice(product.oldPrice)}
            </p>
          ) : null}

          <ProductBuyBox
            stock={product.stock}
            item={{
              slug: product.slug,
              name: product.name,
              price: product.price,
              coverUrl: cover,
            }}
          />

          <span aria-hidden className="hairline my-8 block w-full border-t" />

          <dl className="space-y-3 text-[0.85rem]">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-brand-900/60 dark:text-ivory-100/55">
                Хүргэлт
              </dt>
              <dd className="text-right text-brand-950 dark:text-ivory-50">
                {shippingFee > 0 ? formatPrice(shippingFee) : "Тохиролцоно"}
                {freeFrom > 0 ? ` · ${formatPrice(freeFrom)}-өөс дээш үнэгүй` : ""}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-brand-900/60 dark:text-ivory-100/55">Төлбөр</dt>
              <dd className="text-right text-brand-950 dark:text-ivory-50">
                Дансаар эсвэл газар дээр нь
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-brand-900/60 dark:text-ivory-100/55">Лавлах</dt>
              <dd className="text-right">
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="border-b border-gold-500/50 text-gold-700 dark:text-gold-300"
                >
                  {settings.phone}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {product.body ? (
        <section className="mt-20">
          <SectionHeading title="Тайлбар" as="h2" />
          <Prose text={product.body} />
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-20">
          <SectionHeading title="Төстэй бүтээл" href="/delguur" as="h2" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
