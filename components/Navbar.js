"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { HiOutlineUser } from "react-icons/hi2";
import { HiOutlineSearch } from "react-icons/hi";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { getAllProducts } from "@/lib/products";
import { auth, db } from "@/lib/firebase";
import CartButton from "./CartButton";
import MiniCart from "./MiniCart";

export default function Navbar() {
  // ---------------- state ----------------
  const [role, setRole] = useState(null); // null = loading
  const [showSearch, setShowSearch] = useState(false);
  const [filter, setFilter] = useState("");
  const [category, setCategory] = useState("");
  const [orderAsc, setOrderAsc] = useState(true);
  const [results, setResults] = useState([]);
  const [isCartOpen, setCartOpen] = useState(false);

  const pathname = usePathname();

  // ---------------- effects ----------------

  // Close cart when we land on /checkout
  useEffect(() => {
    if (pathname?.startsWith("/checkout")) setCartOpen(false);
  }, [pathname]);

  // Fetch role from Firebase Auth + Firestore, with session cache
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRole("guest");
        return;
      }

      // Use cached role first to prevent flash of guest dashboard
      const cached = sessionStorage.getItem("role");
      if (cached) setRole(cached);

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const fetchedRole = snap.data()?.role?.trim().toLowerCase() || "guest";
        setRole(fetchedRole);
        sessionStorage.setItem("role", fetchedRole); // update cache
      } catch (err) {
        console.error("Failed to fetch role:", err);
        if (!cached) setRole("guest");
      }
    });

    return () => unsub();
  }, []);

  // Simple client-side product search
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = (await getAllProducts()) || [];

        let list = all;
        if (filter.trim()) {
          const q = filter.trim().toLowerCase();
          list = list.filter((p) => p.name?.toLowerCase().includes(q));
        }
        if (category) {
          list = list.filter((p) => p.category === category);
        }
        list.sort((a, b) => (orderAsc ? a.price - b.price : b.price - a.price));

        if (!cancelled) setResults(list);
      } catch (e) {
        console.error("search fetch failed", e);
        if (!cancelled) setResults([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filter, category, orderAsc]);

  // ---------------- nav links ----------------
  const navLinks = useMemo(() => {
    if (role === "admin") {
      return [
        { href: "/admin", label: "Admin" },
        { href: "/admin/insights", label: "Insights" },
        { href: "/catalogue", label: "Catalogue" },
      ];
    }
    return [
      { href: "/", label: "Home" },
      { href: "/#special-offer", label: "Special Offers", anchor: true },
      { href: "/#catalogue", label: "Catalogue", anchor: true },
      { href: "/contactUs", label: "Contact Us" },
    ];
  }, [role]);

  // ---------------- render ----------------
  // Prevent flash of guest dashboard while role is loading
  if (role === null) return null;

  return (
    <nav className="bg-white py-6 px-6 fixed top-0 left-0 w-full shadow-md z-50">
      {/* Search overlay */}
      {showSearch && (
        <div
          className="fixed inset-0 top-[96px] bg-black/40 flex items-start justify-center p-6"
          onClick={() => setShowSearch(false)}
        >
          <div
            className="bg-white text-black w-full max-w-5xl rounded-2xl shadow-xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-3 items-center mb-4">
              <HiOutlineSearch className="text-xl" />
              <input
                autoFocus
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search products"
                className="flex-1 outline-none border border-gray-300 rounded-md px-3 py-2"
              />
              <select
                value={orderAsc ? "asc" : "desc"}
                onChange={(e) => setOrderAsc(e.target.value === "asc")}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="asc">Price: Low → High</option>
                <option value="desc">Price: High → Low</option>
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All categories</option>
                <option value="Whisky">Whisky</option>
                <option value="Vodka">Vodka</option>
                <option value="Wine">Wine</option>
                <option value="Beer">Beer</option>
                <option value="Rum">Rum</option>
                <option value="Tequila">Tequila</option>
              </select>
              <button
                onClick={() => {
                  setFilter("");
                  setCategory("");
                  setShowSearch(false);
                }}
                className="px-3 py-2 rounded-md border"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.length === 0 ? (
                <div className="col-span-full text-center text-gray-600 py-8">
                  No products found.
                </div>
              ) : (
                results.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className="border rounded-xl overflow-hidden hover:shadow transition"
                    onClick={() => setShowSearch(false)}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-48 object-cover bg-gray-100"
                    />
                    <div className="p-3">
                      <div className="font-semibold truncate">{p.name}</div>
                      <div className="text-sm text-gray-600">
                        ${Number(p.price).toFixed(2)}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between relative">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Image
            src="/Logo.jpg"
            alt="Legacy Liquor Logo"
            width={50}
            height={50}
            className="rounded-full border-2 border-orange-500"
          />
          <span className="ml-3 text-black text-2xl font-bold font-serif">
            Legacy Liquor
          </span>
        </div>

        {/* Center: Nav */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <ul className="flex space-x-10 text-orange-500 text-xl font-serif">
            {navLinks.map((l) =>
              l.anchor ? (
                <li key={l.label}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ) : (
                <li key={l.label}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Right icons */}
        <div className="flex items-center space-x-6 text-black text-3xl">
          <button
            aria-label="Toggle Search"
            className="focus:outline-none"
            onClick={() => setShowSearch((v) => !v)}
            title="Search"
          >
            <HiOutlineSearch />
          </button>

          <Link href="/account" aria-label="Account" title="Account">
            <HiOutlineUser />
          </Link>

          {/* Cart icon + popover */}
          <div className="relative">
            <CartButton setOpen={setCartOpen} />
            {isCartOpen && (
              <div className="absolute right-0 mt-3 w-[340px] bg-white text-black rounded-xl shadow-2xl border">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <div className="font-semibold text-lg">Your Cart</div>
                  <button
                    className="text-xl leading-none"
                    aria-label="Close cart"
                    onClick={() => setCartOpen(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="p-3">
                  <MiniCart />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
