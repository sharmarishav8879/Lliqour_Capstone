"use client";

import { getAllProducts } from "@/lib/products";

import { useEffect, useState } from "react";
import { DeleteProducts as deleteProductInDB } from "@/lib/modifyProducts";

export default function DeleteProducts() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  useEffect(() => {
    const fetchProducts = async () => {
      const allProducts = await getAllProducts();
      setProducts(allProducts);
    };
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    if (!selectedProductId) {
      alert("Please select a product to delete.");
      return;
    }
    try {
      await deleteProductInDB(selectedProductId);
      alert("Product deleted successfully!");
      setSelectedProductId(null);

      const allProducts = await getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      alert(`Error deleting product: ${error.message}`);
    }
  };
  return (
    <div className="bg-white min-h-screen pt-40 font-serif flex flex-col items-center text-black">
      <h2>Delete Product</h2>
      <select
        value={selectedProductId}
        className="border border-gray-300 rounded p-2 w-1/2 mt-4"
        onChange={(e) => setSelectedProductId(e.target.value)}
      >
        <option value="">Select a product</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name}
          </option>
        ))}
      </select>
      <button
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        onClick={handleDelete}
      >
        Delete
      </button>
    </div>
  );
}
