import Link from "next/link";
import { notFound } from "next/navigation";

import AdminHeading from "@/components/site/admin/AdminHeading";
import { setOrderStatus } from "@/lib/site/actions/admin";
import { formatDateTime, formatPrice } from "@/lib/site/format";
import { adminGetOrder } from "@/lib/site/queries";
import { ORDER_STATUSES, orderStatus } from "@/lib/site/taxonomy";

export const metadata = { title: "Захиалгын дэлгэрэнгүй" };

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await adminGetOrder(id);

  if (!order) notFound();

  const status = orderStatus(order.status);

  return (
    <>
      <AdminHeading title={order.orderNo} />

      <p className="-mt-4 mb-8 text-[0.8rem] text-brand-900/52 dark:text-ivory-100/48">
        {formatDateTime(order.createdAt)}
        {order.updatedAt > order.createdAt
          ? ` · Сүүлд ${formatDateTime(order.updatedAt)}-д шинэчилсэн`
          : ""}
      </p>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <ul className="divide-y divide-[color:var(--line)] border-y hairline">
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
                <span className="shrink-0 text-[0.82rem] tabular-nums text-brand-900/55 dark:text-ivory-100/50">
                  {formatPrice(item.price)} × {item.qty}
                </span>
                <span className="w-28 shrink-0 text-right tabular-nums text-brand-950 dark:text-ivory-50">
                  {formatPrice(item.lineTotal)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2 text-[0.88rem]">
            <div className="flex justify-between">
              <dt className="text-brand-900/60 dark:text-ivory-100/55">
                Барааны дүн
              </dt>
              <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-brand-900/60 dark:text-ivory-100/55">Хүргэлт</dt>
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
        </div>

        <aside className="space-y-8">
          <div className="surface p-6">
            <p className="eyebrow mb-4 text-gold-600 dark:text-gold-400">Төлөв</p>
            <p className={`chip ${status.chip}`}>{status.label}</p>

            <form action={setOrderStatus} className="mt-5 space-y-3">
              <input type="hidden" name="id" value={order.id} />
              <label htmlFor="status" className="sr-only">
                Шинэ төлөв
              </label>
              <select
                id="status"
                name="status"
                defaultValue={order.status}
                className="field"
              >
                {ORDER_STATUSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-quiet w-full">
                Төлөв солих
              </button>
            </form>
          </div>

          <div className="surface-raised p-6">
            <p className="eyebrow mb-4 text-gold-600 dark:text-gold-400">
              Захиалагч
            </p>
            <dl className="space-y-4 text-[0.88rem]">
              <div>
                <dt className="field-label">Нэр</dt>
                <dd>{order.customerName}</dd>
              </div>
              <div>
                <dt className="field-label">Утас</dt>
                <dd>
                  <a
                    href={`tel:${order.phone}`}
                    className="border-b border-gold-500/40 transition-colors hover:text-gold-700 dark:hover:text-gold-300"
                  >
                    {order.phone}
                  </a>
                </dd>
              </div>
              {order.email ? (
                <div>
                  <dt className="field-label">И-мэйл</dt>
                  <dd>
                    <a
                      href={`mailto:${order.email}`}
                      className="break-all border-b border-gold-500/40 transition-colors hover:text-gold-700 dark:hover:text-gold-300"
                    >
                      {order.email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {order.address ? (
                <div>
                  <dt className="field-label">Хаяг</dt>
                  <dd className="whitespace-pre-line">{order.address}</dd>
                </div>
              ) : null}
              {order.note ? (
                <div>
                  <dt className="field-label">Нэмэлт хүсэлт</dt>
                  <dd className="whitespace-pre-line">{order.note}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <Link href="/admin/zahialga" className="btn-quiet w-full">
            ← Жагсаалт руу
          </Link>
        </aside>
      </div>
    </>
  );
}
