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
        console.log("Local storage Ids:", stored);
        if (stored.length === 0) {
          setProducts([]);
          return;
        }

        const data = await getProductsBySlugs(stored);
        setProducts(data);
      } catch (error) {
        console.error("Error loading recently viewed:", error);
        toast.error("Failed to load recently viewed products");
      }
    };

    fetchFromLocalStorage();
  }, [items]);

  if (products.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-3">Recently Viewed</h2>

      <div className="grid grid-cols-2 gap-4">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="border p-2 rounded shadow-sm bg-white"
          >
            <img
              src={p.image || "/fallback.png"}
              alt={p.name}
              className="h-24 w-full object-cover rounded"
            />
            <p className="mt-1 font-medium">{p.name}</p>
            <p className="text-sm text-gray-500">${p.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
