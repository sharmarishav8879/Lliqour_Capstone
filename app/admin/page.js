// app/admin/page.js
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/products";
import Protected from "@/components/protected";
import ManageOffers from "@/adminComponents/manageOffers";

/** single source of truth for the navbar <-> admin sync */
const PREVIEW_LS_KEY = "adminUserPreview"; // "on" | "off"
// (optional) migrate once from your old key if present
const LEGACY_KEY = "admin_preview_user_v1";

function ProductCard({ product, className = "" }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className={`bg-gray-100 border border-gray-300 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 ${className}`}
    >
      <img src={product.image} alt={product.name} className="w-full h-56 object-cover" />
      <div className="p-4 flex flex-col justify-between h-40">
        <div className="font-bold text-lg text-black">{product.name}</div>
        <div className="text-sm text-gray-600 mt-1">
          {product.size ? `${product.size} • ` : ""}
          {product.abv ? `${product.abv} • ` : ""}
          {product.origin || ""}
        </div>
        <div className="mt-2 font-extrabold text-gray-900">${product.price.toFixed(2)}</div>
      </div>
    </Link>
  );
}

/** Small inline “user” toolbar to preview user-facing links without changing routes */
function UserPreviewBar() {
  return (
    <div className="rounded-xl border border-amber-500 bg-amber-50 px-4 py-3">
      <div className="text-sm font-medium mb-2">User dashboard preview (links only)</div>
      <div className="flex flex-wrap gap-2">
        <a href="/#special-offer" className="px-3 py-1 rounded-full bg-white border text-sm hover:bg-gray-50">
          Special Offers
        </a>
        <a href="/#catalogue" className="px-3 py-1 rounded-full bg-white border text-sm hover:bg-gray-50">
          Catalogue
        </a>
        <Link href="/contactUs" className="px-3 py-1 rounded-full bg-white border text-sm hover:bg-gray-50">
          Contact Us
        </Link>
        <Link href="/checkout" className="ml-auto px-3 py-1 rounded-full text-white text-sm" style={{ background: "#ff6a00" }}>
          Go to Checkout
        </Link>
      </div>
      <p className="mt-2 text-xs text-amber-900/80">
        This bar mimics user navigation for demos. It doesn’t alter Admin data or layout.
      </p>
    </div>
  );
}

export default function AdminHome() {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Whisky");
  const [offerProducts, setOfferProducts] = useState([]);

  // Admin preview toggle (synced with Navbar)
  const [viewUser, setViewUser] = useState(false);

  // Load/migrate persisted state and subscribe to changes from Navbar
  useEffect(() => {
    // one-time migration from old key → new key
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy === "1" || legacy === "0") {
      localStorage.setItem(PREVIEW_LS_KEY, legacy === "1" ? "on" : "off");
      localStorage.removeItem(LEGACY_KEY);
    }
    const saved = localStorage.getItem(PREVIEW_LS_KEY);
    setViewUser(saved === "on");

    // react to storage changes (another tab) and the custom event (same tab)
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

  // Local checkbox also writes to the shared key (so Navbar reflects it)
  useEffect(() => {
    localStorage.setItem(PREVIEW_LS_KEY, viewUser ? "on" : "off");
    window.dispatchEvent(new CustomEvent("adminUserPreview", { detail: { on: viewUser } }));
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
      {/* top padding so content never feels “tight” under the sticky navbar */}
      <main className="scroll-smooth font-serif pt-6">
        {/* ======= Admin header row with functional preview toggle ======= */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-end py-3">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
              <span className="font-medium">User dashboard</span>
              <input
                type="checkbox"
                aria-label="Toggle user dashboard preview"
                checked={viewUser}
                onChange={(e) => setViewUser(e.target.checked)}
                className="accent-orange-500"
              />
            </label>
          </div>

          {/* Show a non-invasive “user preview” bar when enabled */}
          {viewUser && (
            <div className="pb-4">
              <UserPreviewBar />
            </div>
          )}
        </div>

        {/* ======= Admin hero ======= */}
        <section className="relative flex items-center h-[70vh] bg-white">
          <div className="w-full h-full relative">
            <Image src="/beerHeader.png" alt="Beer Header" fill className="object-cover" priority />
          </div>

          {/* FIX: correct left alignment */}
          <div className="absolute left-[25%] top-1/2 -translate-y-1/2 text-black max-w-md">
            <h1 className="text-8xl font-bold">Shop Save Enjoy</h1>
          </div>
        </section>

        {/* ======= Special Offers ======= */}
        <section id="special-offer" className="relative flex flex-col items-center min-h-[60vh] bg-white scroll-mt-[80px]">
          <div className="mt-16 bg-gradient-to-r from-orange-400 to-orange-600 px-12 py-6 rounded-3xl shadow-2xl relative inline-block text-center">
            <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-wide">Special Offers</h2>
            <p className="mt-2 text-xl md:text-2xl text-yellow-100 font-semibold">Limited Time Only!</p>
            <div className="bg-gray-50 text-black font-bold py-2 px-4 rounded-full mt-4 hover:bg-gray-300 cursor-pointer">
              <ManageOffers />
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
            {offerProducts.map((product) => (
              <div key={product.docId} className="bg-gray-100 rounded-lg shadow-md overflow-hidden">
                <Image src={product.image} alt={product.name} width={500} height={500} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-black">{product.name}</h3>
                  <p className="text-gray-600">${product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ======= Catalogue ======= */}
        <section id="catalogue" className="min-h-screen flex flex-col items-center bg-white py-25 scroll-mt-[80px]">
          <h2 className="text-7xl font-bold text-black mb-12">Catalogue</h2>

          <nav className="flex flex-wrap justify-center gap-4 relative z-10">
            {["Whisky", "Vodka", "Wine", "Beer", "Rum", "Tequila"].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  activeCategory === category ? "bg-orange-500 text-white shadow-lg" : "bg-gray-200 text-black hover:bg-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </nav>

          {activeCategory && (
            <div className="w-full max-w-6xl">
              <h3 className="text-3xl font-semibold text-black mb-4">{activeCategory}</h3>
              <div className="flex space-x-6 overflow-x-auto py-2 scrollbar-hide">
                {items
                  .filter((p) => p.category === activeCategory)
                  .map((p) => (
                    <ProductCard key={p.id} product={p} className="min-w-[220px]" />
                  ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </Protected>
  );
}
