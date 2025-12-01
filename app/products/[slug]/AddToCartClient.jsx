"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartProvider";

export default function AddToCartClient({ product }) {
  const [qty, setQty] = useState(1);
  const { addItem, setOpen } = useCart();

  function handleAdd() {
    const n = parseInt(qty, 10) || 1;

    // Normalize to our cart item shape
    addItem(
      {
        id: String(product.id ?? product.slug),
        title: product.name || product.title,
        priceCents: Number(
          product.priceCents ?? (product.price ? product.price * 100 : 0)
        ),
        image: product.image || product.imageUrl || "/fallback.png",
        sku: product.sku ?? product.id ?? product.slug,
      },
      n
    );

    setOpen(true); // open mini-cart so user sees the update
  }

  return (
    <main className="p-4">
      <div className="mt-4 flex items-center gap-2">
        <input
          type="number"
          min="1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="w-16 p-2 bg-neutral-900 text-white border border-neutral-700 rounded-md"
        />

        <button
          onClick={handleAdd}
          className="px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-blue-500 to-blue-400 shadow-md hover:from-blue-600 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          Add to Cart
        </button>
      </div>
    </main>
  );
}
