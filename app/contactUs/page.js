"use client";
import { useState } from "react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isOpen, setIsOpen] = useState(false);

  const toggleSelected = () => {
    setIsOpen(!isOpen);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all fields.");
      return;
    }
    console.log("Form submitted:", formData);
    alert("Thank you for contacting us! We will get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };
  return (
    <main className="bg-gray-100 min-h-screen mt-20 relative flex flex-col">
      <div className="flex flex-col items-center justify-center font-serif p-6">
        <h1 className="text-4xl font-bold mt-2 text-orange-500 font-serif">
          Contact Us
        </h1>
        <p className="mt-2 text-lg text-black">
          Have any questions or concerns? Please fill out the form below.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center justify-center gap-4 p-6  font-serif"
      >
        <input
          type="text"
          placeholder="Your Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="p-2 border border-gray-700 rounded text-black"
        />

        <input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="p-2 border border-gray-700 rounded text-black"
        />

        <textarea
          rows="4"
          cols="50"
          type="text"
          placeholder="Your Message"
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          className="p-2 border border-gray-700 rounded text-black"
        />

        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded mt-4"
        >
          Submit
        </button>
      </form>
      <div className="flex flex-col items-center justify-center font-serif p-6 text-black font-bold cursor-pointer">
        <p onClick={toggleSelected}> Frequently Asked Questions </p>
        <div
          className={`bg-white p-4 rounded shadow-md mt-4 w-full max-w-2xl ${
            isOpen ? "" : "hidden"
          }`}
        >
          <ul className="list-disc list-inside">
            <li> How do I place an order? </li>
            <li> What payment methods are accepted? </li>
            <li> What is the delivery process? </li>
            <li> What is the return policy? </li>
          </ul>
        </div>
      </div>
      <footer
        className={`flex absolute flex-col bottom-0 justify-center w-full font-serif  text-orange-500 gap-4 p-6 ${
          isOpen ? "hidden" : ""
        }`}
      >
        <div>
          <div className="text-2xl flex flex-row gap-4 items-center justify-center">
            <p>156 SpringBluff Drive, Calgary, AB, Canada |</p>
            <p>Email: skLiquor2019@.com |</p>
            <p>Phone: +1 403-555-0123</p>
          </div>

          <p className="text-center font-bold">
            Business Hours: Mon-Fri 9am - 9pm, Sat-Sun 10am - 6pm
          </p>
        </div>
      </footer>
    </main>
  );
}
