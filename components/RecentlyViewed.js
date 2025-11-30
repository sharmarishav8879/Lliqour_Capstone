" use client";

import { useEffect, useState } from "react";
import { useRecentlyViewed } from "./hooks/useRecentlyViewed";
import { getProductsByIds } from "@/lib/products";
import toast from "react-hot-toast";

export default function RecentlyViewed() {
  const { items } = useRecentlyViewed();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!items || items.length === 0) {
        setProducts([]);
        return;
      }

      try {
        const data = await getProductsByIds(items);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching recently viewed products:", error);
        toast.error("Failed to load recently viewed products");
      }
    };

    fetchProducts();
  }, [items]);

  if (products.length === 0) {
    return null;
  }

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
