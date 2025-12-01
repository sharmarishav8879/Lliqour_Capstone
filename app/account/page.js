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
import { useTheme } from "@/components/ThemeToggle";
import { deleteProduct } from "../../adminComponents/deleteProducts";

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
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [lifetimeLoyaltyPoints, setLifetimeLoyaltyPoints] = useState(0);

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
          setLoyaltyPoints(userData.loyaltyPoints || 0);
          setLifetimeLoyaltyPoints(userData.lifetimeLoyaltyPoints || 0);
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
        const productsRef = collection(db, "products");
        const snapshot = await getDocs(productsRef);
        const normalized = snapshot.docs.map((doc) => {
          const p = doc.data();
          return {
            id: doc.id,
            name: p.name || "Unnamed Product",
            category: p.category || "Other",
            price: p.price || 0,
            description: p.description || "",
            stock: p.stock ?? 0,
            image: p.image || p.imageUrl || "/placeholderProduct.jpg",
          };
        });
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
    isAdmin,
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
        alert(`"${product.name}" has been deleted.`);
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Please try again.");
      }
    };

    return (
      <div className="border rounded-xl p-4 shadow-sm bg-white mb-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex gap-3">
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-lg text-black">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500">{product.category}</p>
              <p className="mt-1 font-medium text-black">
                ${Number(product.price).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Stock:{" "}
                <span
                  className={
                    product.stock <= 10 ? "text-red-500 font-semibold" : ""
                  }
                >
                  {product.stock}
                </span>
              </p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex flex-col gap-2 items-end">
              <button
                className="text-sm px-3 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setShowUpdateModal(true)}
              >
                Edit
              </button>
              <button
                className="text-sm p-2 rounded-full border border-red-300 text-red-500 hover:bg-red-50 transition"
                onClick={handleDeleteClick}
              >
                <FaRegTrashAlt size={16} />
              </button>
            </div>
          )}
        </div>
        {showUpdateModal && (
          <ProductUpdateModal
            product={product}
            onClose={() => setShowUpdateModal(false)}
            onProductUpdated={onProductUpdated}
          />
        )}
      </div>
    );
  }

  function ProductUpdateModal({ product, onClose, onProductUpdated }) {
    const [formData, setFormData] = useState({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      stock: product.stock,
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const productRef = doc(db, "products", product.id);
        await setDoc(
          productRef,
          {
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
          },
          { merge: true }
        );
        onProductUpdated({
          ...product,
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
        });
        onClose();
      } catch (error) {
        console.error("Error updating product:", error);
        alert("Failed to update product. Please try again.");
      }
    };

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Update Product</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Category
              </label>
              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
              >
                Save changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (authLoading || loading) {
    return (
      <main
        className={`${
          theme === "light" ? "bg-white" : "bg-gray-900"
        } min-h-screen flex items-center justify-center`}
      >
        <p className={`${theme === "light" ? "text-black" : "text-white"}`}>
          Loading your account...
        </p>
      </main>
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
                className="px-6 py-2.5 rounded-full font-medium text-white bg-gradient-to-r from-orange-500 to-amber-400 shadow-md hover:from-orange-600 hover:to-amber-500 transition-all duration-300 transform hover:scale-105 active:scale-95"
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

        {/* Loyalty section for regular users */}
        {role === "user" && (
          <div className="flex flex-col gap-4 mt-6">
            <section className="mb-4">
              <h2
                className={`text-2xl font-semibold border-b pb-2 ${
                  theme === "light"
                    ? "text-black border-black"
                    : "text-white border-gray-600"
                }`}
              >
                Loyalty Points
              </h2>
              <p
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } mt-3`}
              >
                <span className="font-semibold">Available points:</span>{" "}
                {loyaltyPoints}
              </p>
              <p
                className={`${
                  theme === "light" ? "text-gray-600" : "text-gray-300"
                } text-sm mt-1`}
              >
                You earn 1 point for every $10 spent on completed orders.
              </p>
              <p
                className={`${
                  theme === "light" ? "text-gray-600" : "text-gray-300"
                } text-sm mt-1`}
              >
                Lifetime points earned: {lifetimeLoyaltyPoints}
              </p>
            </section>

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
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                }`}
              >
                You have no tickets yet.
              </p>
            )}

            {tickets.length > 0 && (
              <div className="flex flex-col gap-2">
                {tickets.map((ticket) => (
                  <InfoCard
                    key={ticket.id}
                    title={ticket.subject || "Support Ticket"}
                    date={
                      ticket.createdAt?.toDate
                        ? ticket.createdAt.toDate().toLocaleString()
                        : "Unknown date"
                    }
                  />
                ))}
              </div>
            )}

            <h2
              className={`text-2xl font-semibold border-b pb-2 mt-6 ${
                theme === "light"
                  ? "text-black border-black"
                  : "text-white border-gray-600"
              }`}
            >
              Order History
            </h2>

            {orderHistory.length === 0 && (
              <p
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                }`}
              >
                You have no Orders yet.
              </p>
            )}

            {/* Plan Event Button */}
            <button
              className="px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-orange-500 to-amber-400 shadow-md hover:from-orange-600 hover:to-amber-500 transition-all duration-300 transform hover:scale-105 active:scale-95"
              onClick={() => router.push("/party-planner")}
            >
              Plan an Event
            </button>
          </div>
        )}

        {role === "admin" && (
          <div className="flex flex-col gap-6 mt-6">
            <div className="flex items-center justify-between">
              <h2
                className={`text-2xl font-semibold ${
                  theme === "light" ? "text-black" : "text-white"
                }`}
              >
                Product Management
              </h2>
              <button
                className="px-4 py-2 rounded-full bg-orange-500 text-white flex items-center gap-2 hover:bg-orange-600 transition"
                onClick={() => setShowProductForm(true)}
              >
                <FiPlus size={18} />
                New Product
              </button>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() =>
                  setShowCategoryDropdown((prevState) => !prevState)
                }
                className="px-4 py-2 rounded-full border border-gray-300 flex items-center gap-2 text-sm hover:bg-gray-100 transition"
              >
                Filter by category
              </button>
              <button
                onClick={() => setShowSearch((prevState) => !prevState)}
                className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition"
              >
                <HiOutlineSearch size={18} />
              </button>
            </div>

            {showCategoryDropdown && (
              <div className="flex gap-2 flex-wrap mb-2">
                <button
                  className={`px-3 py-1 rounded-full border text-sm ${
                    activeCategory === null
                      ? "bg-orange-500 text-white border-orange-500"
                      : "border-gray-300 text-gray-700"
                  }`}
                  onClick={() => setActiveCategory(null)}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`px-3 py-1 rounded-full border text-sm ${
                      activeCategory === category
                        ? "bg-orange-500 text-white border-orange-500"
                        : "border-gray-300 text-gray-700"
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            {showSearch && (
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 mb-2 border rounded-full text-sm"
              />
            )}

            <div>
              {filteredItems.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No products found. Try adjusting filters or search.
                </p>
              ) : (
                filteredItems.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isAdmin={role === "admin"}
                    onProductDeleted={(id) =>
                      setItems((prev) => prev.filter((p) => p.id !== id))
                    }
                    onProductUpdated={(newProduct) =>
                      setItems((prev) =>
                        prev.map((p) => (p.id === newProduct.id ? newProduct : p))
                      )
                    }
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
