"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/products";
import { useTheme } from "@/components/ThemeToggle";
import toast from "react-hot-toast";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "./auth/_util/firebase";
import RotatingBanner from "@/components/RotatingBanner";
import OfferCountdown from "@/components/OfferCountdown";
import FoodPairing from "@/components/FoodPairing";
import RecentlyViewed from "@/components/RecentlyViewed";

function ProductCard({ product, className = "" }) {
  const { theme } = useTheme();
  return (
    <Link
      href={`/products/${product.slug}`}
      className={`rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 ${className} 
       ${
         theme === "light"
           ? "bg-white border border-gray-300"
           : "bg-gray-800 border border-gray-700"
       }`}
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-56 object-cover"
      />
      <div className="p-4 flex flex-col justify-between h-40">
        <div className="font-bold text-lg text-black">{product.name}</div>
        <div className="text-sm text-gray-900 mt-1">
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

function OfferProductCard({ product }) {
  const { theme } = useTheme();
  return (
    <Link
      href={`/products/${product.slug}`}
      className={`rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow 
        ${
          theme === "light"
            ? "bg-white border border-gray-300"
            : "bg-gray-800 border border-gray-700"
        }`}
    >
      <Image
        src={product.image}
        alt={product.name}
        width={500}
        height={500}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 flex flex-col justify-between h-40">
        <div className="font-bold text-lg text-gray-900">{product.name}</div>
        <div className="text-sm text-gray-900 mt-1">
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

export default function Home() {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Whisky");
  const [offerProducts, setOfferProducts] = useState([]);
  const { theme } = useTheme();
  const [banner, setBanner] = useState([] || null);
  const [expiryDate, setExpiryDate] = useState("");

  const categories = ["Whisky", "Vodka", "Wine", "Beer", "Rum", "Tequila"];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getAllProducts();
        if (Array.isArray(products)) {
          setItems(products);
        } else {
          console.warn("getAllProducts did not return an array");
          setItems([]);
        }
      } catch (error) {
        alert(`Error fetching products:  ${error.message}`);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchBanner = async () => {
      if (!banner) {
        toast.error("No banner found");
        return;
      }
      try {
        const querySnapShot = await getDocs(collection(db, "announcements"));
        const allBanners = querySnapShot.docs.map((doc) => doc.data());
        const filterBanner = allBanners.filter((a) => a.type === "banner");
        const filterExpiryDate = allBanners.find((a) => a.expiryDate);
        setExpiryDate(filterExpiryDate ? filterExpiryDate.expiryDate : null);
        setBanner(filterBanner);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch banners");
      }
    };
    fetchBanner();
  }, []);

  useEffect(() => {
    const storedOfferProducts = localStorage.getItem("offerProducts");
    if (storedOfferProducts) {
      setOfferProducts(JSON.parse(storedOfferProducts));
    } else {
      setOfferProducts([
        {
          id: 1,
          name: "Macallan 12 Year",
          slug: "macallan-12",
          description:
            "A rich and smooth single malt whisky with notes of dried fruit and spice.",

          size: "750ml",
          image: "/placeholderProduct.jpg",
          abv: "40%",
          origin: "Scotland",
          price: 99.99,
        },
        {
          id: 2,
          name: "Grey Goose Vodka",
          slug: "grey-goose",
          description:
            "A smooth and creamy vodka with notes of citrus and tropical fruits.",

          size: "750ml",
          image: "/placeholderProduct.jpg",
          abv: "40%",
          origin: "United States",
          price: 49.99,
        },
        {
          id: 3,
          name: "Chateau Margaux 2015",
          slug: "chateau-margaux-2015",
          description:
            "A full-bodied red wine with notes of blackberry, plum, and oak.",

          size: "750ml",
          image: "/placeholderProduct.jpg",
          abv: "40%",
          origin: "France",
          price: 79.99,
        },
      ]);
    }
  }, []);

  return (
    <main className="scroll-smooth font-serif">
      {banner.length > 0 && (
        <div
          className={`absolute ${
            theme == "light"
              ? " border border-gray-950"
              : "border border-gray-300"
          } top-25 left-20 transform -translate-x-1/2 z-50 w-30 shadow-lg rounded-lg overflow-hidden`}
        >
          <RotatingBanner banner={banner} />
        </div>
      )}
      <section className="relative flex items-center h-[50vh]">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/beerHeader.png"
            alt="Beer Header"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        <div
          className={`absolute left-[25%] top-[60%] transform -translate-y-1/2 max-w-md
        ${theme === "light" ? "text-black" : "text-gray-950"}`}
        >
          <h1 className="text-8xl font-bold">Shop Save Enjoy</h1>
        </div>
      </section>

      <section
        id="special-offer"
        className={`relative flex flex-col items-center h-[80vh] scroll-mt-[80px] 
      ${theme === "light" ? "bg-white" : "bg-gray-900"}`}
      >
        <div className="mt-16 bg-gradient-to-r from-orange-400 to-orange-600 px-12 py-6 rounded-3xl shadow-2xl relative inline-block text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-wide">
            Special Offers
          </h2>
          <p className="mt-2 text-xl md:text-2xl text-yellow-100 font-semibold">
            Limited Time Only!
          </p>
          {expiryDate && <OfferCountdown expiryDate={expiryDate} />}
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {offerProducts.map((product) => (
            <OfferProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section
        id="catalogue"
        className={`min-h-screen flex flex-col items-center py-25 scroll-mt-[80px] 
      ${theme === "light" ? "bg-white" : "bg-gray-900"}`}
      >
        <h2
          className={`text-7xl font-bold mb-12 ${
            theme === "light" ? "text-black" : "text-white"
          }`}
        >
          Catalogue
        </h2>
        <RecentlyViewed />
        <div>
          <h2
            className={`text-4xl font-bold mb-12 ${
              theme === "light" ? "text-black" : "text-white"
            }`}
          >
            Food Pairing Recommendations
          </h2>
          <div className="w-full max-w-6xl mb-12 flex justify-center">
            <FoodPairing />
          </div>
        </div>

        <nav className="flex flex-wrap justify-center gap-4 relative z-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() =>
                setActiveCategory(activeCategory === category ? null : category)
              }
              className={`px-6 py-2 rounded-full font-semibold transition
            ${
              activeCategory === category
                ? "px-6 py-2.5 rounded-full font-medium text-white bg-gradient-to-r from-orange-500 to-amber-400 shadow-md hover:from-orange-600 hover:to-amber-500 transition-all duration-300 transform hover:scale-105 active:scale-95"
                : theme === "light"
                ? "bg-gray-200 text-black hover:bg-gray-300"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
            >
              {category}
            </button>
          ))}
        </nav>

        {activeCategory && (
          <div className="w-full max-w-6xl">
            <h3
              className={`text-3xl font-semibold mb-4 ${
                theme === "light" ? "text-black" : "text-white"
              }`}
            >
              {activeCategory}
            </h3>
            <div className="flex space-x-6 overflow-x-auto py-2 scrollbar-hide">
              {items
                .filter((p) => p.category === activeCategory)
                .map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    className="min-w-[220px]"
                  />
                ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
