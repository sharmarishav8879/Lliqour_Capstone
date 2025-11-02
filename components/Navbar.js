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
import MailboxDropdown from "./MailboxDropdown";

// ✅ NEW: admin quick notes (floating, localStorage-based)
import AdminQuickNotes from "./AdminQuickNotes";

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
      className={`py-6 px-6 fixed top-0 left-0 w-full shadow-md z-50 transition-colors duration-300
    ${theme === "light" ? "bg-white" : "bg-gray-950"}`}
    >
      {filter !== "" && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 top-[135px] left-0 w-full h-screen flex items-start justify-center font-serif p-6"
        >
          <div
            className={`max-h-[80vh] overflow-y-auto rounded-2xl shadow-lg p-6 transition-colors duration-300
          ${
            theme === "light" ? "bg-white text-black" : "bg-gray-800 text-white"
          }`}
          >
            <div className="flex flex-row gap-2">
              <select
                value={order}
                onChange={handleOrderType}
                className={`mb-4 align-bottom p-2 border rounded font-serif
              ${
                theme === "light"
                  ? "border-gray-300 text-orange-500 bg-white"
                  : "border-gray-600 text-orange-300 bg-gray-800"
              }`}
              >
                <option disabled>Sort by</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>

              <select
                onChange={handleCategoryType}
                defaultValue=""
                className={`mb-4 align-bottom p-3 border rounded font-serif
              ${
                theme === "light"
                  ? "border-gray-300 text-orange-500 bg-white"
                  : "border-gray-600 text-orange-300 bg-gray-800"
              }`}
              >
                <option value={selectedCategory} disabled>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
              {filterProducts.length > 0 ? (
                filterProducts.map((product) => (
                  <Link
                    href={`/products/${product.slug}`}
                    key={product.id}
                    className={`rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 border
                  ${
                    theme === "light"
                      ? "bg-gray-100 border-gray-300 text-black"
                      : "bg-gray-800 border-gray-700 text-white"
                  }`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-56 object-cover"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="p-4 flex flex-col justify-between h-40">
                      <div className="font-bold text-lg">{product.name}</div>
                      <div className="text-sm mt-1">
                        {product.size ? `${product.size} • ` : ""}
                        {product.abv ? `${product.abv} • ` : ""}
                        {product.origin || ""}
                      </div>
                      <div className="mt-2 font-extrabold">
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

      <div className="flex items-center justify-between relative">
        <div className="flex items-center pl-50">
          <Image
            src="/Logo.jpg"
            className="border-orange-500 border-2 rounded-full"
            alt="Legacy Liquor Logo"
            width={50}
            height={50}
          />
          <span
            className={`text-2xl font-bold font-serif ml-2 ${
              theme === "light" ? "text-black" : "text-white"
            }`}
          >
            Legacy Liquor
          </span>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <ul
            className={`flex space-x-10 text-xl font-serif ${
              theme === "light" ? "text-orange-500" : "text-white"
            }`}
          >
            {role === "admin" ? (
              <>
                <li>
                  <Link href="/admin">Admin</Link>
                </li>
                <li>
                  <Link href="/admin/insights">Insights</Link>
                </li>
                <li>
                  <Link href="/contactUs">Contact Us</Link>
                </li>
                <li>
                  <Link href="/admin/announcements">Announcements</Link>
                </li>
              </>
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

        <div className="flex items-center space-x-6 text-3xl pr-25">
          <div className="relative">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="focus:outline-none"
              aria-label="Toggle Search"
            >
              <HiOutlineSearch
                className={theme === "light" ? "text-black" : "text-white"}
              />
            </button>

            {showSearch && (
              <div
                className={`absolute top-full mt-2 right-0 flex items-center gap-3 border rounded-4xl p-2 w-[320px] shadow-lg font-serif
            ${
              theme === "light"
                ? "bg-white border-gray-300 text-black"
                : "bg-gray-800 border-gray-600 text-white"
            }`}
              >
                <HiOutlineSearch className="text-xl" />
                <input
                  onChange={(e) => setFilter(e.target.value)}
                  type="text"
                  value={filter}
                  placeholder="Search"
                  className="border-none outline-none bg-transparent w-auto max-w-[150px] text-xl rounded-md"
                />
                <div
                  onClick={() => {
                    setFilter("");
                    setIsOpen(false);
                    setShowSearch(false);
                  }}
                  className="cursor-pointer text-lg ml-auto mr-3 hover:text-red-500"
                >
                  ✕
                </div>
              </div>
            )}
          </div>

          <Link href="/account" aria-label="Account">
            <HiOutlineUser
              className={theme === "light" ? "text-black" : "text-white"}
            />
          </Link>

          <CartButton />
          <MailboxDropdown />

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

      {role === "admin" && <AdminQuickNotes />}
    </nav>
  );
}
