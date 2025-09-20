"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/products";

export default function Home() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const products = getAllProducts();
    if (Array.isArray(products)) {
      setItems(products);
    } else {
      console.warn("getAllProducts did not return an array");
      setItems([]);
    }
  }, []);

  return (
    <main className="scroll-smooth font-serif mt-8">
      <section className="relative flex items-center h-[60vh] bg-gray-100">
        <div className="w-full h-full relative">
          <Image
            src="/beerHeader.png"
            alt="Beer Header"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="absolute left-[25%] top-[60%] transform -translate-y-1/2 text-black max-w-md">
          <h1 className="text-8xl font-bold">Shop Save Enjoy</h1>
        </div>
      </section>

      <section
        id="special-offer"
        className="relative flex flex-col items-center h-[80vh] bg-white"
      >
        <div className="mt-16 bg-gradient-to-r from-orange-400 to-orange-600 px-12 py-6 rounded-3xl shadow-2xl relative inline-block text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-wide">
            Special Offers
          </h2>
          <p className="mt-2 text-xl md:text-2xl text-yellow-100 font-semibold">
            Limited Time Only!
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {items.slice(0, 3).map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="bg-gray-100 border border-gray-300 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-56 object-cover"
              />
              <div className="p-4">
                <div className="font-bold text-lg text-black">{p.name}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {p.size ? `${p.size} • ` : ""}
                  {p.abv ? `${p.abv} • ` : ""}
                  {p.origin || ""}
                </div>
                <div className="mt-2 font-extrabold text-gray-900">
                  ${p.price.toFixed(2)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="catalogue"
        className="min-h-screen flex flex-col items-center justify-start bg-white py-12"
      >
        <h2 className="text-5xl font-bold text-black mb-8">Catalogue</h2>

        {["Whisky", "Vodka", "Wine"].map((category) => {
          const categoryItems = items.filter((p) => p.category === category);

          return (
            <div key={category} className="w-full max-w-6xl mb-8">
              <h3 className="text-3xl font-semibold text-black mb-4">
                {category}
              </h3>

              <div className="flex space-x-6 overflow-x-auto py-2 scrollbar-hide">
                {categoryItems.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className="min-w-[220px] bg-gray-100 border border-gray-300 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-56 object-cover"
                    />
                    <div className="p-4">
                      <div className="font-bold text-lg text-black">
                        {p.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {p.size ? `${p.size} • ` : ""}
                        {p.abv ? `${p.abv} • ` : ""}
                        {p.origin || ""}
                      </div>
                      <div className="mt-2 font-extrabold text-black">
                        ${p.price.toFixed(2)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
