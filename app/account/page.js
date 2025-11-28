"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useUserAuth } from "../auth/_util/auth-context";
import { db } from "../auth/_util/firebase";
import { HiOutlineCog, HiOutlineSearch } from "react-icons/hi";
import { FiPlus } from "react-icons/fi";
import { FaRegTrashAlt } from "react-icons/fa";
import { MdModeEditOutline } from "react-icons/md";
import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import AddProducts from "../../adminComponents/addProducts";
import { deleteProduct } from "../../adminComponents/deleteProducts";
import UpdateProducts from "../../adminComponents/updateProducts";
import { useTheme } from "@/components/ThemeToggle";

export default function Profile() {
  const { user, loading: authLoading, firebaseSignOut } = useUserAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const categories = ["Whisky", "Vodka", "Wine", "Beer", "Rum", "Tequila"];
  const [showProductForm, setShowProductForm] = useState(false);
  const [tickets, setTickets] = useState([]);
  
  //order history not set up yet
  const [orderHistory, setOrderHistory] = useState([]);
  const { toggleMode, theme } = useTheme();

  const handleSignOut = async () => {
    try {
      await firebaseSignOut();
      router.push("/auth/login");
    } catch (error) {
      alert("Error signing out: " + error.message);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setName(userData.name);
          setRole(userData.role || "user");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchTickets = async () => {
      try {
        const ticketsRef = collection(db, "tickets");
        const q = query(
          ticketsRef,
          where("canView", "array-contains", user.uid)
        );
        const snapshot = await getDocs(q);
        setTickets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setTickets([]);
      }
    };

    const fetchProducts = async () => {
      try {
        const products = await getAllProducts();
        const normalized = (Array.isArray(products) ? products : []).map(
          (p) => ({
            id: p.docId || p.id,
            slug: p.slug || p.docId,
            name: p.name || "Unnamed Product",
            category: p.category || "Uncategorized",
            price: Number(p.price) || 0,
            abv: p.abv || "",
            size: p.size || "",
            origin: p.origin || "",
            description: p.description || "",
            discount: Number(p.discount) || 0,
            image: p.image || p.imageUrl || "/placeholderProduct.jpg",
          })
        );
        setItems(normalized);
      } catch (error) {
        console.error("Error fetching products:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchTickets();
    fetchProducts();
  }, [user, authLoading, router]);

  const filteredItems = items.filter(
    (product) =>
      product &&
      typeof product.name === "string" &&
      (activeCategory ? product.category === activeCategory : true) &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function InfoCard({ title, date, subtitleLabel = "Placed on" }) {
    return (
      <div className="p-4 bg-white border rounded-4xl shadow-sm px-5 mt-2 mb-2">
        <p className="font-medium text-black">{title}</p>
        <p className="text-sm text-gray-500">
          {subtitleLabel}: {date}
        </p>
      </div>
    );
  }

  function ProductCard({
    product,
    className = "",
    onProductDeleted,
    onProductUpdated,
  }) {
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const handleDeleteClick = async (e) => {
      e.preventDefault();
      const confirmed = confirm(
        `Are you sure you want to delete "${product.name}"?`
      );
      if (!confirmed) return;
      try {
        await deleteProduct(product.id);
        if (onProductDeleted) onProductDeleted(product.id);
        alert(`"${product.name}" deleted successfully!`);
      } catch (err) {
        alert(`Failed to delete product: ${err.message}`);
      }
    };

    return (
      <div className={`relative ${className}`}>
        <Link
          href={`/products/${product.slug}`}
          className="block bg-gray-100 border border-gray-300 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-56 object-cover"
          />
          <div className="p-4 flex flex-col justify-between h-40">
            <div className="font-bold text-lg text-black">{product.name}</div>
            <div className="text-sm text-gray-600 mt-1">
              {product.size ? `${product.size} • ` : ""}
              {product.abv ? `${product.abv} • ` : ""}
              {product.origin || ""}
            </div>
            <div className="mt-2 font-extrabold text-gray-900">
              ${Number(product.price).toFixed(2)}
            </div>
          </div>
        </Link>

        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowUpdateModal(true);
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow bg-gray-200 text-gray-800"
          >
            <MdModeEditOutline size={20} />
          </button>

          <button
            onClick={handleDeleteClick}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow bg-orange-500 text-white"
          >
            <FaRegTrashAlt size={18} />
          </button>
        </div>

        {showUpdateModal && (
          <UpdateProducts
            product={product}
            onClose={() => setShowUpdateModal(false)}
            onUpdated={(newProduct) => {
              setItems((prev) =>
                prev.map((p) => (p.id === newProduct.id ? newProduct : p))
              );
            }}
          />
        )}
      </div>
    );
  }

  return (
    <main
      className={`${
        theme === "light" ? "bg-white" : "bg-gray-900"
      } min-h-screen flex flex-col items-center justify-start px-4 pt-30 font-serif`}
    >
      <div
        className={`${
          theme === "light" ? "bg-gray-50 text-black" : "bg-gray-800 text-white"
        } w-full max-w-md rounded-2xl shadow-lg p-6 flex flex-col gap-6`}
      >
        {user && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`${
                  theme === "light" ? "bg-gray-300" : "bg-gray-700"
                } w-20 h-20 rounded-full overflow-hidden`}
              ></div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold">{name || "No Name"}</h1>
                <p
                  className={`${
                    theme === "light" ? "text-gray-600" : "text-gray-300"
                  }`}
                >
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-4xl transition duration-300"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
              <button
                onClick={toggleMode}
                aria-label="Toggle Theme"
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all mt-2
                ${theme === "light" ? "bg-gray-300" : "bg-orange-500"}`}
                title="Toggle light/dark"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform
                  ${theme === "light" ? "translate-x-1" : "translate-x-6"}`}
                />
              </button>
              <button
                onClick={() => router.push("/account/settings")}
                className={`${
                  theme === "light"
                    ? "text-gray-600 hover:text-black"
                    : "text-gray-300 hover:text-white"
                } mt-2 flex items-center gap-2 transition duration-300`}
              >
                <HiOutlineCog size={24} />
              </button>
            </div>
          </div>
        )}

        {role === "user" && (
          <div className="flex flex-col gap-4 mt-6">
            <h2
              className={`text-2xl font-semibold border-b pb-2 ${
                theme === "light"
                  ? "text-black border-black"
                  : "text-white border-gray-600"
              }`}
            >
              Support Tickets
            </h2>

            {tickets.length === 0 && (
              <p
                className={`${theme === "light" ? "text-black" : "text-white"}`}
              >
                You have no tickets yet.
              </p>
            )}

            {tickets.map((ticket) => (
              <Link key={ticket.id} href={`/ticketsChat/${ticket.id}`}>
                <InfoCard
                  title={ticket.title}
                  date={
                    ticket.createdAt?.toDate
                      ? ticket.createdAt.toDate().toLocaleDateString()
                      : ""
                  }
                  subtitleLabel="Opened on"
                />
              </Link>
            ))}

            {/* Order History Section Placeholder */}
            <h2
              className={`text-2xl font-semibold border-b pb-2 ${
                theme === "light"
                  ? "text-black border-black"
                  : "text-white border-gray-600"
              }`}
            >
              Order History
            </h2>
            
            {/* Placeholder for order history items */}
            {orderHistory.length === 0 && (
              <p
                className={`${theme === "light" ? "text-black" : "text-white"}`}
              >
                You have no Orders yet.
              </p>
            )}
            
            {/* Plan Event Button */}
            <button
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-4xl transition duration-300"
                onClick={() => router.push("/party-planner")}
              >
                Plan an Event
              </button>

          </div>
        )}

        {role === "admin" && (
          <div className="flex flex-col gap-4 mt-6">
            <div
              className={`flex items-center justify-between w-full border-b pb-2 ${
                theme === "light" ? "border-black" : "border-gray-600"
              }`}
            >
              <h2
                className={`text-2xl font-semibold flex-1 ${
                  theme === "light" ? "text-black" : "text-white"
                }`}
              >
                Quick Catalogue
              </h2>

              <div className="flex items-center gap-1.5">
                {/* Product Form Toggle */}
                <div className="relative">
                  <button
                    className={`${
                      theme === "light"
                        ? "bg-gray-200 text-black"
                        : "bg-gray-700 text-white"
                    } w-10 h-10 rounded-full flex items-center justify-center shadow`}
                    onClick={() => setShowProductForm((prev) => !prev)}
                  >
                    <FiPlus size={20} />
                  </button>
                  {showProductForm && (
                    <AddProducts
                      onClose={() => setShowProductForm(false)}
                      onAdded={(newProduct) => {
                        setItems((prev) => [...prev, newProduct]);
                        setShowProductForm(false);
                      }}
                    />
                  )}
                </div>

                {/* Category Dropdown */}
                <div className="relative">
                  <button
                    className={`${
                      theme === "light"
                        ? "bg-gray-200 text-black"
                        : "bg-gray-700 text-white"
                    } h-10 w-22 px-4 rounded-full font-semibold flex justify-center items-center shadow`}
                    onClick={() => {
                      setShowCategoryDropdown((prev) => !prev);
                      setShowSearch(false);
                      setShowProductForm(false);
                    }}
                  >
                    {activeCategory || "All"}
                  </button>
                  {showCategoryDropdown && (
                    <div
                      className={`${
                        theme === "light"
                          ? "bg-white text-black"
                          : "bg-gray-800 text-white"
                      } absolute mt-2 right-0 w-full font-semibold rounded-lg shadow-lg z-20`}
                    >
                      <button
                        className="w-full text-center py-2 hover:bg-orange-500 rounded-lg"
                        onClick={() => {
                          setActiveCategory(null);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        All
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category}
                          className="w-full text-center py-2 hover:bg-orange-500 rounded-lg"
                          onClick={() => {
                            setActiveCategory(category);
                            setShowCategoryDropdown(false);
                          }}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Button & Modal */}
                <div className="relative">
                  <button
                    className={`${
                      theme === "light"
                        ? "bg-gray-200 text-black"
                        : "bg-gray-700 text-white"
                    } w-10 h-10 rounded-full flex items-center justify-center shadow`}
                    onClick={() => {
                      setShowSearch((prev) => !prev);
                      setShowCategoryDropdown(false);
                      setShowProductForm(false);
                    }}
                  >
                    <HiOutlineSearch size={20} />
                  </button>
                  {showSearch && (
                    <div
                      className={`${
                        theme === "light"
                          ? "bg-white text-black border-gray-300"
                          : "bg-gray-800 text-white border-gray-600"
                      } absolute top-full mt-2 right-0 flex items-center gap-2 border rounded-4xl p-2 w-[150px] shadow-lg font-serif z-20`}
                    >
                      <HiOutlineSearch className="text-xl" />
                      <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-none outline-none w-full text-lg rounded-md"
                      />
                      <div
                        onClick={() => {
                          setSearchTerm("");
                          setShowSearch(false);
                        }}
                        className="cursor-pointer text-md pr-2"
                      >
                        ✕
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full max-w-6xl flex flex-col gap-6 mt-4">
              <div className="flex gap-6 overflow-x-auto py-2 scrollbar-hide">
                {filteredItems.length > 0 ? (
                  filteredItems.map((product, index) => (
                    <ProductCard
                      key={`${product.id}-${index}`}
                      product={product}
                      className="min-w-[220px]"
                      onProductDeleted={(deletedId) =>
                        setItems((prev) =>
                          prev.filter((p) => p.id !== deletedId)
                        )
                      }
                    />
                  ))
                ) : (
                  <p className="text-center text-orange-500 text-lg w-full">
                    No products found.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
