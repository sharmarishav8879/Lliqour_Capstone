"use client";
import React, { useState } from "react";
import { AddProducts as addProductToDB } from "@/lib/modifyProducts";

const categories = ["Whisky", "Vodka", "Wine", "Beer", "Rum", "Tequila"];
const countries = [
  "United States","Canada","United Kingdom","France","Germany","Italy","Spain","Ireland","Australia",
  "Mexico","Brazil","Japan","China","India","Russia","South Africa","Belgium","Netherlands",
  "Sweden","Norway","Denmark","Finland","Poland","Argentina"
];

export default function AddProducts({ onClose, onAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    abv: "",
    size: "",
    origin: "",
    description: "",
    discount: 0,
    imageUrl: "/placeholderProduct.jpg",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const now = new Date();
      const generatedId = formData.name
        ? formData.name.toLowerCase().replace(/\s+/g, "-")
        : `product-${now.getTime()}`;

      const newProduct = {
        id: generatedId,
        slug: generatedId,
        name: formData.name || "Unnamed Product",
        category: formData.category || "Uncategorized",
        abv: formData.abv || "",
        size: formData.size || "",
        origin: formData.origin || "",
        description: formData.description || "",
        discount: Number(formData.discount) || 0,
        price: Number(formData.price) || 0,
        image: formData.imageUrl || "/placeholderProduct.jpg",
      };

      const addedDoc = await addProductToDB(newProduct);
      alert("Product added successfully!");
      if (onAdded) onAdded(addedDoc);
      onClose();
    } catch (err) {
      alert(`Failed to add product: ${err.message}`);
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative w-80 bg-white text-black font-serif rounded-2xl shadow-xl z-20 p-4 max-h-[80vh] overflow-y-auto flex flex-col gap-3">
        <h2 className="text-lg font-bold text-center mb-1">Add Product</h2>

        <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 rounded-lg"
            required
          />

          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="border p-2 rounded-lg"
            required
          />

          <select
            value={formData.category}
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
            value={formData.abv}
            onChange={(e) => setFormData({ ...formData, abv: e.target.value })}
            className="border p-2 rounded-lg"
          />

          <input
            type="text"
            placeholder="Size"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            className="border p-2 rounded-lg"
          />

          <select
            value={formData.origin}
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
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="border p-2 rounded-lg"
          />

          <input
            type="number"
            placeholder="Discount"
            value={formData.discount}
            onChange={(e) =>
              setFormData({ ...formData, discount: e.target.value })
            }
            className="border p-2 rounded-lg"
          />

          <input
            type="text"
            placeholder="Image URL"
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData({
                ...formData,
                imageUrl: e.target.value || "/placeholderProduct.jpg",
              })
            }
            className="border p-2 rounded-lg"
          />

          <button
            type="submit"
            className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Add Product
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
