import Link from "next/link";

import DeleteButton from "./DeleteButton";
import { deleteNews, saveNews } from "@/lib/site/actions/admin";
import type { SiteNews } from "@/lib/site/db/schema";

/** `<input type="date">` нь "YYYY-MM-DD" хэлбэрийг л хүлээж авдаг */
function dateValue(value: Date | string | undefined) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export default function NewsForm({ post }: { post?: SiteNews }) {
  return (
    // Устгах нь тусдаа <form> тул хадгалах маягтын ГАДНА байрлана.
    <div className="space-y-8">
      <form action={saveNews} className="space-y-8">
        {post ? <input type="hidden" name="id" value={post.id} /> : null}

        <div className="surface grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="field-label">
              Гарчиг <span className="text-seal-600">*</span>
            </label>
            <input
              id="title"
              name="title"
              required
              defaultValue={post?.title}
              className="field"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="slug" className="field-label">
              Slug (хаягт харагдана)
            </label>
            <input
              id="slug"
              name="slug"
              defaultValue={post?.slug}
              className="field"
              placeholder="Хоосон орхивол гарчгаас автоматаар үүснэ"
            />
          </div>

          <div>
            <label htmlFor="tag" className="field-label">
              Шошго
            </label>
            <input
              id="tag"
              name="tag"
              defaultValue={post?.tag ?? "Мэдээ"}
              className="field"
              placeholder="Түүх / Зөвлөгөө / Арга хэмжээ"
            />
          </div>

          <div>
            <label htmlFor="author" className="field-label">
              Зохиогч
            </label>
            <input
              id="author"
              name="author"
              defaultValue={post?.author ?? "Уран бичлэг"}
              className="field"
            />
          </div>

          <div>
            <label htmlFor="publishedAt" className="field-label">
              Нийтлэх огноо
            </label>
            <input
              id="publishedAt"
              name="publishedAt"
              type="date"
              defaultValue={dateValue(post?.publishedAt)}
              className="field"
            />
          </div>

          <div>
            <label htmlFor="coverUrl" className="field-label">
              Ковер зургийн хаяг
            </label>
            <input
              id="coverUrl"
              name="coverUrl"
              defaultValue={post?.coverUrl}
              className="field"
              placeholder="https://… эсвэл /covers/medee.svg"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="excerpt" className="field-label">
              Товч (жагсаалтад гарна)
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={2}
              defaultValue={post?.excerpt}
              className="field resize-y"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="body" className="field-label">
              Биет
            </label>
            <textarea
              id="body"
              name="body"
              rows={16}
              defaultValue={post?.body}
              className="field resize-y"
              placeholder="Хоосон мөрөөр тусгаарласан догол мөрүүд. «...» дотор бичсэн мөр ишлэл болно."
            />
          </div>

          <div className="flex items-end gap-6 sm:col-span-2">
            <label className="flex items-center gap-3 text-[0.85rem]">
              <input
                type="checkbox"
                name="published"
                defaultChecked={post ? post.status === "published" : true}
                className="h-4 w-4 accent-[color:var(--color-gold-500)]"
              />
              Нийтлэх
            </label>
            <label className="flex items-center gap-3 text-[0.85rem]">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={post?.featured ?? false}
                className="h-4 w-4 accent-[color:var(--color-gold-500)]"
              />
              Онцлох
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <button type="submit" className="btn-solid">
            Хадгалах
          </button>
          <Link href="/admin/medee" className="btn-quiet">
            Болих
          </Link>
        </div>
      </form>

      {post ? (
        <div className="hairline flex justify-end border-t pt-6">
          <DeleteButton
            id={post.id}
            action={deleteNews}
            message={`«${post.title}» мэдээг устгах уу?`}
          />
        </div>
      ) : null}
    </div>
  );
}
