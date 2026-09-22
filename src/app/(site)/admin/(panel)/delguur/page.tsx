import Link from "next/link";

import AdminHeading from "@/components/site/admin/AdminHeading";
import { formatPrice } from "@/lib/site/format";
import { adminListProducts } from "@/lib/site/queries";
import { productCategory } from "@/lib/site/taxonomy";

export const metadata = { title: "Дэлгүүр" };

export default async function AdminProductsPage() {
  const products = await adminListProducts();

  return (
    <>
      <AdminHeading
        title="Бүтээгдэхүүн"
        count={products.length}
        action={{ href: "/admin/delguur/shine", label: "Шинэ бүтээгдэхүүн" }}
      />

      {products.length === 0 ? (
        <p className="border border-dashed border-gold-500/30 p-14 text-center text-[0.85rem] text-brand-900/55 dark:text-ivory-100/50">
          Бүтээгдэхүүн хараахан бүртгээгүй байна.
        </p>
      ) : (
        <ul className="divide-y divide-[color:var(--line)] border-y hairline">
          {products.map((product) => {
            const category = productCategory(product.category);
            const draft = product.status !== "published";

            return (
              <li
                key={product.id}
                className="flex flex-wrap items-center gap-x-5 gap-y-2 py-4"
              >
                <Link
                  href={`/admin/delguur/${product.id}`}
                  className="min-w-0 flex-1 transition-colors duration-300 hover:text-gold-700 dark:hover:text-gold-300"
                >
                  <span className="block truncate text-[0.95rem] text-brand-950 dark:text-ivory-50">
                    {product.name}
                  </span>
                  <span className="mt-1 block truncate text-[0.75rem] text-brand-900/48 dark:text-ivory-100/44">
                    /delguur/{product.slug}
                  </span>
                </Link>

                <span className="chip shrink-0 border-[color:var(--line)] text-brand-900/60 dark:text-ivory-100/55">
                  {category.label}
                </span>

                {draft ? (
                  <span className="chip shrink-0 border-[color:var(--line)] text-brand-900/50 dark:text-ivory-100/45">
                    Ноорог
                  </span>
                ) : null}

                {product.featured ? (
                  <span title="Нүүрний слайдерт" className="shrink-0 text-gold-500">
                    ★
                  </span>
                ) : null}

                <span className="w-28 shrink-0 text-right text-[0.85rem] tabular-nums text-brand-950 dark:text-ivory-50">
                  {formatPrice(product.price)}
                </span>

                <span
                  className={`w-28 shrink-0 text-right text-[0.8rem] tabular-nums ${
                    product.stock === 0
                      ? "text-seal-600 dark:text-seal-400"
                      : "text-brand-900/55 dark:text-ivory-100/50"
                  }`}
                >
                  {product.stock < 0 ? "Захиалгаар" : `${product.stock} ш`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
