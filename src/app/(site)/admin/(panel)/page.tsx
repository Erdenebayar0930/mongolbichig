import Link from "next/link";

import AdminHeading from "@/components/site/admin/AdminHeading";
import { formatDateTime, formatNumber, formatPrice } from "@/lib/site/format";
import {
  adminListEnrollments,
  adminListOrders,
  adminLowStock,
  adminStats,
} from "@/lib/site/queries";
import { enrollmentStatus, orderStatus } from "@/lib/site/taxonomy";

export default async function AdminDashboard() {
  const [stats, orders, enrollments, lowStock] = await Promise.all([
    adminStats(),
    adminListOrders(),
    adminListEnrollments(),
    adminLowStock(),
  ]);

  const tiles = [
    { label: "Шинэ захиалга", value: formatNumber(stats.newOrders), href: "/admin/zahialga" },
    {
      label: "Шинэ бүртгэл",
      value: formatNumber(stats.newEnrollments),
      href: "/admin/burtgel",
    },
    { label: "Сургалт", value: formatNumber(stats.courses), href: "/admin/surgalt" },
    { label: "Бүтээгдэхүүн", value: formatNumber(stats.products), href: "/admin/delguur" },
    { label: "Төлөгдсөн орлого", value: formatPrice(stats.revenue), href: "/admin/zahialga" },
  ];

  return (
    <>
      <AdminHeading title="Хяналтын самбар" />

      {/* Тоонууд — 1px завсартай сүлжээ нь хүрээ давхардахаас сэргийлнэ */}
      <div className="grid gap-px bg-[color:var(--line)] sm:grid-cols-2 lg:grid-cols-5">
        {tiles.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="group bg-[color:var(--surface)] px-5 py-6 transition-colors duration-300 hover:bg-[color:var(--surface-2)]"
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-brand-900/52 dark:text-ivory-100/48">
              {tile.label}
            </p>
            <p className="mt-3 font-serif text-2xl text-brand-950 dark:text-ivory-50">
              {tile.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        {/* --- Сүүлийн захиалга ------------------------------------------- */}
        <section>
          <h2 className="mb-5 font-serif text-lg text-brand-950 dark:text-ivory-50">
            Сүүлийн захиалга
          </h2>

          {orders.length > 0 ? (
            <ul className="divide-y divide-[color:var(--line)] border-y hairline">
              {orders.slice(0, 6).map((order) => {
                const status = orderStatus(order.status);

                return (
                  <li key={order.id}>
                    <Link
                      href={`/admin/zahialga/${order.id}`}
                      className="flex items-center gap-4 py-3.5 transition-colors duration-300 hover:text-gold-700 dark:hover:text-gold-300"
                    >
                      <span className="w-40 shrink-0 font-mono text-[0.76rem] tracking-tight">
                        {order.orderNo}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[0.88rem]">
                        {order.customerName}
                      </span>
                      <span className={`chip shrink-0 ${status.chip}`}>
                        {status.label}
                      </span>
                      <span className="w-24 shrink-0 text-right text-[0.85rem] tabular-nums">
                        {formatPrice(order.total)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-8 text-[0.85rem] text-brand-900/50 dark:text-ivory-100/45">
              Захиалга алга
            </p>
          )}
        </section>

        {/* --- Сүүлийн бүртгэл -------------------------------------------- */}
        <section>
          <h2 className="mb-5 font-serif text-lg text-brand-950 dark:text-ivory-50">
            Сургалтын бүртгэл
          </h2>

          {enrollments.length > 0 ? (
            <ul className="divide-y divide-[color:var(--line)] border-y hairline">
              {enrollments.slice(0, 6).map((entry) => {
                const status = enrollmentStatus(entry.status);

                return (
                  <li key={entry.id} className="flex items-center gap-4 py-3.5">
                    <span className="w-28 shrink-0 text-[0.76rem] text-brand-900/50 dark:text-ivory-100/45">
                      {formatDateTime(entry.createdAt)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.88rem]">
                        {entry.name}
                      </span>
                      <span className="block truncate text-[0.76rem] text-brand-900/50 dark:text-ivory-100/45">
                        {entry.courseTitle}
                      </span>
                    </span>
                    <span className={`chip shrink-0 ${status.chip}`}>
                      {status.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-8 text-[0.85rem] text-brand-900/50 dark:text-ivory-100/45">
              Бүртгэл алга
            </p>
          )}
        </section>
      </div>

      {lowStock.length > 0 ? (
        <section className="mt-12">
          <h2 className="mb-5 font-serif text-lg text-brand-950 dark:text-ivory-50">
            Үлдэгдэлтэй бараа
          </h2>
          <ul className="divide-y divide-[color:var(--line)] border-y hairline">
            {lowStock.map((product) => (
              <li key={product.id} className="flex items-center gap-4 py-3">
                <Link
                  href={`/admin/delguur/${product.id}`}
                  className="min-w-0 flex-1 truncate text-[0.88rem] transition-colors duration-300 hover:text-gold-700 dark:hover:text-gold-300"
                >
                  {product.name}
                </Link>
                <span
                  className={`w-20 shrink-0 text-right text-[0.85rem] tabular-nums ${
                    product.stock === 0
                      ? "text-seal-600 dark:text-seal-400"
                      : "text-brand-950 dark:text-ivory-50"
                  }`}
                >
                  {product.stock} ш
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
