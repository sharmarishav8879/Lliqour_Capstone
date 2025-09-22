"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartCtx = createContext(null);
const LS_KEY = "legacy_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {
      console.warn("Cart load failed:", e);
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Cart save failed:", e);
    }
  }, [items]);

  // Actions
  function addItem(item, qty = 1) {
    // item: { id, title, priceCents, image?, sku? }
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
        return copy;
      }
      return [...prev, { ...item, qty }];
    });
    setOpen(true);
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  function updateQty(id, qty) {
    const safe = Math.max(1, Number(qty) || 1);
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: safe } : p)));
  }

  function clearCart() {
    setItems([]);
  }

  // Derived totals
  const { count, subtotalCents } = useMemo(() => {
    let c = 0;
    let s = 0;
    for (const it of items) {
      c += it.qty;
      s += (it.priceCents || 0) * it.qty;
    }
    return { count: c, subtotalCents: s };
  }, [items]);

  const value = {
    items,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    count,
    subtotalCents,
    open,
    setOpen,
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
