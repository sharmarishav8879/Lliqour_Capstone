"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
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
      const q = query(ticketsRef, where("canView", "array-contains", user.uid));
      const snapshot = await getDocs(q);
      setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
    <main className="bg-white min-h-screen flex flex-col items-center justify-start px-4 pt-40 font-serif">
      <div className="w-full max-w-md bg-gray-50 rounded-2xl shadow-lg p-6 flex flex-col gap-6">
        {user && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-300 rounded-full overflow-hidden"></div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-black">
                  {name || "No Name"}
                </h1>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <button
                onClick={handleSignOut}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-4xl transition duration-300"
              >
                Sign Out
              </button>
              <button
                onClick={() => router.push("/account/settings")}
                className="mt-2 flex items-center gap-2 text-gray-600 hover:text-black transition duration-300"
              >
                <HiOutlineCog size={24} />
              </button>
            </div>
          </div>
        )}

        {role === "user" && (
          <>
            <div className="flex flex-col gap-4 mt-6">
              <h2 className="text-2xl font-semibold text-black border-b pb-2">
                Support Tickets
              </h2>

              {tickets.length === 0 && (
                <p className="text-black">You have no tickets yet.</p>
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
            </div>
          </>
        )}

        {role === "admin" && (
          <div className="flex flex-col gap-4 mt-6">
            <div className="flex items-center justify-between w-full border-b border-black pb-2">
              <h2 className="text-2xl font-semibold text-black flex-1">
                Quick Catalogue
              </h2>

              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <button
                    onClick={() => setShowProductForm((prev) => !prev)}
                    className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shadow"
                  >
                    <FiPlus size={20} className="text-black" />
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

                <div className="relative">
                  <button
                    onClick={() => {
                      setShowCategoryDropdown((prev) => !prev);
                      setShowSearch(false);
                      setShowProductForm(false);
                    }}
                    className="h-10 w-22 px-4 bg-gray-200 text-black rounded-full font-semibold flex justify-center items-center shadow"
                  >
                    {activeCategory || "All"}
                  </button>
                  {showCategoryDropdown && (
                    <div className="absolute mt-2 right-0 w-full bg-white text-black font-semibold rounded-lg shadow-lg z-20">
                      <button
                        onClick={() => {
                          setActiveCategory(null);
                          setShowCategoryDropdown(false);
                        }}
                        className="w-full text-center py-2 hover:bg-orange-500 rounded-lg"
                      >
                        All
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setActiveCategory(category);
                            setShowCategoryDropdown(false);
                          }}
                          className="w-full text-center py-2 hover:bg-orange-500 rounded-lg"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => {
                      setShowSearch((prev) => !prev);
                      setShowCategoryDropdown(false);
                      setShowProductForm(false);
                    }}
                    className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shadow"
                  >
                    <HiOutlineSearch size={20} className="text-black" />
                  </button>
                  {showSearch && (
                    <div className="absolute top-full mt-2 right-0 flex items-center gap-2 border border-gray-300 text-black rounded-4xl p-2 w-[150px] bg-white shadow-lg font-serif z-20">
                      <HiOutlineSearch className="text-xl" />
                      <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-none outline-none text-black w-full text-lg rounded-md"
                      />
                      <div
                        onClick={() => {
                          setSearchTerm("");
                          setShowSearch(false);
                        }}
                        className="text-black cursor-pointer text-md pr-2"
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
