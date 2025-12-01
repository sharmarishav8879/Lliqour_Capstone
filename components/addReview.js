"use client";

import { useState } from "react";
import { FaStar, FaStarHalf, FaRegStar } from "react-icons/fa";
import { AddReviewToProduct } from "@/lib/modifyProducts";

export const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push(<FaStar key={i} className="text-yellow-500" />);
    else if (rating >= i - 0.5)
      stars.push(<FaStarHalf key={i} className="text-yellow-500" />);
    else stars.push(<FaRegStar key={i} className="text-yellow-500" />);
  }
  return <div className="flex mt-1">{stars}</div>;
};

export const InfoCard = ({ title, date, description, starScore }) => (
  <div className="p-4 bg-white border rounded-4xl shadow-sm px-5 mt-2 mb-2">
    <p className="font-medium text-black">{title}</p>
    <StarRating rating={starScore} />
    <p className="text-sm text-gray-500">{date}</p>
    {description && <p className="mt-2 text-sm text-gray-700">{description}</p>}
  </div>
);

export default function AddReview({ onClose, productId }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    starScore: 0,
  });

  const [reviews, setReviews] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return alert("Title required");
    if (!formData.description.trim()) return alert("Description required");
    if (formData.starScore < 0.5 || formData.starScore > 5)
      return alert("Star score must be between 0.5 and 5");

    const newReview = {
      id: crypto.randomUUID(),
      title: formData.title,
      description: formData.description,
      starScore: Number(formData.starScore),
      date: new Date().toISOString().split("T")[0],
    };

    try {
      await AddReviewToProduct(productId, newReview);

      setReviews([newReview, ...reviews]);

      setFormData({ title: "", description: "", starScore: 0 });

      onClose();
      window.location.reload();

    } catch (error) {
      console.error("Failed to add review:", error);
      alert("Failed to add review. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative w-80 bg-white text-black font-serif rounded-2xl shadow-xl z-20 p-4 max-h-[80vh] overflow-y-auto flex flex-col gap-3">
        <h2 className="text-lg font-bold text-center mb-2">Add Review</h2>

        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Review Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="border p-2 rounded-lg"
            required
          />

          <textarea
            placeholder="Write your review..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="border p-2 rounded-lg"
            required
          />

          <input
            type="number"
            placeholder="Star Score (1–5)"
            value={formData.starScore}
            onChange={(e) => setFormData({ ...formData, starScore: e.target.value })}
            className="border p-2 rounded-lg"
            min="0.5"
            max="5"
            step="0.5"
            required
          />

          <button
            type="submit"
            className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Add Review
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
