"use client";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { db } from "../auth/_util/firebase";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [question, setQuestion] = useState(false);
  const [answer, setAnswer] = useState("");

  // Prompt: how to create a toggle function in react that toggles the state of a variable between an index value and an empty string
  const toggleAnswer = (idx) => {
    if (answer === idx) {
      setAnswer("");
    } else {
      setAnswer(idx);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      const docRef = await addDoc(collection(db, "contactMessages"), {
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });
      alert("Problem reported successfully!");

      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      alert(`Error sending message:  ${error.message}`);
    }
  };

  return (
    <main className="bg-white min-h-screen pt-40 font-serif flex flex-col items-center">
      <h1 className="text-7xl font-bold text-black text-center mb-12">
        Contact Us
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-full max-w-md"
      >
        <input
          type="text"
          placeholder="Your Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="p-3 border border-gray-400 rounded text-black"
        />

        <input
          type="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="p-3 border border-gray-400 rounded text-black"
        />

        <textarea
          rows={5}
          placeholder="Type in your doubts or issues here..."
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          className="p-3 border border-gray-400 rounded text-black resize-none"
        />

        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded"
        >
          Submit
        </button>
      </form>
      <div className="w-full max-w-6xl mt-12 text-black text-center">
        <h2
          onClick={() => setQuestion(!question)}
          className=" font-bold mb-6 cursor-pointer"
        >
          Frequently Asked Questions
        </h2>
        {question && (
          <div>
            <ol className="list-disc list-inside  text-black text-lg">
              <li
                onClick={() => toggleAnswer(1)}
                className="mb-4 cursor-pointer text-red-400"
              >
                What is your return policy?
              </li>
              {answer === 1 && (
                <p className="mb-4 text-green-400">
                  We accept returns within 30 days of purchase. Please ensure
                  the items are in their original condition.
                </p>
              )}

              <li
                onClick={() => toggleAnswer(2)}
                className="mb-4 cursor-pointer text-red-400"
              >
                Do you offer international shipping?
              </li>
              {answer === 2 && (
                <p className="mb-4 text-green-400">
                  Yes, we ship internationally. Shipping fees and delivery times
                  may vary.
                </p>
              )}
              <li
                onClick={() => toggleAnswer(3)}
                className="mb-4 cursor-pointer text-red-400"
              >
                What payment methods do you accept?
              </li>
              {answer === 3 && (
                <p className="mb-4 text-green-400">
                  We accept major credit cards, PayPal, and cash on delivery.
                </p>
              )}
            </ol>
          </div>
        )}
      </div>
      <footer className="w-full bg-black text-orange-500 py-6 mt-20">
        <div className="max-w-6xl mx-auto text-center flex flex-row justify-between  px-4">
          <div>
            <p>Contact Us: +1 (123) 456-7890</p>
            <p>Email: support@legacyl liquor.com</p>
            <p>Address: 123 Liquor St, Beverage City, USA</p>
          </div>
          <div>
            <p>Legacy Liquor, your trusted online liquor store.</p>
            &copy; {new Date().getFullYear()} Legacy Liquor. All rights
            reserved.
          </div>
          <div>
            <p>Follow us on social media for the latest updates!</p>
            <div className="flex space-x-4 justify-center mt-2">
              <a href="#" className="hover:text-white">
                Facebook
              </a>
              <a href="#" className="hover:text-white">
                Twitter
              </a>
              <a href="#" className="hover:text-white">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
