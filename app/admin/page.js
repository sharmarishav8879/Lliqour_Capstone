"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/products";
import Protected from "@/components/protected";
import ManageOffers from "@/adminComponents/manageOffers";
import { useTheme } from "@/components/ThemeToggle";

const PREVIEW_LS_KEY = "adminUserPreview";
const LEGACY_KEY = "admin_preview_user_v1";

function ProductCard({ product, className = "" }) {
  const { theme } = useTheme();
  return (
    <Link
      href={`/products/${product.slug}`}
      className={`rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 ${className} ${
        theme === "light"
          ? "bg-white border border-gray-300"
          : "bg-gray-800 border border-gray-700 text-white"
      }`}
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-56 object-cover"
      />
      <div className="p-4 flex flex-col justify-between h-40">
        <div
          className={`font-bold text-lg ${
            theme === "light" ? "text-black" : "text-white"
          }`}
        >
          {product.name}
        </div>
        <div
          className={`text-sm mt-1 ${
            theme === "light" ? "text-gray-900" : "text-gray-300"
          }`}
        >
          {product.size ? `${product.size} • ` : ""}
          {product.abv ? `${product.abv} • ` : ""}
          {product.origin || ""}
        </div>
        <div
          className={`mt-2 font-extrabold ${
            theme === "light" ? "text-gray-900" : "text-white"
          }`}
        >
          ${product.price.toFixed(2)}
        </div>
      </div>
    </Link>
  );
}

function UserPreviewBar() {
  const { theme } = useTheme();
  return (
    <div
      className={`rounded-xl border border-orange-400 px-4 py-3 shadow-lg ${
        theme === "light"
          ? "bg-orange-50 text-black"
          : "bg-orange-900/40 text-white"
      }`}
    >
      <div className="text-sm font-medium mb-2">
        User dashboard preview (links only)
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href="/#special-offer"
          className={`px-3 py-1 rounded-full border text-sm ${
            theme === "light"
              ? "bg-white hover:bg-gray-100 text-black"
              : "bg-gray-800 hover:bg-gray-700 text-white"
          }`}
        >
          Special Offers
        </a>
        <a
          href="/#catalogue"
          className={`px-3 py-1 rounded-full border text-sm ${
            theme === "light"
              ? "bg-white hover:bg-gray-100 text-black"
              : "bg-gray-800 hover:bg-gray-700 text-white"
          }`}
        >
          Catalogue
        </a>
        <Link
          href="/contactUs"
          className={`px-3 py-1 rounded-full border text-sm ${
            theme === "light"
              ? "bg-white hover:bg-gray-100 text-black"
              : "bg-gray-800 hover:bg-gray-700 text-white"
          }`}
        >
          Contact Us
        </Link>
        <Link
          href="/checkout"
          className="ml-auto px-3 py-1 rounded-full text-white text-sm bg-orange-600 hover:bg-orange-700"
        >
          Go to Checkout
        </Link>
      </div>
      <p className="mt-2 text-xs text-orange-900/80">
        This bar mimics user navigation for demos. It does not alter Admin data
        or layout.
      </p>
    </div>
  );
}

export default function AdminHome() {
  const { theme } = useTheme();
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Whisky");
  const [offerProducts, setOfferProducts] = useState([]);
  const [viewUser, setViewUser] = useState(false);

  useEffect(() => {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy === "1" || legacy === "0") {
      localStorage.setItem(PREVIEW_LS_KEY, legacy === "1" ? "on" : "off");
      localStorage.removeItem(LEGACY_KEY);
    }

    const saved = localStorage.getItem(PREVIEW_LS_KEY);
    setViewUser(saved === "on");

    const onStorage = (e) => {
      if (e.key === PREVIEW_LS_KEY) setViewUser(e.newValue === "on");
    };
    const onCustom = (e) => setViewUser(!!e.detail?.on);

    window.addEventListener("storage", onStorage);
    window.addEventListener("adminUserPreview", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("adminUserPreview", onCustom);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(PREVIEW_LS_KEY, viewUser ? "on" : "off");
    window.dispatchEvent(
      new CustomEvent("adminUserPreview", { detail: { on: viewUser } })
    );
  }, [viewUser]);

  useEffect(() => {
    (async () => {
      try {
        const products = await getAllProducts();
        setItems(Array.isArray(products) ? products : []);
      } catch {
        setItems([]);
      }
    })();
  }, []);

  useEffect(() => {
    const storedOfferProducts = localStorage.getItem("offerProducts");
    if (storedOfferProducts) {
      try {
        setOfferProducts(JSON.parse(storedOfferProducts));
      } catch {
        setOfferProducts([]);
      }
    }
  }, []);

  return (
    <Protected requiredRole="admin">
      <main
        className={`scroll-smooth font-serif pt-6 ${
          theme === "light" ? "bg-white" : "bg-gray-900"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-end py-3">
            <label
              className={`flex items-center gap-2 cursor-pointer select-none text-sm ${
                theme === "light" ? "text-black" : "text-white"
              }`}
            >
              <span className="font-medium">User dashboard</span>
              <input
                type="checkbox"
                checked={viewUser}
                onChange={(e) => setViewUser(e.target.checked)}
                className="accent-orange-500"
              />
            </label>
          </div>
          {viewUser && (
            <div className="pb-4">
              <UserPreviewBar />
            </div>
          )}
        </div>

        {/* Header */}
        <section className="relative flex items-center h-[70vh]">
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
            className={`absolute left-[25%] top-1/2 -translate-y-1/2 max-w-md ${
              theme === "light" ? "text-gray-900" : "text-white"
            }`}
          >
            <h1 className="text-8xl font-bold">Shop Save Enjoy</h1>
          </div>
        </section>

        {/* Special Offers */}
        <section
          id="special-offer"
          className={`relative flex flex-col items-center min-h-[60vh] scroll-mt-[80px] ${
            theme === "light" ? "bg-white" : "bg-gray-900"
          }`}
        >
          <div className="mt-16 bg-gradient-to-r from-orange-400 to-orange-600 px-12 py-6 rounded-3xl shadow-2xl text-center">
            <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-wide">
              Special Offers
            </h2>
            <p className="mt-2 text-xl md:text-2xl text-yellow-100 font-semibold">
              Limited Time Only!
            </p>
            <div
              className={`py-2 px-4 rounded-full mt-4 shadow cursor-pointer font-bold ${
                theme === "light"
                  ? "bg-white text-black hover:bg-gray-100"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              <ManageOffers />
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
            {offerProducts.map((product) => (
              <div
                key={product.docId}
                className={`rounded-lg shadow-md overflow-hidden border p-0 ${
                  theme === "light"
                    ? "bg-white border-gray-300"
                    : "bg-gray-800 border-gray-700 text-white"
                }`}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  width={500}
                  height={500}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3
                    className={`text-lg font-semibold ${
                      theme === "light" ? "text-black" : "text-white"
                    }`}
                  >
                    {product.name}
                  </h3>
                  <p
                    className={`font-bold ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Catalogue */}
        <section
          id="catalogue"
          className={`min-h-screen flex flex-col items-center py-25 scroll-mt-[80px] ${
            theme === "light" ? "bg-white" : "bg-gray-900"
          }`}
        >
          <h2
            className={`text-7xl font-bold mb-12 ${
              theme === "light" ? "text-black" : "text-white"
            }`}
          >
            Catalogue
          </h2>

          <nav className="flex flex-wrap justify-center gap-4 relative z-10">
            {["Whisky", "Vodka", "Wine", "Beer", "Rum", "Tequila"].map(
              (category) => (
                <button
                  key={category}
                  onClick={() =>
                    setActiveCategory(
                      activeCategory === category ? null : category
                    )
                  }
                  className={`px-6 py-2 rounded-full font-semibold transition ${
                    activeCategory === category
                      ? "bg-orange-500 text-white shadow-lg"
                      : theme === "light"
                      ? "bg-gray-200 text-black hover:bg-gray-300"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  {category}
                </button>
              )
            )}
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
    </Protected>
  );
}
