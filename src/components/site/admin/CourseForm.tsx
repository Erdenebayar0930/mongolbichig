import Link from "next/link";

import DeleteButton from "./DeleteButton";
import { deleteCourse, saveCourse } from "@/lib/site/actions/admin";
import { COURSE_FORMATS, COURSE_LEVELS } from "@/lib/site/taxonomy";
import type { SiteCourse } from "@/lib/site/db/schema";

/**
 * Сургалт нэмэх/засах маягт. Server Component — клиент дээр ямар ч JS
 * шаардахгүй тул JS ачаалагдаагүй байсан ч ажиллана.
 */
export default function CourseForm({ course }: { course?: SiteCourse }) {
  return (
    // Устгах нь тусдаа <form> тул хадгалах маягтын ГАДНА байрлана —
    // HTML-д form дотор form байж болохгүй.
    <div className="space-y-8">
      <form action={saveCourse} className="space-y-8">
        {course ? <input type="hidden" name="id" value={course.id} /> : null}

        <div className="surface space-y-6 p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="field-label">
                Гарчиг <span className="text-seal-600">*</span>
              </label>
              <input
                id="title"
                name="title"
                required
                defaultValue={course?.title}
                className="field"
                placeholder="Анхан шатны монгол бичгийн сургалт"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="slug" className="field-label">
                Slug (хаягт харагдана)
              </label>
              <input
                id="slug"
                name="slug"
                defaultValue={course?.slug}
                className="field"
                placeholder="Хоосон орхивол гарчгаас автоматаар үүснэ"
              />
            </div>

            <div>
              <label htmlFor="level" className="field-label">
                Түвшин
              </label>
              <select
                id="level"
                name="level"
                defaultValue={course?.level ?? "anhan"}
                className="field"
              >
                {COURSE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="format" className="field-label">
                Хэлбэр
              </label>
              <select
                id="format"
                name="format"
                defaultValue={course?.format ?? "tanhim"}
                className="field"
              >
                {COURSE_FORMATS.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="summary" className="field-label">
                Товч тайлбар (жагсаалтад гарна)
              </label>
              <textarea
                id="summary"
                name="summary"
                rows={2}
                defaultValue={course?.summary}
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
                rows={10}
                defaultValue={course?.body}
                className="field resize-y"
                placeholder="Хоосон мөрөөр тусгаарласан догол мөрүүд. «...» дотор бичсэн мөр ишлэл болно."
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="syllabus" className="field-label">
                Хөтөлбөр — мөр тутам нэг сэдэв
              </label>
              <textarea
                id="syllabus"
                name="syllabus"
                rows={6}
                defaultValue={course?.syllabus.join("\n")}
                className="field resize-y"
                placeholder={"Толгой үсэг таних\nҮг холбох дүрэм\nБийр барих суурь"}
              />
            </div>
          </div>
        </div>

        <div className="surface space-y-6 p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label htmlFor="price" className="field-label">
                Төлбөр (₮) — 0 бол үнэгүй
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min={0}
                step={1000}
                defaultValue={course?.price ?? 0}
                className="field"
              />
            </div>

            <div>
              <label htmlFor="durationWeeks" className="field-label">
                Үргэлжлэх (7 хоног)
              </label>
              <input
                id="durationWeeks"
                name="durationWeeks"
                type="number"
                min={0}
                defaultValue={course?.durationWeeks ?? 4}
                className="field"
              />
            </div>

            <div>
              <label htmlFor="startDate" className="field-label">
                Эхлэх огноо
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={course?.startDate ?? ""}
                className="field"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="schedule" className="field-label">
                Хуваарь
              </label>
              <input
                id="schedule"
                name="schedule"
                defaultValue={course?.schedule}
                className="field"
                placeholder="Мя, Пү — 19:00–21:00"
              />
            </div>

            <div>
              <label htmlFor="seats" className="field-label">
                Нийт суудал — 0 бол хязгааргүй
              </label>
              <input
                id="seats"
                name="seats"
                type="number"
                min={0}
                defaultValue={course?.seats ?? 0}
                className="field"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="location" className="field-label">
                Байршил
              </label>
              <input
                id="location"
                name="location"
                defaultValue={course?.location}
                className="field"
                placeholder="СБД, 1-р хороо, … байр"
              />
            </div>

            <div>
              <label htmlFor="seatsTaken" className="field-label">
                Бүртгэгдсэн
              </label>
              <input
                id="seatsTaken"
                name="seatsTaken"
                type="number"
                min={0}
                defaultValue={course?.seatsTaken ?? 0}
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
                defaultValue={course?.coverUrl}
                className="field"
                placeholder="https://… эсвэл /covers/surgalt.svg"
              />
            </div>

            <div>
              <label htmlFor="sortOrder" className="field-label">
                Эрэмбэ (бага нь түрүүнд)
              </label>
              <input
                id="sortOrder"
                name="sortOrder"
                type="number"
                defaultValue={course?.sortOrder ?? 0}
                className="field"
              />
            </div>

            <div className="flex items-end gap-6 sm:col-span-2">
              <label className="flex items-center gap-3 text-[0.85rem]">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={course ? course.status === "published" : true}
                  className="h-4 w-4 accent-[color:var(--color-gold-500)]"
                />
                Нийтлэх
              </label>
              <label className="flex items-center gap-3 text-[0.85rem]">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={course?.featured ?? false}
                  className="h-4 w-4 accent-[color:var(--color-gold-500)]"
                />
                Нүүрний слайдерт
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <button type="submit" className="btn-solid">
            Хадгалах
          </button>
          <Link href="/admin/surgalt" className="btn-quiet">
            Болих
          </Link>
        </div>
      </form>

      {course ? (
        <div className="hairline flex justify-end border-t pt-6">
          <DeleteButton
            id={course.id}
            action={deleteCourse}
            message={`«${course.title}» сургалтыг устгах уу?`}
          />
        </div>
      ) : null}
    </div>
  );
}
