"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/components/hooks/useRecentlyViewed";
import AddToCartClient from "@/app/products/[slug]/AddToCartClient";

export default function ProductDetailClient({ product }) {
  const { addItem } = useRecentlyViewed();

  useEffect(() => {
    if (product?.id) {
      addItem(product.id); // save to localStorage
    }
  }, [product?.id]);

  if (!product) return <p>Product not found</p>;

  return (
    <main className="bg-white min-h-screen pt-40 font-serif flex flex-col items-center text-black">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <div>
          <img
            src={product.image || "/fallback.png"}
            alt={product.name}
            className="w-full h-[420px] object-cover rounded-xl"
          />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold">{product.name}</h1>
          <div className="mt-2 text-2xl font-extrabold">
            ${product.price.toFixed(2)}
          </div>

          {product.category || product.origin || product.abv || product.size ? (
            <ul className="mt-3 space-y-1 leading-relaxed">
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
          ) : null}

          {product.description && <p className="mt-3">{product.description}</p>}

          <AddToCartClient product={product} />
        </div>
      </div>
    </main>
  );
}
