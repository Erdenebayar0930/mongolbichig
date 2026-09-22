import type { Metadata } from "next";

import PageHeader from "@/components/site/PageHeader";
import { KheeDivider } from "@/components/site/ornament/Khee";
import { getSettings } from "@/lib/site/queries";

/**
 * Нууцлалын бодлого.
 *
 * ⚠ Энэ бичвэр нь код юу хийдгийг ҮНЭН зөвөөр тайлбарлах ёстой. Хуулбарласан
 * загвар бодлого нь байхгүй хяналт, цуглуулдаггүй өгөгдлийг дурдаж, үнэн
 * байдлаа алддаг. Тиймээс энд бичигдсэн зүйл бүр эх кодоос гарсан:
 *
 *   - захиалга      → `site_orders` (нэр, утас, и-мэйл, хаяг, тэмдэглэл)
 *   - сургалт       → `site_enrollments` (нэр, утас, и-мэйл, тэмдэглэл)
 *   - сагс          → зөвхөн хөтчийн `localStorage["uranbichleg-cart"]`
 *   - харагдац      → `localStorage["site-theme"]`
 *   - Facebook бот  → сэтгэгдлийг уншина, хадгалдаггүй
 *
 * Сайтад аналитик, сурталчилгааны мөрдөгч, гуравдагч талын скрипт БАЙХГҮЙ
 * (2026-08-25-ны байдлаар шалгасан). Хэрэв нэмэх бол энэ хуудсыг ЗЭРЭГ
 * шинэчилнэ — эс бөгөөс баримт нь бодит байдлаасаа чимээгүй тасарна.
 */
export const metadata: Metadata = {
  title: "Нууцлалын бодлого",
  description:
    "Уран бичлэг & Монгол өв соёл сайт ямар мэдээлэл цуглуулж, юунд ашигладаг тухай.",
};

/** Хэсгийн гарчиг — хуудсын дотор олон удаа давтагдана. */
function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-12 font-serif text-xl font-medium text-brand-950 dark:text-ivory-50">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 text-[1.02rem] leading-8 text-brand-900/82 dark:text-ivory-100/72">
      {children}
    </p>
  );
}

export default async function PrivacyPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <PageHeader
        eyebrow="Хууль эрх зүй"
        title="Нууцлалын бодлого"
        lead="Бид ямар мэдээлэл цуглуулж, юунд ашигладаг вэ."
        breadcrumbs={[{ href: "/", label: "Нүүр" }]}
      />

      <div className="mx-auto mt-12 max-w-2xl">
        <P>
          Энэ сайт нь <strong>шаардлагатай хамгийн бага мэдээллийг</strong> л
          цуглуулна. Хэрэглэгчийн бүртгэл байхгүй, аналитик хөтлөгч байхгүй,
          сурталчилгааны гуравдагч талын скрипт байхгүй.
        </P>

        <H2>Бидний цуглуулдаг мэдээлэл</H2>

        <h3 className="mt-8 font-serif text-lg text-brand-950 dark:text-ivory-50">
          Захиалга өгөх үед
        </h3>
        <P>
          Дэлгүүрээс захиалга өгөхөд таны <strong>нэр, утасны дугаар</strong>,
          мөн бөглөсөн бол <strong>и-мэйл, хүргэлтийн хаяг, тэмдэглэл</strong>{" "}
          хадгалагдана. Эдгээр нь захиалгыг бэлдэж, тантай холбогдож, хүргэхэд
          шаардлагатай.
        </P>

        <h3 className="mt-8 font-serif text-lg text-brand-950 dark:text-ivory-50">
          Сургалтад бүртгүүлэх үед
        </h3>
        <P>
          Сургалтын нэр, таны <strong>нэр, утас</strong>, мөн бөглөсөн бол{" "}
          <strong>и-мэйл, тэмдэглэл</strong> хадгалагдана. Зорилго нь бүртгэлийг
          баталгаажуулж, хичээлийн мэдээллийг хүргэх.
        </P>

        <h3 className="mt-8 font-serif text-lg text-brand-950 dark:text-ivory-50">
          Зөвхөн таны хөтөч дээр үлддэг зүйлс
        </h3>
        <P>
          <strong>Сагс</strong> нь зөвхөн таны хөтөчид хадгалагдана — захиалга
          илгээх хүртэл сервер рүү огт очихгүй. Гэрэл/бараан{" "}
          <strong>харагдацын сонголт</strong> ч мөн адил зөвхөн танай төхөөрөмж
          дээр үлдэнэ.
        </P>

        <h3 className="mt-8 font-serif text-lg text-brand-950 dark:text-ivory-50">
          Facebook дээрх бот
        </h3>
        <P>
          Манай Facebook хуудасны пост дор бичсэн сэтгэгдлийг уншиж, доторх
          кирилл бичвэрийг монгол бичгээр буулгасан зургаар хариулдаг үйлчилгээ
          ажилладаг. Тэрхүү бичвэрийг <strong>хадгалдаггүй</strong> — зөвхөн
          хариу зургийг үүсгэхэд ашиглаад орхино.
        </P>

        <KheeDivider className="mt-14" />

        <H2>Бид юу хийдэггүй вэ</H2>
        <ul className="mt-5 space-y-3 text-[1.02rem] leading-8 text-brand-900/82 dark:text-ivory-100/72">
          <li>· Таны мэдээллийг хэн нэгэнд зардаггүй, түрээслүүлдэггүй.</li>
          <li>
            · Google Analytics, Facebook Pixel зэрэг мөрдөгч суулгаагүй — сайт
            танийг хуудас хооронд дагадаггүй.
          </li>
          <li>· Сурталчилгааны сүлжээнд өгөгдөл дамжуулдаггүй.</li>
          <li>
            · Хэрэглэгчийн бүртгэл, нууц үг байхгүй тул тэдгээрийг хадгалдаггүй.
          </li>
        </ul>

        <H2>Хэр удаан хадгалдаг вэ</H2>
        <P>
          Захиалга, сургалтын бүртгэлийн мэдээллийг нягтлан бодох болон
          үйлчлүүлэгчийн түүхийн зорилгоор хадгална. Устгуулахыг хүсвэл доорх
          хаягаар хандаарай — хууль ёсоор заавал хадгалах ёстой бичлэгээс бусдыг
          устгана.
        </P>

        <H2>Таны эрх</H2>
        <P>
          Өөрийнхөө тухай ямар мэдээлэл байгааг асуух, буруу мэдээллийг
          залруулах, устгуулах эрхтэй. Хүсэлтээ дараах хаягаар илгээнэ үү:
        </P>
        <ul className="mt-5 space-y-2 text-[1.02rem] leading-8 text-brand-900/82 dark:text-ivory-100/72">
          {settings.phone ? <li>· Утас: {settings.phone}</li> : null}
          {settings.email ? <li>· И-мэйл: {settings.email}</li> : null}
          {settings.facebook ? (
            <li>
              ·{" "}
              <a
                href={settings.facebook}
                rel="noreferrer noopener"
                target="_blank"
                className="text-gold-700 underline-offset-4 hover:underline dark:text-gold-300"
              >
                Facebook хуудас
              </a>
            </li>
          ) : null}
        </ul>

        <H2>Өөрчлөлт</H2>
        <P>
          Мэдээлэл цуглуулах арга барил өөрчлөгдөх бүрд энэ хуудас мөн адил
          шинэчлэгдэнэ.
        </P>
      </div>
    </div>
  );
}
