import { getAllProducts } from "@/lib/products";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageOffers() {
  const [manageOffers, setManageOffers] = useState(false);
  const [products, setProducts] = useState([]);
  const [offerProducts, setOfferProducts] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getAllProducts();
        setProducts(allProducts);
      } catch (error) {
        alert(`Error fetching products: ${error.message}`);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    document.body.style.overflow = manageOffers ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [manageOffers]);

  const handleAddOffers = (p) => {
    if (offerProducts.find((product) => p.docId === product.docId))
      return toast.success("Product already added!");

    if (offerProducts.length >= 3) {
      alert("You can only add up to 3 offers at a time.");
      return;
    }

    const updatedOffersList = [...offerProducts, p];

    setOfferProducts(updatedOffersList);
    // localStorage.removeItem("offerProducts");

    localStorage.setItem("offerProducts", JSON.stringify(updatedOffersList));

    setAlertMessage(`${p.name} added to offers!`);
  };
  return (
    <div>
      <div
        onClick={() => setManageOffers(!manageOffers)}
        className="cursor-pointer hover:text-blue-600 transition"
      >
        Manage Offers
      </div>

      {manageOffers && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 font-serif">
          {alertMessage && (
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-2 rounded-md ">
              {alertMessage}
            </div>
          )}
          <div className="bg-white rounded-2xl shadow-2xl w-[90%] md:w-[600px] max-h-[85vh] flex flex-col relative mt-5">
            <div
              onClick={() => setManageOffers(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black transition"
            >
              <X size={24} />
            </div>

            <div className="p-5 border-b">
              <h2 className="text-2xl font-semibold text-gray-800 text-center">
                Manage Offers
              </h2>
            </div>

            <div className="overflow-y-auto p-5 space-y-3">
              {products.length === 0 ? (
                <p className="text-gray-500 text-center">No products found.</p>
              ) : (
                products.map((product) => (
                  <div
                    key={product.docId}
                    className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:bg-gray-100 transition"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-950">
                        {product.name}
                      </span>
                    </div>
                    <div className="flex gap-6 text-right">
                      <span className="text-gray-700 font-semibold">
                        ${product.price}
                      </span>
                      <span className="text-green-600 font-medium">
                        {product.discount ? `${product.discount}% off` : "—"}
                      </span>
                      <button
                        onClick={() => handleAddOffers(product)}
                        className="px-4 py-2 rounded text-white bg-green-600 cursor-pointer hover:bg-green-700 transition"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
