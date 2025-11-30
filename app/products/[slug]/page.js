// app/products/[slug]/page.js
import { getProductBySlug } from "@/lib/products";
import ProductDetailClient from "@/components/ProductDetailClient";

export default async function ProductDetailPage({ params }) {
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

  return <ProductDetailClient product={product} />;
}
