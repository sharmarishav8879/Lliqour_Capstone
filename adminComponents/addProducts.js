"use client";
import React from "react";

const categories = ["Whisky", "Vodka", "Wine", "Beer", "Rum", "Tequila"];
const countries = [
  "United States", "Canada", "United Kingdom", "France", "Germany",
  "Italy", "Spain", "Ireland", "Australia", "Mexico", "Brazil", "Japan",
  "China", "India", "Russia", "South Africa", "Belgium", "Netherlands",
  "Sweden", "Norway", "Denmark", "Finland", "Poland", "Argentina"
];

export default function AddProduct({ productData, setProductData }) {
  const {
    name = "",
    price = "",
    category = "",
    abv = "",
    size = "",
    origin = "",
    description = "",
    discount = 0,
    imageUrl = "/placeholderProduct.jpg",
  } = productData || {};

  return (
    <>
      <input
        type="text"
        placeholder="Name (e.g. Glenfiddich 12 Year)"
        value={name}
        onChange={(e) =>
          setProductData({ ...productData, name: e.target.value })
        }
        className="border p-2 rounded-md"
      />

      <input
        type="number"
        placeholder="Price (e.g. 59.99)"
        value={price}
        onChange={(e) =>
          setProductData({ ...productData, price: e.target.value })
        }
        className="border p-2 rounded-md"
      />

      <select
        value={category}
        onChange={(e) =>
          setProductData({ ...productData, category: e.target.value })
        }
        className="border p-2 rounded-md"
      >
        <option value="">Select Category (e.g. Whisky)</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="ABV (e.g. 40%)"
        value={abv}
        onChange={(e) =>
          setProductData({ ...productData, abv: e.target.value })
        }
        className="border p-2 rounded-md"
      />

      <input
        type="text"
        placeholder="Size (e.g. 750ml)"
        value={size}
        onChange={(e) =>
          setProductData({ ...productData, size: e.target.value })
        }
        className="border p-2 rounded-md"
      />

      <select
        value={origin}
        onChange={(e) =>
          setProductData({ ...productData, origin: e.target.value })
        }
        className="border p-2 rounded-md"
      >
        <option value="">Select Country (e.g. Scotland)</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>

      <textarea
        placeholder="Description (e.g. A smooth, rich single malt whisky)"
        value={description}
        onChange={(e) =>
          setProductData({ ...productData, description: e.target.value })
        }
        className="border p-2 rounded-md"
      />

      <input
        type="text"
        placeholder="Discount (e.g. 10%, optional, default 0)"
        value={discount}
        onChange={(e) =>
          setProductData({ ...productData, discount: e.target.value || 0 })
        }
        className="border p-2 rounded-md"
      />

      <input
        type="text"
        placeholder="Image URL (optional, default /placeholderProduct.jpg)"
        value={imageUrl}
        onChange={(e) =>
          setProductData({
            ...productData,
            imageUrl: e.target.value || "/placeholderProduct.jpg",
          })
        }
        className="border p-2 rounded-md"
      />
    </>
  );
}
