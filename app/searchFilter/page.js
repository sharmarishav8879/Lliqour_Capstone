"use client";
import { useState } from "react";
import { getAllProducts } from "../../lib/products";

export default function SearchFilter() {
  const [filter, setFilter] = useState("");

  const filteredProducts = getAllProducts().filter((product) =>
    product.name.toLowerCase().includes(filter.toLowerCase())
  );
  return (
    <main>
      <h1 className="text-4xl font-bold mt-4 text-orange-500 font-serif flex justify-center">
        Search Products
      </h1>
      <div className="flex flex-col items-center justify-center font-serif p-6">
        <input
          type="text"
          placeholder="Search products..."
          className="border border-gray-300 rounded p-2 w-1/2 mt-4"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 ">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="flex flex-col items-center justify-center font-serif p-6 bg-black rounded-lg"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-64 h-64 object-cover rounded"
              />
              <h2 className="text-2xl font-bold mt-4 text-white font-serif">
                {product.name}
              </h2>
              <div className="flex flex-row items-center justify-center font-serif p-2 gap-9">
                <p className="text-lg text-white">ABV: {product.abv}</p>

                <p className="text-lg text-white">{product.size}</p>
              </div>
              <p className="text-lg text-orange-500">${product.price}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-orange-500">No products found.</p>
        )}
      </div>
    </main>
  );
}
