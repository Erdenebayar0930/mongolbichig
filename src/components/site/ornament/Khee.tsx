/**
 * Уламжлалт хээний багц. Бүгд `currentColor`-оор зурагдана — өнгийг дуудсан
 * газраасаа (`text-gold-500`, `.ornament` г.м.) өвлөнө.
 *
 * Хээнүүд утга дамжуулдаггүй, зөвхөн чимэглэнэ. Тиймээс бүгд `aria-hidden`:
 * дэлгэц уншигчид «зураг» гэж дуудуулах нь хуудсыг чимээ шуугиантай болгоно.
 */

type OrnamentProps = {
  className?: string;
};

/**
 * Улзий — монгол хээний тэргүүн. Хоёр хавтгай гогцоо дөрвөн уулзвар дээрээ
 * ээлжлэн нэг нь нөгөөгийнхөө доогуур ордог. Зураас дээрх завсарууд нь яг
 * тэр «доогуур орсон» газрууд тул тэдгээрийг нөхвөл сүлжээ задарч, энгийн
 * тор болно.
 */
export function Ulzii({ className = "h-4 w-4" }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      className={className}
      aria-hidden
    >
      {/* Босоо гогцоо */}
      <path d="M9 3h6M9 21h6M15 3v9.8M15 17.2v3.8M9 3v3.8M9 11.2v9.8" />
      {/* Хэвтээ гогцоо */}
      <path d="M3 9v6M21 9v6M3 9h9.8M17.2 9H21M3 15h3.8M11.2 15H21" />
    </svg>
  );
}

/**
 * Гал — логоны дээд тэмдэг. Монголд гал бол гэр бүлийн голомт, ариун цэвэр,
 * үргэлжлэлийн бэлгэдэл; тахилын ширээ, тамганы дээр байрлуулдаг уламжлалтай.
 * Дотоод хоосон зай нь дөлний хэл — тиймээс `fill-rule` нь `evenodd`, эс бөгөөс
 * дөл нь дүүрэн толботох болно.
 */
export function Gal({ className = "h-8 w-8" }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 32 40"
      fill="currentColor"
      fillRule="evenodd"
      className={className}
      aria-hidden
    >
      <path d="M16 1.5c2 6 5.2 8.4 7.7 12.4 2.1 3.3 3.1 6.7 3.1 10C26.8 32.2 22 38.5 16 38.5S5.2 32.2 5.2 23.9c0-3.1.9-6.1 2.7-8.7.1 2.3.7 4 1.9 5.1C10.4 14 12.7 8.9 16 1.5zm0 13.1c-1.5 3.1-3.1 5.2-3.1 7.9 0 2.5 1.4 4.3 3.1 4.3s3.1-1.8 3.1-4.3c0-2.7-1.6-4.8-3.1-7.9zm-5.3 8.7c-.9 1.7-1.8 2.9-1.8 4.4 0 1.5.8 2.7 1.8 2.7s1.8-1.2 1.8-2.7c0-1.5-.9-2.7-1.8-4.4z" />
    </svg>
  );
}

/**
 * Эвэр угалз — эврийн мушгиа. Блокийн булан чимэхэд зориулав; эргүүлэх нь
 * дуудсан талдаа үлдэнэ (`rotate-90` г.м.).
 */
export function EverUgalz({ className = "h-8 w-8" }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M2 30V12C2 6.5 6.5 2 12 2h18" />
      <path d="M12 9c-3 0-5 2.2-5 5v4" opacity="0.75" />
      <path d="M12 15.5c-.9 0-1.4.6-1.4 1.5" opacity="0.55" />
    </svg>
  );
}

/**
 * Хоёр талдаа уусах зураастай улзий — хэсэг тусгаарлагч. `.ornament` класс
 * зураасуудыг нь өгдөг тул энд зөвхөн голын хээ.
 */
export function KheeDivider({ className = "" }: { className?: string }) {
  return (
    <p className={`ornament ${className}`.trim()}>
      <Ulzii className="h-3.5 w-3.5" />
    </p>
  );
}
