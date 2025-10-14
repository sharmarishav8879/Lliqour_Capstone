"use client";

import { useCart } from "../app/context/CartProvider";
import { ShoppingCart } from "lucide-react";

export default function CartButton() {
  const { count, setOpen } = useCart();
  return (
    <button
      aria-label="Cart"
      onClick={() => setOpen(true)}
      className="relative inline-flex items-center justify-center"
      title="Cart"
    >
      <span style={{ fontSize: 22 }}>
        <ShoppingCart />
      </span>
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
