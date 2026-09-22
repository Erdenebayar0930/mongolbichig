import Link from "next/link";

import DeleteButton from "./DeleteButton";
import { deleteProduct, saveProduct } from "@/lib/site/actions/admin";
import { PRODUCT_CATEGORIES } from "@/lib/site/taxonomy";
import type { SiteProduct } from "@/lib/site/db/schema";

export default function ProductForm({ product }: { product?: SiteProduct }) {
  return (
    // Устгах нь тусдаа <form> тул хадгалах маягтын ГАДНА байрлана.
    <div className="space-y-8">
      <form action={saveProduct} className="space-y-8">
        {product ? <input type="hidden" name="id" value={product.id} /> : null}

        <div className="surface grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="field-label">
              Нэр <span className="text-seal-600">*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={product?.name}
              className="field"
              placeholder="Гараар бичсэн ерөөлийн бичээс"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="slug" className="field-label">
              Slug (хаягт харагдана)
            </label>
            <input
              id="slug"
              name="slug"
              defaultValue={product?.slug}
              className="field"
              placeholder="Хоосон орхивол нэрнээс автоматаар үүснэ"
            />
          </div>

          <div>
            <label htmlFor="category" className="field-label">
              Ангилал
            </label>
            <select
              id="category"
              name="category"
              defaultValue={product?.category ?? "bichleg"}
              className="field"
            >
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sortOrder" className="field-label">
              Эрэмбэ (бага нь түрүүнд)
            </label>
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={product?.sortOrder ?? 0}
              className="field"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="summary" className="field-label">
              Товч тайлбар (жагсаалтад гарна)
            </label>
            <textarea
              id="summary"
              name="summary"
              rows={2}
              defaultValue={product?.summary}
              className="field resize-y"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="body" className="field-label">
              Дэлгэрэнгүй
            </label>
            <textarea
              id="body"
              name="body"
              rows={8}
              defaultValue={product?.body}
              className="field resize-y"
              placeholder="Хэмжээ, материал, хийгдэх хугацаа…"
            />
          </div>
        </div>

        <div className="surface grid gap-6 p-6 sm:grid-cols-3 sm:p-8">
          <div>
            <label htmlFor="price" className="field-label">
              Үнэ (₮) <span className="text-seal-600">*</span>
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              step={1000}
              required
              defaultValue={product?.price ?? 0}
              className="field"
            />
          </div>

          <div>
            <label htmlFor="oldPrice" className="field-label">
              Хямдралын өмнөх үнэ — 0 бол байхгүй
            </label>
            <input
              id="oldPrice"
              name="oldPrice"
              type="number"
              min={0}
              step={1000}
              defaultValue={product?.oldPrice ?? 0}
              className="field"
            />
          </div>

          <div>
            <label htmlFor="stock" className="field-label">
              Үлдэгдэл — −1 бол захиалгаар
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              min={-1}
              defaultValue={product?.stock ?? -1}
              className="field"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="coverUrl" className="field-label">
              Ковер зургийн хаяг
            </label>
            <input
              id="coverUrl"
              name="coverUrl"
              defaultValue={product?.coverUrl}
              className="field"
              placeholder="https://… эсвэл /covers/bichleg.svg"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="images" className="field-label">
              Нэмэлт зураг — мөр тутам нэг хаяг
            </label>
            <textarea
              id="images"
              name="images"
              rows={4}
              defaultValue={product?.images.join("\n")}
              className="field resize-y"
            />
          </div>

          <div className="flex items-end gap-6 sm:col-span-3">
            <label className="flex items-center gap-3 text-[0.85rem]">
              <input
                type="checkbox"
                name="published"
                defaultChecked={product ? product.status === "published" : true}
                className="h-4 w-4 accent-[color:var(--color-gold-500)]"
              />
              Нийтлэх
            </label>
            <label className="flex items-center gap-3 text-[0.85rem]">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={product?.featured ?? false}
                className="h-4 w-4 accent-[color:var(--color-gold-500)]"
              />
              Нүүрний слайдерт
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <button type="submit" className="btn-solid">
            Хадгалах
          </button>
          <Link href="/admin/delguur" className="btn-quiet">
            Болих
          </Link>
        </div>
      </form>

      {product ? (
        <div className="hairline flex justify-end border-t pt-6">
          <DeleteButton
            id={product.id}
            action={deleteProduct}
            message={`«${product.name}» бүтээгдэхүүнийг устгах уу?`}
          />
        </div>
      ) : null}
    </div>
  );
}
