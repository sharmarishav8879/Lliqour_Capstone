import Link from "next/link";
import AddToCartClient from "./AddToCartClient";
import { getProductBySlug } from "@/lib/products";

// Server Component (async is OK here)
export default async function ProductDetail({ params }) {
  // In Next 15, params is a Promise in server components
  const { slug } = await params;

  // Get the product from our simple "DB"
  const product = getProductBySlug(slug);

  // If nothing found, show a simple message
  if (!product) {
    return (
      <main style={{ padding: 16 }}>
        <h2>Product not found.</h2>
      </main>
    );
  }

  return (
    <main
      style={{ maxWidth: 1000, margin: "0 auto", padding: 16, color: "#fff" }}
    >
      <p style={{ marginBottom: 12, marginTop: 100 }}>
        <Link href="/products" style={{ color: "#7aa2ff" }}>
          ← Back to Products
        </Link>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: "100%",
              height: 420,
              objectFit: "cover",
              borderRadius: 12,
              border: "1px solid #2a2a2a",
            }}
          />
        </div>

        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800 }}>{product.name}</h1>
          <div style={{ marginTop: 8, fontSize: 22, fontWeight: 800 }}>
            ${product.price.toFixed(2)}
          </div>

          {/* If you kept extra fields, render them safely */}
          {product.category && (
            <ul style={{ marginTop: 12, lineHeight: 1.7, color: "#ddd" }}>
              {product.category && (
                <li>
                  <strong>Category:</strong> {product.category}
                </li>
              )}
              {product.origin && (
                <li>
                  <strong>Origin:</strong> {product.origin}
                </li>
              )}
              {product.abv && (
                <li>
                  <strong>ABV:</strong> {product.abv}
                </li>
              )}
              {product.size && (
                <li>
                  <strong>Size:</strong> {product.size}
                </li>
              )}
            </ul>
          )}

          {product.description && (
            <p style={{ marginTop: 12, color: "#ddd" }}>
              {product.description}
            </p>
          )}

          {/* Client child handles state + localStorage */}
          <AddToCartClient product={product} />
        </div>
      </div>
    </main>
  );
}
