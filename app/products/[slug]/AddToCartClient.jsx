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
    <div>
      {/* Back link */}
      <p className="absolute top-40 left-4 text-sm">
        <Link className="text-orange-500 underline text-2xl" href="/">
          Back
        </Link>
      </p>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <input
          type="number"
          min="1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          style={{
            width: 72,
            padding: 8,
            background: "#0e0e0e",
            color: "#fff",
            border: "1px solid #2a2a2a",
            borderRadius: 8,
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #3a3a3a",
            background: "#1f6feb",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
