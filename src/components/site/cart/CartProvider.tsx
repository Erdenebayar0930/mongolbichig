"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  slug: string;
  name: string;
  /** Сагсанд хийх үеийн үнэ — зөвхөн харуулахад. Бодит дүнг сервер тооцно. */
  price: number;
  coverUrl: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  /** localStorage уншиж дуустал `false` — эс бөгөөс сервер/клиент зөрнө */
  ready: boolean;
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "uranbichleg-cart";
/** Нэг мөрөнд зөвшөөрөх дээд тоо — гараас алдаатай оруулахаас хамгаална */
const MAX_QTY = 99;

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Хуучин хувилбарын бүтэц үлдсэн байж болно — талбар бүрийг шалгана.
    return parsed.flatMap((entry): CartItem[] => {
      if (typeof entry !== "object" || entry === null) return [];
      const item = entry as Record<string, unknown>;

      if (typeof item.slug !== "string" || typeof item.name !== "string") {
        return [];
      }

      return [
        {
          slug: item.slug,
          name: item.name,
          price: Number(item.price) || 0,
          coverUrl: typeof item.coverUrl === "string" ? item.coverUrl : "",
          qty: Math.min(MAX_QTY, Math.max(1, Number(item.qty) || 1)),
        },
      ];
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Сервер дээр localStorage байхгүй тул эхний зурагдалт үргэлж хоосон
  // сагстай явна. Уншсаны дараа л жинхэнэ агуулга тавина.
  useEffect(() => {
    setItems(readStorage());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Хувийн горимд бичиж чадахгүй байж болно — сагс зөвхөн энэ табд амьдарна
    }
  }, [items, ready]);

  // Хоёр таб зэрэг нээлттэй үед сагс зөрөхгүй байх ёстой.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setItems(readStorage());
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((current) => {
      const existing = current.find((row) => row.slug === item.slug);

      if (!existing) {
        return [...current, { ...item, qty: Math.min(MAX_QTY, Math.max(1, qty)) }];
      }

      return current.map((row) =>
        row.slug === item.slug
          ? { ...row, ...item, qty: Math.min(MAX_QTY, row.qty + qty) }
          : row
      );
    });
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setItems((current) =>
      qty < 1
        ? current.filter((row) => row.slug !== slug)
        : current.map((row) =>
            row.slug === slug ? { ...row, qty: Math.min(MAX_QTY, qty) } : row
          )
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((current) => current.filter((row) => row.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      ready,
      count: items.reduce((sum, row) => sum + row.qty, 0),
      subtotal: items.reduce((sum, row) => sum + row.price * row.qty, 0),
      add,
      setQty,
      remove,
      clear,
    };
  }, [items, ready, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart-ыг <CartProvider> дотор дуудна.");
  }

  return context;
}
