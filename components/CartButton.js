"use client";

import { useCart } from "../app/context/CartProvider";

export default function CartButton({ setOpen }) {
  const { items = [] } = useCart();
  const count = items.reduce((sum, i) => sum + (i.qty || 0), 0);

  return (
    <button
      type="button"
      aria-label="Cart"
      title="Cart"
      onClick={() => setOpen && setOpen(true)}
      className="relative inline-flex items-center justify-center"
    >
      <span style={{ fontSize: 22 }}>🛒</span>
      {count > 0 && (
        <span
          className="absolute -top-2 -right-2 rounded-full text-white text-xs px-1.5"
          style={{ background: "#ff6a00" }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
