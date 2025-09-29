"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadCart, saveCart, subscribeCart } from "../../lib/cartSync";

const CartCtx = createContext({
  items: [],
  add: () => {},
  addItem: () => {},
  remove: () => {},
  setQty: () => {},
  clear: () => {},
});

export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  // hydrate + realtime
  useEffect(() => {
    let unsub;
    (async () => {
      try {
        const initial = await loadCart();
        setItems(initial);
        unsub = await subscribeCart(setItems);
      } catch (e) {
        console.error("Cart hydrate failed:", e);
      }
    })();
    return () => unsub && unsub();
  }, []);

  // persist (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      saveCart(items).catch((e) => console.error("Cart save failed:", e));
    }, 350);
    return () => clearTimeout(id);
  }, [items]);

  const add = (p, qty = 1) =>
    setItems((prev) => {
      const i = prev.findIndex((x) => x.productId === p.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...prev, { productId: p.id, name: p.name, image: p.image, price: p.price, qty }];
    });

  // alias to support older code calling addItem(item)
  const addItem = (item) =>
    add(
      {
        id: item.id ?? item.productId,
        name: item.name ?? item.title,
        image: item.image ?? item.img,
        price: item.priceCents ?? item.price,
      },
      item.qty ?? 1
    );

  const remove = (id) => setItems((prev) => prev.filter((x) => x.productId !== id));
  const setQty = (id, qty) =>
    setItems((prev) =>
      prev.map((x) => (x.productId === id ? { ...x, qty: Math.max(1, qty) } : x))
    );
  const clear = () => setItems([]);

  const value = useMemo(() => ({ items, add, addItem, remove, setQty, clear }), [items]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
