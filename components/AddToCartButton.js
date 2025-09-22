"use client";

import { useCart } from "@/context/CartProvider";

export default function AddToCartButton({ product, qty = 1 }) {
  const { addItem } = useCart();
  return (
    <button
      onClick={() =>
        addItem(
          {
            id: String(product.id ?? product.slug),
            title: product.title || product.name,
            priceCents: Number(product.priceCents ?? (product.price ? product.price * 100 : 0)),
            image: product.image || product.imageUrl,
            sku: product.sku,
          },
          qty
        )
      }
      className="px-4 py-2 rounded text-white"
      style={{ background: "#ff6a00" }}
    >
      Add to Cart
    </button>
  );
}