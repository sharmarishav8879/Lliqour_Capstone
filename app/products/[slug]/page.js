"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import AddToCartClient from "./AddToCartClient";
import AddReview, { InfoCard } from "@/components/addReview";
import { FiPlus } from "react-icons/fi";

export default function ProductDetailClient() {
  const pathname = usePathname();
  const slug = pathname.split("/").pop();

  const [productDoc, setProductDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addReview, setAddReview] = useState(false);
  const [reviews, setReviews] = useState([]);

  // Fetch product data
  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        const product = await getProductBySlug(slug);
        setProductDoc(product);
        setReviews(product.reviews || []);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) return <p>Loading...</p>;
  if (!productDoc) return <p>Product not found.</p>;

  return (
    <main className="bg-white min-h-screen pt-10 font-serif flex flex-col items-center text-black">
      {/* Product Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 w-full max-w-5xl">
        <div>
          <img
            src={productDoc.image || "/fallback.png"}
            alt={productDoc.name}
            className="w-full h-[420px] object-cover rounded-xl"
          />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold">{productDoc.name}</h1>
          <div className="mt-2 text-2xl font-extrabold">
            ${Number(productDoc.price).toFixed(2)}
          </div>

          <ul className="mt-3 space-y-1 leading-relaxed">
            {productDoc.category && <li><strong>Category:</strong> {productDoc.category}</li>}
            {productDoc.origin && <li><strong>Origin:</strong> {productDoc.origin}</li>}
            {productDoc.abv && <li><strong>ABV:</strong> {productDoc.abv}</li>}
            {productDoc.size && <li><strong>Size:</strong> {productDoc.size}</li>}
            {productDoc.discount && <li><strong>Discount:</strong> {productDoc.discount}%</li>}
            {productDoc.createdAt && (
              <li>
                <strong>Added:</strong> {new Date(productDoc.createdAt).toLocaleDateString()}
              </li>
            )}
          </ul>

          {productDoc.description && <p className="mt-3">{productDoc.description}</p>}

          <AddToCartClient product={productDoc} />
        </div>
      </div>

      {/* Reviews Section */}
      <section className="w-full max-w-5xl mt-24 p-2">
        <div className="flex items-center justify-between mb-6 border-b pb-2">
          <h2 className="text-3xl font-extrabold">Product Reviews</h2>

          <button
            className="w-10 h-10 rounded-full flex items-center justify-center font-medium text-white bg-gradient-to-r from-orange-500 to-amber-400 shadow-md hover:from-orange-600 hover:to-amber-500 transition-all duration-300 transform hover:scale-105 active:scale-95"
            onClick={() => setAddReview(true)}
          >
            <FiPlus size={20} />
          </button>
        </div>

        {/* AddReview Modal */}
        {addReview && (
          <AddReview
            productId={productDoc.id}
            onClose={() => setAddReview(false)}
            onAdded={(newReview) => setReviews([newReview, ...reviews])}
          />
        )}

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {reviews.map((r) => (
            <InfoCard
              key={r.id}
              title={r.title}
              date={r.date}
              description={r.description}
              starScore={r.starScore}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
