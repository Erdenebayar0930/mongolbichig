"use client";

import { useEffect, useState } from "react";

import { useCart, type CartItem } from "./CartProvider";

/**
 * «Сагсанд хийх» товч. Дарсны дараа 2 секундын турш баталгаажуулалт харуулна —
 * сагс нь цэсэн дээр жижигхэн тоо болж өөрчлөгддөг тул хэрэглэгч дарсан эсэхээ
 * мэдэхгүй үлдэх эрсдэлтэй.
 */
export default function AddToCart({
  item,
  qty = 1,
  className = "btn-solid",
  disabled = false,
  label = "Сагсанд хийх",
}: {
  item: Omit<CartItem, "qty">;
  qty?: number;
  className?: string;
  disabled?: boolean;
  label?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;

    const timer = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        add(item, qty);
        setAdded(true);
      }}
      className={className}
    >
      {disabled ? "Дууссан" : added ? "Сагсанд нэмэгдлээ ✓" : label}
    </button>
  );
}
