/**
 * Сургалт, бүтээгдэхүүн, захиалгын кодчилсон утгуудын монгол нэр ба өнгө.
 *
 * Tailwind нь эх кодоос классын нэрийг уншдаг тул `text-${tone}-600` гэж
 * угсарч болохгүй — бүрэн бичсэн литерал л ажиллана. Тиймээс энд бүх класс
 * бүтнээр нь бичигдсэн байна.
 */

type Option<T extends string> = {
  value: T;
  label: string;
  /** Жижиг шошгын бүрэн класс */
  chip: string;
};

/* --- Сургалтын түвшин ----------------------------------------------------- */

export type CourseLevel = "anhan" | "dund" | "ahisan" | "huuhed";

export const COURSE_LEVELS: Option<CourseLevel>[] = [
  {
    value: "anhan",
    label: "Анхан шат",
    chip: "border-emerald-600/40 text-emerald-700 dark:text-emerald-400",
  },
  {
    value: "dund",
    label: "Дунд шат",
    chip: "border-gold-600/45 text-gold-700 dark:text-gold-300",
  },
  {
    value: "ahisan",
    label: "Ахисан шат",
    chip: "border-rose-600/40 text-rose-700 dark:text-rose-400",
  },
  {
    value: "huuhed",
    label: "Хүүхдийн бүлэг",
    chip: "border-sky-600/40 text-sky-700 dark:text-sky-400",
  },
];

/* --- Сургалтын хэлбэр ----------------------------------------------------- */

export type CourseFormat = "tanhim" | "onlain" | "holimog";

export const COURSE_FORMATS: Option<CourseFormat>[] = [
  { value: "tanhim", label: "Танхим", chip: "" },
  { value: "onlain", label: "Онлайн", chip: "" },
  { value: "holimog", label: "Холимог", chip: "" },
];

/* --- Дэлгүүрийн ангилал --------------------------------------------------- */

export type ProductCategory = "bichleg" | "hereglel" | "nom" | "beleg";

export const PRODUCT_CATEGORIES: Option<ProductCategory>[] = [
  { value: "bichleg", label: "Уран бичлэгийн бүтээл", chip: "" },
  { value: "hereglel", label: "Бичгийн хэрэгсэл", chip: "" },
  { value: "nom", label: "Ном, гарын авлага", chip: "" },
  { value: "beleg", label: "Бэлэг дурсгал", chip: "" },
];

/* --- Захиалгын төлөв ------------------------------------------------------ */

export type OrderStatus =
  | "new"
  | "confirmed"
  | "paid"
  | "shipped"
  | "done"
  | "cancelled";

export const ORDER_STATUSES: Option<OrderStatus>[] = [
  {
    value: "new",
    label: "Шинэ",
    chip: "border-sky-600/40 text-sky-700 dark:text-sky-400",
  },
  {
    value: "confirmed",
    label: "Баталгаажсан",
    chip: "border-gold-600/45 text-gold-700 dark:text-gold-300",
  },
  {
    value: "paid",
    label: "Төлбөр төлсөн",
    chip: "border-emerald-600/40 text-emerald-700 dark:text-emerald-400",
  },
  {
    value: "shipped",
    label: "Хүргэлтэд гарсан",
    chip: "border-brand-500/45 text-brand-600 dark:text-brand-300",
  },
  {
    value: "done",
    label: "Дууссан",
    chip: "border-emerald-700/40 text-emerald-800 dark:text-emerald-300",
  },
  {
    value: "cancelled",
    label: "Цуцалсан",
    chip: "border-rose-600/40 text-rose-700 dark:text-rose-400",
  },
];

/* --- Бүртгэлийн төлөв ----------------------------------------------------- */

export type EnrollmentStatus = "new" | "confirmed" | "cancelled";

export const ENROLLMENT_STATUSES: Option<EnrollmentStatus>[] = [
  {
    value: "new",
    label: "Шинэ",
    chip: "border-sky-600/40 text-sky-700 dark:text-sky-400",
  },
  {
    value: "confirmed",
    label: "Бүртгэсэн",
    chip: "border-emerald-600/40 text-emerald-700 dark:text-emerald-400",
  },
  {
    value: "cancelled",
    label: "Цуцалсан",
    chip: "border-rose-600/40 text-rose-700 dark:text-rose-400",
  },
];

/* --- Хайгч туслахууд ------------------------------------------------------ */

const NEUTRAL_CHIP = "border-gold-600/40 text-gold-700 dark:text-gold-300";

function find<T extends string>(
  options: Option<T>[],
  value: string
): Option<T> {
  return (
    options.find((option) => option.value === value) ?? {
      value: value as T,
      label: value,
      chip: NEUTRAL_CHIP,
    }
  );
}

export const courseLevel = (value: string) => find(COURSE_LEVELS, value);
export const courseFormat = (value: string) => find(COURSE_FORMATS, value);
export const productCategory = (value: string) =>
  find(PRODUCT_CATEGORIES, value);
export const orderStatus = (value: string) => find(ORDER_STATUSES, value);
export const enrollmentStatus = (value: string) =>
  find(ENROLLMENT_STATUSES, value);
