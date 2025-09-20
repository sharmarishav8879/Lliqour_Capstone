"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";

export default function AddToCartClient({ product }) {
  // quantity state for the input
  const [qty, setQty] = useState(1);

  function handleAdd() {
    const n = parseInt(qty, 10) || 1;     // make sure it's a number
    addToCart(product, n);                 // save to localStorage
    alert(`${n} × ${product.name} added to cart`);
  }

  return (
    <div>
      <p
      className="absolute top-40 left-15 text-sm"><a 
      className="text-orange-500 underline text-2xl"
      href="/">Back</a></p>
      <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
      <input
        type="number"
        min="1"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        style={{ width: 72, padding: 8, background: "#0e0e0e", color: "#fff",
                 border: "1px solid #2a2a2a", borderRadius: 8 }}
      />
      <button
        onClick={handleAdd}
        style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #3a3a3a",
                 background: "#1f6feb", color: "#fff", fontWeight: 700, cursor: "pointer" }}
      >
        Add to cart
      </button>
    </div></div>
    
  );
}