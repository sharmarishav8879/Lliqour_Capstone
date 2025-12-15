"use client";
import React, { useState, useEffect } from "react";
import { UpdateProducts as updateProductInDB } from "@/lib/modifyProducts";

const categories = ["Whisky", "Vodka", "Wine", "Beer", "Rum", "Tequila"];
const countries = [
  "USA",
  "Canada",
  "UK",
  "France",
  "Germany",
  "Italy",
  "Spain",
  "Ireland",
  "Australia",
  "Mexico",
  "Brazil",
  "Japan",
  "China",
  "India",
  "Russia",
  "South Africa",
  "Belgium",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Poland",
  "Argentina",
];

export default function UpdateProducts({ product, onClose, onUpdated }) {
  const [formData, setFormData] = useState(product || {});

  useEffect(() => {
    if (product) setFormData(product);
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id) {
      alert("Product ID is missing, cannot update!");
      return;
    }

    try {
      const updatedData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        discount: parseFloat(formData.discount) || 0,
        image: formData.image || formData.imageUrl || "/placeholderProduct.jpg",
      };

      // Call your Firestore update function with the document ID
      await updateProductInDB(formData.id, updatedData);

      alert("Product updated successfully!");
      if (onUpdated) onUpdated(updatedData);
      onClose();
    } catch (err) {
      alert(`Failed to update product: ${err.message}`);
      console.error(err);
    }
  };

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative w-80 bg-white text-black font-serif rounded-2xl shadow-2xl z-20 p-5 max-h-[85vh] overflow-y-auto flex flex-col gap-3 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-center mb-2">Edit Product</h2>

        <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 rounded-lg"
            required
          />

          <input
            type="number"
            placeholder="Price"
            value={formData.price || ""}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            className="border p-2 rounded-lg"
            required
          />

          <select
            value={formData.category || ""}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="border p-2 rounded-lg"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="ABV"
            value={formData.abv || ""}
            onChange={(e) => setFormData({ ...formData, abv: e.target.value })}
            className="border p-2 rounded-lg"
          />

          <input
            type="text"
            placeholder="Size"
            value={formData.size || ""}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            className="border p-2 rounded-lg"
          />

          <select
            value={formData.origin || ""}
            onChange={(e) =>
              setFormData({ ...formData, origin: e.target.value })
            }
            className="border p-2 rounded-lg"
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Description"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="border p-2 rounded-lg min-h-[60px]"
          />

          <input
            type="number"
            placeholder="Discount"
            value={formData.discount || 0}
            onChange={(e) =>
              setFormData({
                ...formData,
                discount: parseFloat(e.target.value) || 0,
              })
            }
            className="border p-2 rounded-lg"
          />

          <input
            type="text"
            placeholder="Image URL"
            value={formData.image || "/placeholderProduct.jpg"}
            onChange={(e) =>
              setFormData({
                ...formData,
                image: e.target.value || "/placeholderProduct.jpg",
              })
            }
            className="border p-2 rounded-lg"
          />

          <button
            type="submit"
            className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Update Product
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
