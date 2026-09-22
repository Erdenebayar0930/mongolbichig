"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { useCart } from "./CartProvider";
import { EMPTY_FORM_STATE } from "@/lib/site/actions/form-state";
import { placeOrder } from "@/lib/site/actions/shop";
import { fallbackCover, formatPrice } from "@/lib/site/format";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn-solid mt-7 w-full">
      {pending ? "Илгээж байна…" : "Захиалга баталгаажуулах"}
    </button>
  );
}

export default function CartView({
  shippingFee,
  freeShippingFrom,
  bankAccount,
  phone,
}: {
  shippingFee: number;
  freeShippingFrom: number;
  bankAccount: string;
  phone: string;
}) {
  const { items, ready, subtotal, setQty, remove, clear } = useCart();
  const [state, formAction] = useActionState(placeOrder, EMPTY_FORM_STATE);
  const [delivery, setDelivery] = useState<"pickup" | "delivery">("pickup");
  const router = useRouter();

  // Захиалга үүссэний дараа сагсыг цэвэрлээд баримт руу шилжинэ. Хоёуланг
  // энд хийхгүй бол хэрэглэгч буцах товч дараад хуучин сагсаа олно.
  useEffect(() => {
    if (!state.ok || !state.orderNo) return;

    clear();
    router.push(`/zahialga/${state.orderNo}`);
  }, [state.ok, state.orderNo, clear, router]);

  const shipping =
    delivery === "delivery" &&
    (freeShippingFrom === 0 || subtotal < freeShippingFrom)
      ? shippingFee
      : 0;

  if (!ready) {
    // localStorage уншиж дуустал ямар ч тодорхой зүйл бичихгүй — «сагс хоосон»
    // гээд дараа нь барааг гаргавал анивчиж харагдана.
    return (
      <p className="py-20 text-center text-[0.8rem] uppercase tracking-[0.2em] text-brand-900/45 dark:text-ivory-100/40">
        Сагсыг ачаалж байна…
      </p>
    );
  }

  if (state.ok) {
    return (
      <p className="py-20 text-center text-[0.8rem] uppercase tracking-[0.2em] text-gold-700 dark:text-gold-300">
        Захиалга бүртгэгдлээ. Баримт руу шилжиж байна…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-14 border border-dashed border-gold-500/30 p-16 text-center">
        <p className="font-serif text-xl text-brand-950 dark:text-ivory-50">
          Сагс хоосон байна
        </p>
        <p className="mt-3 text-[0.9rem] text-brand-900/68 dark:text-ivory-100/62">
          Дэлгүүрээс бүтээл сонгоод сагсандаа нэмнэ үү.
        </p>
        <Link href="/delguur" className="btn-gold mt-8">
          Дэлгүүр рүү очих
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-10">
      {/* --- Сагсны мөрүүд ------------------------------------------------ */}
      <ul className="divide-y divide-[color:var(--line)] border-y hairline">
        {items.map((item) => (
          <li key={item.slug} className="flex gap-5 py-5">
            <Link href={`/delguur/${item.slug}`} className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.coverUrl || fallbackCover("bichleg")}
                alt=""
                className="h-24 w-24 object-cover"
              />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <h2 className="font-serif text-[1.05rem] leading-snug text-brand-950 dark:text-ivory-50">
                <Link
                  href={`/delguur/${item.slug}`}
                  className="transition-colors duration-300 hover:text-gold-700 dark:hover:text-gold-300"
                >
                  {item.name}
                </Link>
              </h2>
              <p className="mt-1 text-[0.82rem] text-brand-900/60 dark:text-ivory-100/55">
                {formatPrice(item.price)}
              </p>

              <div className="mt-auto flex items-center justify-between gap-4 pt-3">
                <div className="hairline flex items-center border">
                  <button
                    type="button"
                    onClick={() => setQty(item.slug, item.qty - 1)}
                    aria-label={`${item.name} — тоог хасах`}
                    className="grid h-9 w-9 place-items-center text-brand-900/70 transition-colors duration-300 hover:text-gold-600 dark:text-ivory-100/65"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-[0.9rem] tabular-nums">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(item.slug, item.qty + 1)}
                    aria-label={`${item.name} — тоог нэмэх`}
                    className="grid h-9 w-9 place-items-center text-brand-900/70 transition-colors duration-300 hover:text-gold-600 dark:text-ivory-100/65"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => remove(item.slug)}
                  className="text-[0.68rem] uppercase tracking-[0.16em] text-brand-900/50 transition-colors duration-300 hover:text-rose-700 dark:text-ivory-100/45 dark:hover:text-rose-400"
                >
                  Хасах
                </button>
              </div>
            </div>

            <p className="shrink-0 self-center font-serif text-lg text-brand-950 dark:text-ivory-50">
              {formatPrice(item.price * item.qty)}
            </p>
          </li>
        ))}
      </ul>

      {/* --- Захиалгын маягт ---------------------------------------------- */}
      <form action={formAction} className="surface h-fit p-6 sm:p-7" noValidate>
        <h2 className="font-serif text-xl text-brand-950 dark:text-ivory-50">
          Захиалагчийн мэдээлэл
        </h2>

        {/*
          Сервер зөвхөн slug ба тоог хүлээж авна. Үнийг явуулсан ч хэрэггүй —
          хөтөч дэх утгыг засаж болдог тул сервер өөрөө DB-ээс уншиж бодно.
        */}
        <input
          type="hidden"
          name="items"
          value={JSON.stringify(
            items.map((item) => ({ slug: item.slug, qty: item.qty }))
          )}
        />

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="order-name" className="field-label">
              Нэр <span className="text-seal-600">*</span>
            </label>
            <input
              id="order-name"
              name="customerName"
              required
              autoComplete="name"
              className="field"
              placeholder="Овог нэр"
            />
            {state.fields?.customerName ? (
              <span className="field-error">{state.fields.customerName}</span>
            ) : null}
          </div>

          <div>
            <label htmlFor="order-phone" className="field-label">
              Утас <span className="text-seal-600">*</span>
            </label>
            <input
              id="order-phone"
              name="phone"
              required
              inputMode="tel"
              autoComplete="tel"
              className="field"
              placeholder="99112233"
            />
            {state.fields?.phone ? (
              <span className="field-error">{state.fields.phone}</span>
            ) : null}
          </div>

          <div>
            <label htmlFor="order-email" className="field-label">
              И-мэйл
            </label>
            <input
              id="order-email"
              name="email"
              type="email"
              autoComplete="email"
              className="field"
              placeholder="Заавал биш"
            />
            {state.fields?.email ? (
              <span className="field-error">{state.fields.email}</span>
            ) : null}
          </div>

          <fieldset>
            <legend className="field-label">Хүлээн авах</legend>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { value: "pickup", label: "Очиж авна" },
                  { value: "delivery", label: "Хүргүүлнэ" },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className={`hairline cursor-pointer border px-4 py-3 text-center text-[0.8rem] transition-colors duration-300 ${
                    delivery === option.value
                      ? "border-gold-500 text-gold-700 dark:text-gold-300"
                      : "text-brand-900/65 dark:text-ivory-100/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value={option.value}
                    checked={delivery === option.value}
                    onChange={() => setDelivery(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          {delivery === "delivery" ? (
            <div>
              <label htmlFor="order-address" className="field-label">
                Хүргэлтийн хаяг <span className="text-seal-600">*</span>
              </label>
              <textarea
                id="order-address"
                name="address"
                rows={2}
                className="field resize-y"
                placeholder="Дүүрэг, хороо, байр, тоот"
              />
              {state.fields?.address ? (
                <span className="field-error">{state.fields.address}</span>
              ) : null}
            </div>
          ) : null}

          <div>
            <label htmlFor="order-note" className="field-label">
              Нэмэлт хүсэлт
            </label>
            <textarea
              id="order-note"
              name="note"
              rows={3}
              className="field resize-y"
              placeholder="Бичүүлэх үг, хэмжээ, хүрэлцүүлэх хугацаа…"
            />
          </div>
        </div>

        {/* --- Дүн ---------------------------------------------------------- */}
        <div className="mt-7 space-y-2.5 border-t pt-5 text-[0.88rem] hairline">
          <div className="flex justify-between">
            <span className="text-brand-900/65 dark:text-ivory-100/60">
              Барааны дүн
            </span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-900/65 dark:text-ivory-100/60">
              Хүргэлт
            </span>
            <span className="tabular-nums">
              {delivery === "pickup"
                ? "—"
                : shipping === 0
                  ? "Үнэгүй"
                  : formatPrice(shipping)}
            </span>
          </div>
          <div className="flex items-baseline justify-between border-t pt-3 hairline">
            <span className="eyebrow text-gold-600 dark:text-gold-400">Нийт</span>
            <span className="font-serif text-2xl tabular-nums text-brand-950 dark:text-ivory-50">
              {formatPrice(subtotal + shipping)}
            </span>
          </div>
        </div>

        {state.error ? (
          <p className="mt-5 border border-seal-500/40 px-4 py-3 text-[0.85rem] text-seal-600 dark:text-seal-400">
            {state.error}
          </p>
        ) : null}

        <SubmitButton />

        <p className="mt-5 text-[0.78rem] leading-6 text-brand-900/58 dark:text-ivory-100/52">
          Захиалга илгээсний дараа бид {phone} дугаараас холбогдож
          баталгаажуулна. Онлайн төлбөр аваагүй — {bankAccount} данс руу
          шилжүүлэх, эсвэл газар дээр нь төлнө.
        </p>
      </form>
    </div>
  );
}
