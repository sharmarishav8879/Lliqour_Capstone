"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useUserAuth } from "../auth/_util/auth-context";
import { db } from "../auth/_util/firebase";
import { HiOutlineCog } from "react-icons/hi";
import Link from "next/link";
import { getAllProducts } from "@/lib/products";

export default function Profile() {
  const { user, loading: authLoading, firebaseSignOut } = useUserAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [items, setItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const categories = ["Whisky", "Vodka", "Wine", "Beer", "Rum", "Tequila"];

  const handleSignOut = async () => {
    try {
      await firebaseSignOut();
      router.push("/auth/login");
    } catch (error) {
      alert("Error signing out: " + error.message);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setName(userData.name);
          setRole(userData.role || "user");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchProducts = async () => {
      try {
        const products = await getAllProducts();
        if (Array.isArray(products)) setItems(products);
        else setItems([]);
      } catch (error) {
        console.error("Error fetching products:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchProducts();
  }, [user, authLoading, router]);

  function InfoCard({ title, date, subtitleLabel = "Placed on" }) {
    return (
      <div className="p-4 bg-white border rounded-4xl shadow-sm px-5 mt-2 mb-2">
        <p className="font-medium text-black">{title}</p>
        <p className="text-sm text-gray-500">
          {subtitleLabel}: {date}
        </p>
      </div>
    );
  }

  function ProductCard({ product, className = "" }) {
    return (
      <Link
        href={`/products/${product.slug}`}
        className={`bg-gray-100 border border-gray-300 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 ${className}`}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-56 object-cover"
        />
        <div className="p-4 flex flex-col justify-between h-40">
          <div className="font-bold text-lg text-black">{product.name}</div>
          <div className="text-sm text-gray-600 mt-1">
            {product.size ? `${product.size} • ` : ""}
            {product.abv ? `${product.abv} • ` : ""}
            {product.origin || ""}
          </div>
          <div className="mt-2 font-extrabold text-gray-900">
            ${product.price.toFixed(2)}
          </div>
        </div>
      </Link>
    );
  }

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen flex flex-col items-center justify-start px-4 pt-40 font-serif">
      <div className="w-full max-w-md bg-gray-50 rounded-2xl shadow-lg p-6 flex flex-col gap-6">
        {user && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-300 rounded-full overflow-hidden"></div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-black">
                  {name || "No Name"}
                </h1>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <button
                onClick={handleSignOut}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-4xl transition duration-300"
              >
                Sign Out
              </button>
              <button
                onClick={() => router.push("/account/settings")}
                className="mt-2 flex items-center gap-2 text-gray-600 hover:text-black transition duration-300"
              >
                <HiOutlineCog size={24} />
              </button>
            </div>
          </div>
        )}

        {role === "user" && (
          <>
            <div className="flex flex-col gap-4 mt-6">
              <h2 className="text-2xl font-semibold text-black border-b pb-2">
                Current Orders
              </h2>
              <InfoCard
                title="Order #12345"
                date="2025-09-01"
                subtitleLabel="Placed on"
              />
              <InfoCard
                title="Order #12346"
                date="2025-09-05"
                subtitleLabel="Placed on"
              />
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <h2 className="text-2xl font-semibold text-black border-b pb-2">
                Order History
              </h2>
              <InfoCard
                title="Order #12344"
                date="2025-08-20"
                subtitleLabel="Placed on"
              />
              <InfoCard
                title="Status: Delivered"
                date="2025-08-25"
                subtitleLabel="Delivered on"
              />
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <h2 className="text-2xl font-semibold text-black border-b pb-2">
                Support Tickets
              </h2>
              <InfoCard
                title="Order Issue"
                date="2025-09-01"
                subtitleLabel="Opened on"
              />
              <InfoCard
                title="Status: In Progress"
                date="2025-09-02"
                subtitleLabel="Last Updated"
              />
            </div>
          </>
        )}

        {role === "admin" && (
          <div className="flex flex-col gap-4 mt-6 relative">
            <h2 className="text-2xl font-semibold text-black border-b border-black pb-2">
              Catalogue
            </h2>

            <div className="absolute -right-6 w-40">
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="px-4 py-1 bg-gray-200 text-black rounded-full font-semibold flex justify-center items-center shadow w-25"
              >
                {activeCategory || "All"}
              </button>

              {showDropdown && (
                <div className="absolute mt-2 w-full bg-white text-black font-semibold rounded-lg shadow-lg z-20">
                  <button
                    onClick={() => {
                      setActiveCategory(null);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-orange-500 rounded-lg"
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setActiveCategory(category);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-orange-500 rounded-lg"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full max-w-6xl flex flex-col gap-6 mt-6">
              <div className="flex gap-6 overflow-x-auto py-2 scrollbar-hide">
                {items
                  .filter((product) =>
                    activeCategory ? product.category === activeCategory : true
                  )
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      className="min-w-[220px]"
                    />
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
