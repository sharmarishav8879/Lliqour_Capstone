import Link from "next/link";
import AddToCartClient from "./AddToCartClient";
import { getProductBySlug } from "@/lib/products";

//Full Star Icon
import { FaStar } from "react-icons/fa";

//Half Star Icon
import { FaStarHalf } from "react-icons/fa";

//Empty Star Icon
import { FaRegStar } from "react-icons/fa";

export default async function ProductDetail({ params }) {
  const { slug } = await params;

  const productDoc = await getProductBySlug(slug);

  if (!productDoc) {
    return (
      <main className="p-4">
        <h2>Product not found.</h2>
      </main>
    );
  }

  // Star Rating Component
  const StarRating = ({ rating }) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else if (rating >= i - 0.5) {
        stars.push(<FaStarHalf key={i} className="text-yellow-500" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-500" />);
      }
    }

    return <div className="flex mt-1">{stars}</div>;
  };

  // Info Card Component
  function InfoCard({ title, date, description, starScore }) {
    return (
      <div className="p-4 bg-white border rounded-4xl shadow-sm px-5 mt-2 mb-2">
        <p className="font-medium text-black">{title}</p>
        <StarRating rating={starScore} />
        <p className="text-sm text-gray-500">{date}</p>
        {description && (
          <p className="mt-2 text-sm text-gray-700">{description}</p>
        )}
      </div>
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
      {/* reviews section */}
        <section className="w-full max-w-5xl mt-24 p-2">
          <h2 className="text-3xl font-extrabold mb-6">Product Reviews</h2>

          {/* Cards side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard
              title="Amazing product!"
              date="Nov 27, 2025"
              description="Amazing quality and great value for money. Highly recommend to everyone!"
              starScore={4.5}
            />

            <InfoCard
              title="Good stuff"
              date="Nov 20, 2025"
              description="Solid product, would buy again!"
              starScore={4}
            />
          </div>
        </section>
    </main>
  );
}
