import Link from "next/link";

import AdminHeading from "@/components/site/admin/AdminHeading";
import { formatDateTime, formatPrice } from "@/lib/site/format";
import { adminListOrders } from "@/lib/site/queries";
import { ORDER_STATUSES, orderStatus } from "@/lib/site/taxonomy";

export const metadata = { title: "Захиалга" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ toluv?: string }>;
}) {
  const { toluv } = await searchParams;

  const active = ORDER_STATUSES.some((status) => status.value === toluv)
    ? toluv
    : undefined;

  const orders = await adminListOrders(active);

  return (
    <>
      <AdminHeading title="Захиалга" count={orders.length} />

      <nav
        aria-label="Төлвөөр шүүх"
        className="mb-7 flex flex-wrap items-center gap-2"
      >
        <Link
          href="/admin/zahialga"
          aria-current={!active ? "page" : undefined}
          className={`chip transition-colors duration-300 ${
            active
              ? "border-[color:var(--line)] text-brand-900/55 dark:text-ivory-100/50"
              : "border-gold-500 bg-gold-500 text-brand-950"
          }`}
        >
          Бүгд
        </Link>
        {ORDER_STATUSES.map((status) => (
          <Link
            key={status.value}
            href={`/admin/zahialga?toluv=${status.value}`}
            aria-current={active === status.value ? "page" : undefined}
            className={`chip transition-colors duration-300 ${
              active === status.value
                ? "border-gold-500 bg-gold-500 text-brand-950"
                : `${status.chip} opacity-80 hover:opacity-100`
            }`}
          >
            {status.label}
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="border border-dashed border-gold-500/30 p-14 text-center text-[0.85rem] text-brand-900/55 dark:text-ivory-100/50">
          Энэ төлөвт захиалга алга.
        </p>
      ) : (
        <ul className="divide-y divide-[color:var(--line)] border-y hairline">
          {orders.map((order) => {
            const status = orderStatus(order.status);

            return (
              <li key={order.id}>
                <Link
                  href={`/admin/zahialga/${order.id}`}
                  className="flex flex-wrap items-center gap-x-5 gap-y-2 py-4 transition-colors duration-300 hover:text-gold-700 dark:hover:text-gold-300"
                >
                  <span className="w-40 shrink-0 font-mono text-[0.78rem]">
                    {order.orderNo}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.92rem] text-brand-950 dark:text-ivory-50">
                      {order.customerName}
                    </span>
                    <span className="mt-0.5 block text-[0.76rem] text-brand-900/50 dark:text-ivory-100/45">
                      {order.phone} ·{" "}
                      {order.delivery === "delivery" ? "Хүргэлт" : "Очиж авна"}
                    </span>
                  </span>

                  <span className={`chip shrink-0 ${status.chip}`}>
                    {status.label}
                  </span>

                  <span className="w-32 shrink-0 text-right text-[0.78rem] text-brand-900/50 dark:text-ivory-100/45">
                    {formatDateTime(order.createdAt)}
                  </span>

                  <span className="w-28 shrink-0 text-right text-[0.9rem] tabular-nums text-brand-950 dark:text-ivory-50">
                    {formatPrice(order.total)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
