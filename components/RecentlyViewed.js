"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { getProductsBySlugs } from "@/lib/products";
import { useRecentlyViewed } from "./hooks/useRecentlyViewed";

export default function RecentlyViewed() {
  const { items } = useRecentlyViewed();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchFromLocalStorage = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem("recentlyViewed")) || [];

        if (stored.length === 0) {
          setProducts([]);
          return;
        }

        const data = await getProductsBySlugs(stored);
        setProducts(data);
      } catch (error) {
        toast.error("Failed to load recently viewed products");
      }
    };

    fetchFromLocalStorage();
  }, [items]);

  if (products.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight text-gray-900 mb-5">
        Recently Viewed
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="group rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md hover:border-gray-300"
          >
            <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-50">
              <img
                src={p.image || "/fallback.png"}
                alt={p.name}
                className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="p-4">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">
                {p.name}
              </p>

              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">
                  ${p.price}
                </p>
                <span className="text-xs font-medium text-orange-500 transition group-hover:text-orange-800">
                  View →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
