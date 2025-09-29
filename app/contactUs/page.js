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
      <div className="w-full max-w-md bg-gray-50 rounded-2xl shadow-lg p-6 flex flex-col gap-6">
        <h1 className="text-5xl font-bold text-black text-center mt-10">
          Contact Us
        </h1>

        <p className="text-lg text-black text-center">
          Have questions or need assistance? <br /> Fill out the form below.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 w-full max-w-md"
        >
          <input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="p-3 border bg-white border-gray-400 rounded-4xl text-black px-5"
          />

          <input
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="p-3 border bg-white border-gray-400 rounded-4xl text-black px-5"
          />

          <textarea
            rows={5}
            placeholder="Type in your doubts or issues here..."
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="p-3 border bg-white border-gray-400 rounded-4xl text-black resize-none px-5"
          />

          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-4xl"
          >
            Submit
          </button>
        </form>
        <div className="w-full max-w-6xl text-black text-center">
          <h2
            onClick={() => setQuestion(!question)}
            className=" font-bold mb-6 cursor-pointer"
          >
            Frequently Asked Questions?
          </h2>
          {question && (
            <div>
              <ol className="list-disc list-inside  text-black text-lg">
                <li
                  onClick={() => toggleAnswer(1)}
                  className="mb-4 cursor-pointer text-orange-500"
                >
                  What is your return policy?
                </li>
                {answer === 1 && (
                  <p className="mb-4 text-black">
                    We accept returns within 30 days of purchase. Please ensure
                    the items are in their original condition.
                  </p>
                )}

                <li
                  onClick={() => toggleAnswer(2)}
                  className="mb-4 cursor-pointer text-orange-500"
                >
                  Do you offer international shipping?
                </li>
                {answer === 2 && (
                  <p className="mb-4 text-black">
                    Yes, we ship internationally. Shipping fees and delivery
                    times may vary.
                  </p>
                )}
                <li
                  onClick={() => toggleAnswer(3)}
                  className="mb-4 cursor-pointer text-orange-500"
                >
                  What payment methods do you accept?
                </li>
                {answer === 3 && (
                  <p className="mb-4 text-black">
                    We accept major credit cards, PayPal, and cash on delivery.
                  </p>
                )}
              </ol>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
