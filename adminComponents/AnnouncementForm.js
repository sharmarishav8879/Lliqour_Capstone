"use client";

import { db } from "@/app/auth/_util/firebase";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTheme } from "@/components/ThemeToggle";

export default function AnnouncementForm() {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "",
    expiryDate: "",
  });
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.message || !formData.type) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "announcements"), {
        ...formData,
        createdAt: new Date(),
      });
      toast.success("Announcement added successfully!");
      setFormData({ title: "", message: "", type: "", expiryDate: "" });
    } catch (error) {
      toast.error("Failed to add announcement. Please try again.");
      console.error("Error adding announcement: ", error);
    } finally {
      setLoading(false);
    }
  };

  const containerBase = `w-full max-w-md mt-20 rounded-2xl shadow-xl p-8 flex flex-col gap-5 transition-all duration-300 hover:shadow-2xl 
    `;
  const containerTheme =
    theme === "light"
      ? "bg-gray-50 border border-gray-200 text-gray-900"
      : "bg-gray-900 border border-gray-700 text-gray-100";

  const inputBase =
    "rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-400";
  const inputTheme =
    theme === "light"
      ? "border border-gray-300 bg-gray-50 text-gray-900"
      : "border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500";

  const smallInputBase = "rounded-lg p-2";
  const smallInputTheme =
    theme === "light"
      ? "border border-gray-300 bg-gray-50 text-gray-950"
      : "border border-gray-700 bg-gray-800 text-gray-100";

  const labelTheme = theme === "light" ? "text-gray-950" : "text-gray-200";

  const paragraphTheme = theme === "light" ? "text-gray-500" : "text-gray-300";

  const loadingBtn =
    theme === "light"
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-gray-600 cursor-not-allowed";

  return (
    <div className={`${containerBase} ${containerTheme}`}>
      <h2
        className={`text-3xl font-bold text-center ${
          theme === "light" ? "text-orange-600" : "text-orange-400"
        }`}
      >
        Add Announcement
      </h2>

      <p className={`${paragraphTheme} text-center mb-2`}>
        Send a message or deal update to all users 📢
      </p>

      <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className={`${inputBase} ${inputTheme}`}
        />

        <textarea
          placeholder="Message"
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          required
          rows={5}
          className={`${inputBase} ${inputTheme} resize-none`}
        ></textarea>

        <input
          type="date"
          value={formData.expiryDate || ""}
          onChange={(e) =>
            setFormData({ ...formData, expiryDate: e.target.value })
          }
          required
          className={`${smallInputBase} ${smallInputTheme}`}
        />

        <label className={labelTheme}>Select Announcement Type</label>
        <select
          value={formData.type}
          className={`${smallInputBase} ${smallInputTheme}`}
          onChange={(e) =>
            setFormData({ ...formData, type: e.target.value.toLowerCase() })
          }
        >
          <option value="" disabled={formData.type !== ""}>
            Select Type
          </option>
          <option value="banner">Banner</option>
          <option value="announcement">Announcement</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className={
            loading
              ? `px-6 py-3 rounded-xl font-semibold text-white shadow-md transition-all duration-300 transform active:scale-95 ${loadingBtn}`
              : "px-6 py-3 rounded-xl font-semibold text-white shadow-md bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 transition-all duration-300 transform hover:scale-105 active:scale-95"
          }
        >
          {loading ? "Sending..." : "Add Announcement"}
        </button>
      </form>
    </div>
  );
}
