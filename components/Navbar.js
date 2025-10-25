"use client";

import Image from "next/image";
import { HiOutlineUser } from "react-icons/hi2";
import { HiOutlineSearch } from "react-icons/hi";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllProducts } from "@/lib/products";
import CartButton from "./CartButton";
import { auth, db } from "@/app/auth/_util/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useTheme } from "./ThemeToggle";

export default function Navbar() {
  const [filter, setFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [order, setOrder] = useState("asc");
  const [filterProducts, setFilterProducts] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [role, setRole] = useState("guest");
  const { theme, toggleMode } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState("");

  const handleOrderType = () => {
    setOrder(order === "asc" ? "desc" : "asc");
  };

  const handleCategoryType = (e) => {
    setSelectedCategory(e.target.value);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getAllProducts();
        let filteredProducts = allProducts.filter((product) =>
          product.name.toLowerCase().includes(filter.toLowerCase())
        );
        if (selectedCategory) {
          filteredProducts = filteredProducts.filter(
            (product) => product.category === selectedCategory
          );
        }

        if (order === "asc") {
          filteredProducts.sort((a, b) => a.price - b.price);
        } else {
          filteredProducts.sort((a, b) => b.price - a.price);
        }
        setFilterProducts(filteredProducts);
      } catch (error) {
        alert(`Error fetching products:  ${error.message}`);
      }
    };

    fetchProducts();
  }, [filter, order, selectedCategory]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(filter !== "");
  }, [filter]);

  useEffect(() => {
    const fetchRole = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRole("guest");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userDocSnapshot = await getDoc(userRef);

      if (userDocSnapshot.exists()) {
        const fetchedRole = userDocSnapshot.data().role?.trim().toLowerCase();
        setRole(fetchedRole);
      } else {
        setRole("guest");
      }
    });

    return () => fetchRole();
  }, []);

  return (
    <nav
      className={`py-6 px-6 fixed top-0 left-0 w-full shadow-md z-50 
    ${theme === "light" ? "bg-white" : "bg-teal-900 "} `}
    >
      {filter !== "" && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 top-[135px] left-0 w-full h-screen bg-black/30 flex items-start justify-center font-serif p-6"
        >
          <div className="bg-white max-h-[80vh] overflow-y-auto rounded-2xl shadow-lg p-6">
            <div className="flex flex-row gap-2">
              <select
                value={order}
                onChange={handleOrderType}
                className="mb-4 align-bottom p-2 border border-gray-300 rounded text-orange-500 font-serif"
              >
                <option disabled>Sort by</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>

              <select
                onChange={handleCategoryType}
                defaultValue=""
                className="mb-4 align-bottom p-3 border border-gray-300 rounded text-orange-500 font-serif"
              >
                <option
                  value={selectedCategory}
                  disabled
                  className="text-black"
                >
                  Category
                </option>
                <option value="Whisky">Whisky</option>
                <option value="Vodka">Vodka</option>
                <option value="Wine">Wine</option>
                <option value="Beer">Beer</option>
                <option value="Rum">Rum</option>
                <option value="Tequila">Tequila</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 ">
              {filterProducts.length > 0 ? (
                filterProducts.map((product) => (
                  <Link
                    href={`/products/${product.slug}`}
                    key={product.id}
                    className="bg-gray-100 border border-gray-300 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
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

      <div className="flex items-center justify-between  relative">
        <div className="flex items-center pl-50">
          <Image
            src="/Logo.jpg"
            className="border-orange-500 border-2 rounded-full"
            alt="Legacy Liquor Logo"
            width={50}
            height={50}
          />
          <span className=" text-black text-2xl font-bold font-serif">
            Legacy Liquor
          </span>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <ul
            className={`flex space-x-10 text-xl font-serif ${
              theme === "dark" ? "text-white" : "text-orange-500"
            }`}
          >
            {role === "admin" ? (
              <ul className="flex space-x-10 text-orange-500 text-xl font-serif">
                <li>
                  <Link href="/admin">Admin</Link>
                </li>

                <li>
                  <Link href="/admin/insights">Insights</Link>
                </li>
                <li>
                  <Link href="/admin/customer_support">Customer Support</Link>
                </li>
                <li>
                  <Link href="/admin/announcements">Announcements</Link>
                </li>
              </ul>
            ) : (
              <>
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
                  <Link href="/contactUs">Contact Us</Link>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="flex items-center space-x-6 text-black text-3xl pr-50">
          <div className="relative">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="focus:outline-none"
              aria-label="Toggle Search"
            >
              <HiOutlineSearch />
            </button>

            {showSearch && (
              <div className="absolute top-full mt-2 right-0 flex items-center gap-3 border text-black border-gray-300 rounded-4xl p-2 w-[320px] bg-white shadow-lg font-serif">
                <HiOutlineSearch className="text-xl" />
                <input
                  onChange={(e) => setFilter(e.target.value)}
                  type="text"
                  value={filter}
                  placeholder="Search"
                  className="border-none outline-none text-black w-auto max-w-[150px] text-xl rounded-md"
                />
                <div
                  onClick={() => {
                    setFilter("");
                    setIsOpen(false);
                    setShowSearch(false);
                  }}
                  className="text-black cursor-pointer text-lg ml-20"
                >
                  ✕
                </div>
              </div>
            )}
          </div>

          <Link href="/account" aria-label="Account">
            <HiOutlineUser />
          </Link>

          <CartButton />
          <button
            onClick={toggleMode}
            aria-label="Toggle Theme"
            className={`ml-4 relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 
    ${theme === "light" ? "bg-gray-300" : "bg-orange-500"}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 
      ${theme === "light" ? "translate-x-1" : "translate-x-6"}`}
            />
          </button>
        </div>
      </div>
    </nav>
  );
}
