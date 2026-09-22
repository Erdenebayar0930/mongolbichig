import type { Metadata } from "next";

import CartView from "@/components/site/cart/CartView";
import PageHeader from "@/components/site/PageHeader";
import { getSettings } from "@/lib/site/queries";
import { settingNumber } from "@/lib/site/settings";

export const metadata: Metadata = {
  title: "Сагс",
  description: "Сонгосон бүтээлээ шалгаад захиалгаа үлдээнэ үү.",
  // Сагс нь хувь хүний зүйл — хайлтын системд индексжих шаардлагагүй.
  robots: { index: false },
};

export default async function CartPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <PageHeader
        eyebrow="Захиалга"
        title="Сагс"
        lead="Сонголтоо шалгаад мэдээллээ үлдээгээрэй. Онлайн төлбөр аваагүй — бид утсаар холбогдож баталгаажуулна."
      />

      <CartView
        shippingFee={settingNumber(settings.shippingFee, 0)}
        freeShippingFrom={settingNumber(settings.freeShippingFrom, 0)}
        bankAccount={settings.bankAccount}
        phone={settings.phone}
      />
    </div>
  );
}
