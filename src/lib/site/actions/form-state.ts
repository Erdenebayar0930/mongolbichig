/**
 * `useActionState`-д дамждаг ерөнхий төлөв.
 *
 * Тусдаа файл байгаа шалтгаан: `"use server"` файлаас **зөвхөн async функц**
 * export хийхийг Next зөвшөөрдөг. Тогтмолыг тэнд тавибал build унана.
 */
export type FormState = {
  ok: boolean;
  /** Маягтын дээд талд гарах ерөнхий алдаа */
  error?: string;
  /** Талбарын нэр → алдааны текст */
  fields?: Record<string, string>;
  /** Захиалга амжилттай үүсэхэд — баримтын хуудсанд шилжинэ */
  orderNo?: string;
};

export const EMPTY_FORM_STATE: FormState = { ok: false };
