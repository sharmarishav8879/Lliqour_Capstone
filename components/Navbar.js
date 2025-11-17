// components/Navbar.js
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
import AdminQuickNotes from "./AdminQuickNotes";

// persistent key for admin preview toggle ("on" | "off")
const PREVIEW_LS_KEY = "adminUserPreview";

export default function Navbar() {
  const [filter, setFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [order, setOrder] = useState("asc");
  const [filterProducts, setFilterProducts] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [role, setRole] = useState("guest");
  const { theme, toggleMode } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [adminPreview, setAdminPreview] = useState(false); // admin-only toggle

  // --- helpers
  const handleOrderType = () => setOrder(order === "asc" ? "desc" : "asc");
  const handleCategoryType = (e) => setSelectedCategory(e.target.value);

  // --- search overlay: fetch + filter
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getAllProducts();
        let filtered = allProducts.filter((p) =>
          p.name.toLowerCase().includes(filter.toLowerCase())
        );
        if (selectedCategory) {
          filtered = filtered.filter((p) => p.category === selectedCategory);
        }
        filtered.sort((a, b) => (order === "asc" ? a.price - b.price : b.price - a.price));
        setFilterProducts(filtered);
      } catch (error) {
        alert(`Error fetching products: ${error.message}`);
      }
    };
    if (filter) fetchProducts();
    else setFilterProducts([]);
  }, [filter, order, selectedCategory]);

  // prevent background scroll when overlay open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  // open overlay if there is a query
  useEffect(() => {
    setIsOpen(filter !== "");
  }, [filter]);

  // fetch current user's role (gracefully fall back to guest)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) return setRole("guest");
        const snap = await getDoc(doc(db, "users", user.uid));
        const fetchedRole = snap.exists()
          ? (snap.data().role || "guest").toString().trim().toLowerCase()
          : "guest";
        setRole(fetchedRole);
      } catch (err) {
        console.warn("Role fetch blocked by rules; defaulting to guest:", err);
        setRole("guest");
      }
    });
    return () => unsub();
  }, []);

  // load persisted preview state
  useEffect(() => {
    const saved = localStorage.getItem(PREVIEW_LS_KEY);
    setAdminPreview(saved === "on");
  }, []);

  // persist + broadcast preview changes
  useEffect(() => {
    localStorage.setItem(PREVIEW_LS_KEY, adminPreview ? "on" : "off");
    window.dispatchEvent(new CustomEvent("adminUserPreview", { detail: { on: adminPreview } }));
  }, [adminPreview]);

  return (
    <nav
      className={`sticky top-0 z-50 transition-colors duration-300 border-b py-4
        ${theme === "light" ? "bg-white border-neutral-200" : "bg-gray-950 border-gray-800"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* top row */}
        <div className="h-[90px] flex items-center justify-between gap-3">
          {/* brand */}
          <Link href={role === "admin" ? "/admin" : "/"} className="flex items-center gap-2">
            <Image
              src="/Logo.jpg"
              className="border-orange-500 border-2 rounded-full"
              alt="Legacy Liquor Logo"
              width={60}
              height={60}
            />
            <span
              className={`text-2xl font-bold font-serif ${
                theme === "light" ? "text-black" : "text-white"
              }`}
            >
              Legacy Liquor
            </span>
          </Link>

          {/* center navigation */}
          <ul
            className={`hidden md:flex items-center gap-10 text-xl font-serif ${
              theme === "light" ? "text-orange-600" : "text-white"
            }`}
          >
            {role === "admin" ? (
              <>
                <li><Link href="/admin">Admin</Link></li>
                <li><Link href="/admin/insights">Insights</Link></li>
                <li><Link href="/contactUs">Contact Us</Link></li>
                <li><Link href="/admin/announcements">Announcements</Link></li>
              </>
            ) : (
              <>
                <li><Link href="/">Home</Link></li>
                <li><a href="/#special-offer">Special Offers</a></li>
                <li><a href="/#catalogue">Catalogue</a></li>
                <li><Link href="/contactUs">Contact Us</Link></li>
                <li><Link href="/party-planner">Party Planner</Link></li>
              </>
            )}
          </ul>

          {/* right side controls */}
          <div className="flex items-center gap-5 text-3xl">
            {/* search */}
            <button
              onClick={() => setShowSearch((v) => !v)}
              className="focus:outline-none"
              aria-label="Toggle Search"
              title="Search"
            >
              <HiOutlineSearch className={theme === "light" ? "text-black" : "text-white"} />
            </button>

            {/* account */}
            <Link href="/account" aria-label="Account" title="Account">
              <HiOutlineUser className={theme === "light" ? "text-black" : "text-white"} />
            </Link>

            {/* cart + mailbox */}
            <CartButton />
            <MailboxDropdown />

            {/* theme toggle */}
            <button
              onClick={toggleMode}
              aria-label="Toggle Theme"
              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all
                ${theme === "light" ? "bg-gray-300" : "bg-orange-500"}`}
              title="Toggle light/dark"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform
                  ${theme === "light" ? "translate-x-1" : "translate-x-6"}`}
              />
            </button>

            {/* admin preview toggle (always visible for admins) */}
            {role === "admin" && (
              <label
                className="ml-1 flex items-center gap-2 cursor-pointer select-none text-sm"
                title="Preview the customer-facing site inside Admin pages"
              >
                <span className={theme === "light" ? "text-orange-700" : "text-orange-300"}>
                  User dashboard
                </span>
                <input
                  type="checkbox"
                  className="accent-orange-500 w-4 h-4"
                  checked={adminPreview}
                  onChange={(e) => setAdminPreview(e.target.checked)}
                  aria-label="Toggle user dashboard preview"
                />
              </label>
            )}
          </div>
        </div>

        {/* search dropdown */}
        {showSearch && (
          <div className="relative mb-4">
            <div
              className={`absolute right-0 top-0 mt-0 flex items-center gap-3 border rounded-2xl p-2 w-[320px] shadow-lg font-serif
                ${theme === "light" ? "bg-white border-gray-300 text-black" : "bg-gray-800 border-gray-600 text-white"}`}
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
                className="cursor-pointer text-lg ml-auto mr-1 hover:text-red-500"
              >
                ✕
              </div>
            </div>
          </div>
        )}
      </div>
      

      {/* results overlay panel */}
      {filter !== "" && (
        <>
          <div
            onClick={() => setFilter("")}
            className="fixed inset-0 top-[72px] bg-black/40 z-40"
          />
          <div className="fixed inset-x-0 top-[92px] z-50">
            <div
              onClick={(e) => e.stopPropagation()}
              className={`max-w-6xl mx-auto rounded-2xl shadow-lg p-6 font-serif
                ${theme === "light" ? "bg-white text-black" : "bg-gray-800 text-white"}`}
            >
              {/* controls row */}
              <div className="flex flex-row gap-2 mb-4">
                <select
                  value={order}
                  onChange={handleOrderType}
                  className={`p-2 border rounded font-serif
                    ${theme === "light" ? "border-gray-300 text-orange-500 bg-white"
                      : "border-gray-600 text-orange-300 bg-gray-800"}`}
                >
                  <option disabled>Sort by</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>

                <select
                  onChange={handleCategoryType}
                  defaultValue=""
                  className={`p-3 border rounded font-serif
                    ${theme === "light" ? "border-gray-300 text-orange-500 bg-white"
                      : "border-gray-600 text-orange-300 bg-gray-800"}`}
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

              {/* results grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filterProducts.length > 0 ? (
                  filterProducts.map((product) => (
                    <Link
                      href={`/products/${product.slug}`}
                      key={product.id}
                      className={`rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 border
                        ${theme === "light" ? "bg-gray-100 border-gray-300 text-black"
                          : "bg-gray-800 border-gray-700 text-white"}`}
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
                  <p className="text-center text-orange-500 text-lg col-span-full">
                    No products found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {role === "admin" && <AdminQuickNotes />}
    </nav>
  );
}
