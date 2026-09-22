/**
 * Бийрийн татлага, бэхэн будаг, тэмдэгүүд — зарын хуудасны дүрслэлийн хэл.
 *
 * Уран бичлэгийн зар сурталчилгаа гурван зүйл дээр тогтдог: бийрээр татсан
 * алтан зурвас (гарчгийн ард), цаасанд шингэсэн бэхэн будаг (булангуудад),
 * тодорхой мэдээллийн бөмбөлгүүд (хугацаа, төлбөр). Эдгээрийг энд нэг
 * дороос гаргаж, хуудас бүрт давтахгүй.
 *
 * Бүгд `currentColor`-оор будагдана — өнгийг дуудсан газраасаа өвлөнө.
 */

type Props = {
  className?: string;
};

/**
 * Бийрийн нэг татлага. Бичвэрийн ард сунгаж тавихад зориулав тул
 * `preserveAspectRatio` нь `none` — сунгахад л татлага «бийрдсэн» хэвээр
 * үлдэнэ. Үзүүрүүд нь жигд бус: бийр цаасанд хүрч, салах хоёр агшин.
 */
export function BrushSwipe({ className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 240 48"
      preserveAspectRatio="none"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M3 27c14-8 33-13 58-16 34-4 76-4 122 1 22 2 40 6 54 11-10 6-25 10-45 12-38 4-84 4-130 0-24-2-44-5-59-8z" />
      {/* Хуурай бийрийн ул мөр — татлагаас тасарсан хэдэн үртэс */}
      <path
        d="M214 15c8 1 15 3 20 5-6 1-13 1-21 0zM18 36c7 2 16 4 27 5-11 1-21 0-30-2z"
        opacity="0.55"
      />
    </svg>
  );
}

/**
 * Бэхэн будаг — цаасанд шингэсэн толбо. Хуудасны булан, хайрцгийн ард маш
 * бүдгээр тавина: хэлбэр нь тодрох ёсгүй, зөвхөн цаас нь «бичгийн ширээн
 * дээрх» мэт мэдрэгдэнэ.
 */
export function InkWash({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 200 160" fill="currentColor" className={className} aria-hidden>
      <path
        d="M52 12c28-9 66-7 92 7 24 13 37 34 28 52-9 17-38 23-70 25-34 3-70-2-88-16C-4 66-2 44 18 31c7-5 17-11 34-19z"
        opacity="0.5"
      />
      <path
        d="M74 44c22-6 48-4 66 6 16 9 24 23 18 34-7 11-26 15-49 16-24 1-49-2-61-11-12-9-11-24 3-33 5-3 12-7 23-12z"
        opacity="0.35"
      />
      <path d="M150 118c12 3 22 9 26 16-11 2-23-1-33-8z" opacity="0.4" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Тэмдэгүүд                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Бөмбөлөг доторх жижиг тэмдэгүүд. Гаднаас фонт татахгүй, зурлагын зузаан нь
 * сайтын бусад зурааснуудтай (1.5) нэг.
 */
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function IconCalendar({ className = "h-5 w-5" }: Props) {
  return (
    <svg {...iconProps} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

/** Бийр — уран бичлэгийн хэрэгсэл, сургалтын хэлбэрийг заана */
export function IconBrush({ className = "h-5 w-5" }: Props) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M18.5 3.5a2.1 2.1 0 0 1 0 3L11 14l-3-3 7.5-7.5a2.1 2.1 0 0 1 3 0z" />
      <path d="M8 11c-2 1-3 2.6-3.3 4.8-.1.8-.5 1.6-1.2 2.4 1.7.9 3.3 1.1 4.7.6 1.9-.7 3-2.2 3.3-4.3" />
    </svg>
  );
}

export function IconClock({ className = "h-5 w-5" }: Props) {
  return (
    <svg {...iconProps} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

/** Суудал — хүний дүрс биш, сандлын дүрс: тоо ярьж байгааг шууд хэлнэ */
export function IconSeat({ className = "h-5 w-5" }: Props) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M6 4h12M7 4v7h10V4M4.5 11h15M6.5 11v9M17.5 11v9" />
    </svg>
  );
}

export function IconTag({ className = "h-5 w-5" }: Props) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M3.5 11.2V4.5a1 1 0 0 1 1-1h6.7c.3 0 .5.1.7.3l8 8a1 1 0 0 1 0 1.4l-6.7 6.7a1 1 0 0 1-1.4 0l-8-8a1 1 0 0 1-.3-.7z" />
      <circle cx="8" cy="8" r="1.4" />
    </svg>
  );
}

export function IconPin({ className = "h-5 w-5" }: Props) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}
