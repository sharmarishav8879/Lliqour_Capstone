"use client";

import { db } from "@/app/auth/_util/firebase";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AnnouncementForm() {
  const [formData, setFormData] = useState({ title: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await addDoc(collection(db, "announcements"), {
        ...formData,
        createdAt: new Date(),
      });
      toast.success("Announcement added successfully!");
      setFormData({ title: "", message: "" });
    } catch (error) {
      toast.error("Failed to add announcement. Please try again.");
      console.error("Error adding announcement: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-2xl shadow-xl p-8 flex flex-col gap-5 transition-all duration-300 hover:shadow-2xl">
      <h2 className="text-3xl font-bold text-center text-orange-600">
        Add Announcement
      </h2>
      <p className="text-gray-500 text-center mb-2">
        Send a message or deal update to all users 📢
      </p>

      <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="border border-gray-300 rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-400"
        />

        <textarea
          placeholder="Message"
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          required
          rows={5}
          className="border border-gray-300 rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-400 resize-none"
        ></textarea>

        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-3 rounded-xl font-semibold text-white shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500"
          }`}
        >
          {loading ? "Sending..." : "Add Announcement"}
        </button>
      </form>
    </div>
  );
}
