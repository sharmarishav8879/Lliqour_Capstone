import Link from "next/link";
import AddToCartClient from "./AddToCartClient";
import { getProductBySlug } from "@/lib/products";

export default async function ProductDetail({ params }) {
  const { slug } = params;

  const productDoc = await getProductBySlug(slug);

  if (!productDoc) {
    return (
      <main className="p-4">
        <h2>Product not found.</h2>
      </main>
    );
  }

  const product = {
    id: productDoc.id,
    name: productDoc.name,
    price: productDoc.price,
    image: productDoc.image || productDoc.imageUrl || "/fallback.png",
    slug: productDoc.slug,
    category: productDoc.category,
    size: productDoc.size,
    abv: productDoc.abv,
    origin: productDoc.origin,
    description: productDoc.description,
    discount: productDoc.discount,
    createdAt: productDoc.createdAt?.toDate?.()?.toISOString() || null,
  };

  return (
    <main className="bg-white min-h-screen pt-40 font-serif flex flex-col items-center text-black">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <div>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-[420px] object-cover rounded-xl"
          />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold">{product.name}</h1>
          <div className="mt-2 text-2xl font-extrabold">
            ${product.price.toFixed(2)}
          </div>

          {product.category && (
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
          )}

          {product.description && <p className="mt-3">{product.description}</p>}

          <AddToCartClient product={product} />
        </div>
      </div>
    </main>
  );
}
