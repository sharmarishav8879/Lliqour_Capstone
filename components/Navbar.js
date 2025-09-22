"use client";

import Image from "next/image";
import { HiOutlineUser, HiOutlineShoppingCart } from "react-icons/hi2";
import { HiOutlineSearch } from "react-icons/hi";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllProducts } from "@/lib/products";

export default function Navbar() {
  const [filter, setFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [order, setOrder] = useState("asc");
  const [filterProducts, setFilterProducts] = useState([]);

  const handleOrderType = () => {
    setOrder(order === "asc" ? "desc" : "asc");
  };

  useEffect(() => {
    const filteredProducts = getAllProducts().filter((product) =>
      product.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (order === "asc") {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else {
      filteredProducts.sort((a, b) => b.price - a.price);
    }
    setFilterProducts(filteredProducts);
  }, [filter, order]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  useEffect(() => {
    if (filter !== "") {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [filter]);

  return (
    <nav className="bg-white py-6 px-6 fixed top-0 left-0 w-full shadow-md z-50">
      {filter !== "" && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 top-[135px] left-0 w-full h-screen bg-black/30 flex items-start justify-center font-serif p-6"
        >
          <div className="bg-white max-h-[80vh] overflow-y-auto rounded-2xl shadow-lg p-6">
            <div>
              <select
                value={order}
                onChange={handleOrderType}
                className="mb-4 align-bottom p-2 border border-gray-300 rounded text-orange-500 font-serif"
              >
                <option disabled>Sort by</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 ">
              {filterProducts.length > 0 ? (
                filterProducts.map((product) => (
                  <Link
                    href={`/products/${product.slug}`}
                    key={product.id}
                    className={`bg-gray-100 border border-gray-300 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 `}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-56 object-cover"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="p-4 flex flex-col justify-between h-40">
                      <div className="font-bold text-lg text-black">
                        {product.name}
                      </div>
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
                ))
              ) : (
                <p className="text-center text-orange-500 text-lg">
                  No products found.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navbar Content */}
      <div className="flex items-center justify-between">
        <div className="flex items-center pl-50">
          <Image
            src="/Logo.jpg"
            className="border-orange-500 border-2 rounded-full"
            alt="Legacy Liquor Logo"
            width={50}
            height={50}
          />
          <span className="ml-3 text-black text-2xl font-bold font-serif">
            Legacy Liquor
          </span>
        </div>

        <div>
          <ul className="flex space-x-10 text-orange-500 text-xl font-serif">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <a href="/#special-offer">Special Offers</a>
            </li>
            <li>
              <a href="/#catalogue">Catalogue</a>
            </li>
            <li>
              <Link href="/products">Products</Link>
            </li>
            <li>
              <Link href="/contactUs">Contact Us</Link>
            </li>
          </ul>

          {/* Search Bar */}
          <div className="flex flex-row items-center gap-5 border text-black border-gray-300 rounded p-2 mt-4">
            <HiOutlineSearch />
            <input
              onChange={(e) => setFilter(e.target.value)}
              type="text"
              value={filter}
              placeholder="Search"
              className="border-none outline-none ml-2 text-black w-full "
            />
            <div
              onClick={() => {
                setFilter("");
                setIsOpen(false);
              }}
              className="text-black  cursor-pointer mr-4"
            >
              x
            </div>
          </div>
        </div>

        <ul className="flex space-x-6 text-black text-3xl pr-50">
          <li>
            <Link href="/account" aria-label="Account">
              <HiOutlineUser />
            </Link>
          </li>
          <li>
            <Link href="" aria-label="Cart">
              <HiOutlineShoppingCart />
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
