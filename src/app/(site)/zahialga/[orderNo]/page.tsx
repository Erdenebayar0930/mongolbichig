import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import PageHeader from "@/components/site/PageHeader";
import { formatDateTime, formatPrice } from "@/lib/site/format";
import { getOrderByNo, getSettings } from "@/lib/site/queries";
import { orderStatus } from "@/lib/site/taxonomy";

// Баримт нь тухайн хүний захиалгыг харуулдаг тул кэшлэхгүй.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Захиалгын баримт",
  robots: { index: false },
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderNo: string }>;
}) {
  const { orderNo } = await params;

  const [order, settings] = await Promise.all([
    getOrderByNo(decodeURIComponent(orderNo)),
    getSettings(),
  ]);

  if (!order) notFound();

  const status = orderStatus(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <PageHeader
        eyebrow="Баярлалаа"
        title="Захиалга хүлээн авлаа"
        lead={`Бид ${settings.phone} дугаараас удахгүй холбогдож, төлбөр болон хүргэлтийн нөхцөлийг баталгаажуулна.`}
      />

      <div className="surface mt-12 p-7 sm:p-9">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="eyebrow text-gold-600 dark:text-gold-400">
              Захиалгын дугаар
            </p>
            <p className="mt-2 font-serif text-2xl tracking-[0.06em] text-brand-950 dark:text-ivory-50">
              {order.orderNo}
            </p>
          </div>
          <span className={`chip ${status.chip}`}>{status.label}</span>
        </div>

        <p className="mt-3 text-[0.8rem] text-brand-900/58 dark:text-ivory-100/52">
          {formatDateTime(order.createdAt)}
        </p>

        <span aria-hidden className="rule-gold my-7" />

        <ul className="divide-y divide-[color:var(--line)]">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-baseline gap-4 py-3.5">
              <span className="min-w-0 flex-1 text-[0.92rem] text-brand-950 dark:text-ivory-50">
                {item.slug ? (
                  <Link
                    href={`/delguur/${item.slug}`}
                    className="transition-colors duration-300 hover:text-gold-700 dark:hover:text-gold-300"
                  >
                    {item.name}
                  </Link>
                ) : (
                  item.name
                )}
              </span>
              <span className="shrink-0 text-[0.82rem] tabular-nums text-brand-900/60 dark:text-ivory-100/55">
                {formatPrice(item.price)} × {item.qty}
              </span>
              <span className="w-28 shrink-0 text-right tabular-nums text-brand-950 dark:text-ivory-50">
                {formatPrice(item.lineTotal)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-6 space-y-2.5 border-t pt-5 text-[0.88rem] hairline">
          <div className="flex justify-between">
            <dt className="text-brand-900/62 dark:text-ivory-100/58">
              Барааны дүн
            </dt>
            <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-brand-900/62 dark:text-ivory-100/58">Хүргэлт</dt>
            <dd className="tabular-nums">
              {order.delivery === "pickup"
                ? "Очиж авна"
                : order.shipping === 0
                  ? "Үнэгүй"
                  : formatPrice(order.shipping)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between border-t pt-3 hairline">
            <dt className="eyebrow text-gold-600 dark:text-gold-400">Нийт</dt>
            <dd className="font-serif text-2xl tabular-nums text-brand-950 dark:text-ivory-50">
              {formatPrice(order.total)}
            </dd>
          </div>
        </dl>

        <span aria-hidden className="rule-gold my-7" />

        <dl className="grid gap-4 text-[0.86rem] sm:grid-cols-2">
          <div>
            <dt className="field-label">Захиалагч</dt>
            <dd>{order.customerName}</dd>
          </div>
          <div>
            <dt className="field-label">Утас</dt>
            <dd>{order.phone}</dd>
          </div>
          {order.address ? (
            <div className="sm:col-span-2">
              <dt className="field-label">Хүргэлтийн хаяг</dt>
              <dd>{order.address}</dd>
            </div>
          ) : null}
          {order.note ? (
            <div className="sm:col-span-2">
              <dt className="field-label">Нэмэлт хүсэлт</dt>
              <dd className="whitespace-pre-line">{order.note}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="surface-raised mt-8 p-6 text-[0.86rem] leading-7 text-brand-900/78 dark:text-ivory-100/70">
        <p className="eyebrow mb-3 text-gold-600 dark:text-gold-400">Төлбөр</p>
        <p className="whitespace-pre-line">{settings.bankAccount}</p>
        <p className="mt-3">
          Гүйлгээний утга дээр захиалгын дугаараа{" "}
          <span className="text-brand-950 dark:text-ivory-50">
            {order.orderNo}
          </span>{" "}
          гэж бичнэ үү.
        </p>
      </div>

      <p className="mt-8 text-center text-[0.8rem] text-brand-900/58 dark:text-ivory-100/52">
        Энэ хуудсыг хадгалж авбал захиалгынхаа явцыг дараа ч шалгах боломжтой.
      </p>

      <div className="mt-8 flex justify-center gap-4">
        <Link href="/delguur" className="btn-gold">
          Дэлгүүр рүү буцах
        </Link>
      </div>
    </div>
  );
}
