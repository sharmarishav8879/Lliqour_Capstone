"use client";
import { useState } from "react";
import { addProducts } from "@/lib/modifyProducts";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [abv, setAbv] = useState("");
  const [size, setSize] = useState("");
  const [origin, setOrigin] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("");

  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const id = name.toLowerCase().replace(/\s+/g, "-");

  const productData = {
    name: name,
    price: parseFloat(price),
    category: category,
    abv: parseFloat(abv), // Convert to float for abv,
    size: size,
    origin: origin,
    description: description,
    discount: parseFloat(discount), // Convert to float for discount
    slug: slug,
    id: id,
  };

  const handleAddProduct = async () => {
    try {
      await addProducts(productData);
      setName("");
      setPrice("");
      setCategory("");
      setAbv("");
      setSize("");
      setOrigin("");
      setDescription("");
      setDiscount("");
      alert("Product added successfully!");
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleAddProduct}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          type="text"
          placeholder="ABV"
          value={abv}
          onChange={(e) => setAbv(e.target.value)}
        />
        <input
          type="text"
          placeholder="Size"
          value={size}
          onChange={(e) => setSize(e.target.value)}
        />
        <input
          type="text"
          placeholder="Origin"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="Discount"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
        />
        <button type="submit">Add Product</button>
      </form>
    </div>
  );
}
