"use client";

import { useState, useEffect } from "react";
import { getAllProducts } from "@/lib/products";
import { UpdateProducts as updateProductInDB } from "@/lib/modifyProducts";

export default function UpdateProducts() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const allProducts = await getAllProducts();
      setProducts(allProducts);
    };
    fetchProducts();
  }, []);

  // Handle the update form submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProductInDB(selectedProduct.id, selectedProduct);
      alert("Product updated successfully!");
      setSelectedProduct(null);

      // Refresh products list
      const allProducts = await getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      alert(`Error updating product: ${error.message}`);
      console.error("Error updating product:", error);
    }
  };

  return (
    <div className="bg-white min-h-screen pt-40 font-serif flex flex-col items-center text-black gap-6">
      <h1 className="text-3xl font-bold">Update Products</h1>

      {/* Products list */}
      <div className="w-full max-w-4xl flex flex-col gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="p-4 border border-gray-300 rounded flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold">{product.name}</h3>
              <p>${product.price}</p>
            </div>
            <button
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
              onClick={() => setSelectedProduct(product)}
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form
            onSubmit={handleUpdate}
            className="w-full max-w-2xl p-6 bg-white rounded shadow-lg flex flex-col gap-3"
          >
            <h2 className="text-2xl font-bold">
              Editing: {selectedProduct.name}
            </h2>

            <input
              type="text"
              placeholder="Name"
              className="border border-gray-300 rounded p-2"
              value={selectedProduct.name}
              onChange={(e) =>
                setSelectedProduct({ ...selectedProduct, name: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Price"
              className="border border-gray-300 rounded p-2"
              value={selectedProduct.price}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  price: parseFloat(e.target.value),
                })
              }
            />
            <input
              type="text"
              placeholder="Category"
              className="border border-gray-300 rounded p-2"
              value={selectedProduct.category}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  category: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="ABV"
              className="border border-gray-300 rounded p-2"
              value={selectedProduct.abv}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  abv: parseFloat(e.target.value),
                })
              }
            />
            <input
              type="text"
              placeholder="Size"
              className="border border-gray-300 rounded p-2"
              value={selectedProduct.size}
              onChange={(e) =>
                setSelectedProduct({ ...selectedProduct, size: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Origin"
              className="border border-gray-300 rounded p-2"
              value={selectedProduct.origin}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  origin: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Description"
              className="border border-gray-300 rounded p-2"
              value={selectedProduct.description}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  description: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Discount"
              className="border border-gray-300 rounded p-2"
              value={selectedProduct.discount}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  discount: parseFloat(e.target.value),
                })
              }
            />

            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
