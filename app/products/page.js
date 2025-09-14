"use client"; // make this a client component so hooks work

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAllProducts } from "@/lib/products"; // or ../../lib/products if alias not set

export default function ProductsPage() {
  // React state to hold the list we show
  const [items, setItems] = useState([]);

  // Load products once when the page mounts
  useEffect(() => {
    setItems(getAllProducts());
  }, []);

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Products</h1>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>Click a product to view details.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16
        }}
      >
        {items.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            style={{
              border: "1px solid #2a2a2a",
              borderRadius: 12,
              overflow: "hidden",
              textDecoration: "none",
              color: "inherit",
              background: "#111"
            }}
          >
            <img
              src={p.image}
              alt={p.name}
              style={{ width: "100%", height: 160, objectFit: "cover" }}
            />
            <div style={{ padding: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: "#fff" }}>
                {p.name}
              </div>
              <div style={{ fontSize: 12, color: "#ddd" }}>
                {p.size ? `${p.size} • ` : ""}
                {p.abv ? `${p.abv} • ` : ""}
                {p.origin || ""}
              </div>
              <div style={{ marginTop: 8, fontWeight: 800, color: "#fff" }}>
                ${p.price.toFixed(2)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}