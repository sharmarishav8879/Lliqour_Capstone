"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useUserAuth } from "../auth/_util/auth-context";
import { db } from "../auth/_util/firebase";
import { HiOutlineCog, HiOutlineSearch } from "react-icons/hi";
import { FiPlus } from "react-icons/fi";
import { FaRegTrashAlt } from "react-icons/fa";
import { MdModeEditOutline } from "react-icons/md";
import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import { addProducts } from "@/lib/modifyProducts";
import AddProduct from "../../adminComponents/addProducts";

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

  const [productData, setProductData] = useState({
    name: "",
    price: "",
    category: "",
    abv: "",
    size: "",
    origin: "",
    description: "",
    discount: "",
    imageUrl: "",
  });

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

    const fetchProducts = async () => {
      try {
        const products = await getAllProducts();
        setItems(Array.isArray(products) ? products : []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchProducts();
  }, [user, authLoading, router]);

  const filteredItems = items.filter((product) => {
    const matchesCategory = activeCategory
      ? product.category === activeCategory
      : true;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  function ProductCard({ product, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Link
        href={`/products/${product.slug}`}
        className="block bg-gray-100 border border-gray-300 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
      >
        <img
          src={product.imageUrl || product.image}
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
            ${product.price.toFixed(2)}
          </div>
        </div>
      </Link>

      <div className="absolute bottom-4 right-4 flex space-x-2">
        <button
          onClick={() => {}}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow bg-gray-200 text-gray-800"
        >
          <MdModeEditOutline size={20} />
        </button>

        <button
          onClick={() => {}}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow bg-orange-500 text-white"
        >
          <FaRegTrashAlt size={18} />
        </button>
      </div>
    </div>
  );
}

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();

    const { name, price, category, abv, size, origin } = productData;

    if (!name.trim()) return alert("Product name is required.");
    if (!category.trim()) return alert("Category is required.");
    if (!size.trim()) return alert("Size is required.");
    if (!origin.trim()) return alert("Origin is required.");

    const priceNum = parseFloat(price);
    const abvNum = parseFloat(abv);

    if (isNaN(priceNum) || priceNum <= 0)
      return alert("Price must be a positive number.");
    if (isNaN(abvNum) || abvNum < 0)
      return alert("ABV must be a valid number.");

    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const id = slug;

    const newProduct = {
      ...productData,
      price: priceNum,
      discount: parseFloat(productData.discount) || 0,
      slug,
      id,
      imageUrl: productData.imageUrl || "/placeholderProduct.jpg",
    };

    try {
      await addProducts(newProduct);
      setProductData({
        name: "",
        price: "",
        category: "",
        abv: "",
        size: "",
        origin: "",
        description: "",
        discount: "",
        imageUrl: "",
      });
      setShowProductForm(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to add product. Please try again.");
    }
  };

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
                Current Orders
              </h2>
              <InfoCard
                title="Order #12345"
                date="2025-09-01"
                subtitleLabel="Placed on"
              />
              <InfoCard
                title="Order #12346"
                date="2025-09-05"
                subtitleLabel="Placed on"
              />
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <h2 className="text-2xl font-semibold text-black border-b pb-2">
                Order History
              </h2>
              <InfoCard
                title="Order #12344"
                date="2025-08-20"
                subtitleLabel="Placed on"
              />
              <InfoCard
                title="Status: Delivered"
                date="2025-08-25"
                subtitleLabel="Delivered on"
              />
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <h2 className="text-2xl font-semibold text-black border-b pb-2">
                Support Tickets
              </h2>
              <InfoCard
                title="Order Issue"
                date="2025-09-01"
                subtitleLabel="Opened on"
              />
              <InfoCard
                title="Status: In Progress"
                date="2025-09-02"
                subtitleLabel="Last Updated"
              />
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
                    onClick={() => {
                      setShowProductForm((prev) => !prev);
                      setShowSearch(false);
                      setShowCategoryDropdown(false);
                    }}
                    className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shadow"
                  >
                    <FiPlus size={20} className="text-black" />
                  </button>

                  {showProductForm && (
                    <div className="absolute right-0 w-72 bg-white text-black font-serif rounded-2xl shadow-xl z-20 p-4 max-h-[80vh] overflow-y-auto flex flex-col gap-3">
                      <h2 className="text-lg font-bold text-center mb-3">
                        Add Product
                      </h2>
                      <form
                        className="flex flex-col gap-2 w-full"
                        onSubmit={handleAddProductSubmit}
                      >
                        <AddProduct
                          productData={productData}
                          setProductData={setProductData}
                        />
                        <button
                          type="submit"
                          className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors"
                        >
                          Add Product
                        </button>
                      </form>
                    </div>
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
                  filteredItems.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      className="min-w-[220px]"
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
