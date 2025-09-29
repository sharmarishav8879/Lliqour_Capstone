"use client";

import { useCart } from "../../context/CartProvider"; // from /app/products/[slug] → ../../context

function toCents(v) {
  return Number.isInteger(v) ? v : Math.round(Number(v || 0) * 100);
}

export default function AddToCartClient({ product }) {
  const { add } = useCart();

  function handleAdd() {
    add(
      {
        id: String(product.id ?? product.slug),
        name: product.name ?? product.title ?? "Product",
        image: product.image ?? product.images?.[0] ?? "",
        price: toCents(product.priceCents ?? product.price),
      },
      1
    );
  }

  return (
    <button type="button" className="px-4 py-2 rounded bg-black text-white" onClick={handleAdd}>
      Add to Cart
    </button>
  );
}
