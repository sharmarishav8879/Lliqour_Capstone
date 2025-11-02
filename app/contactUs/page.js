"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "../auth/_util/auth-context";
import { doc, getDoc, addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../auth/_util/firebase";
import { useTheme } from "@/components/ThemeToggle";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [question, setQuestion] = useState(false);
  const [answer, setAnswer] = useState("");
  const router = useRouter();
  const { user, authLoading } = useUserAuth();

  const [tickets, setTickets] = useState([]);
  const [replyText, setReplyText] = useState("");

  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [userId, setUserId] = useState("");
  const alertShownRef = useRef(false);
  const { theme } = useTheme();

  const adminUID = "lQ3AfTMA1zVmI8YATtQQNfsZaGb2";

  useEffect(() => {
    if (authLoading) return;

    if (!user && !alertShownRef.current) {
      alertShownRef.current = true;
      alert("Please log in to access the Contact Us page.");
      router.push("/auth/login");
      return;
    } else {
      alertShownRef.current = false;
    }

    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setName(userData.name || "");
          setRole(userData.role || "user");
          setUserId(user.uid);

          setFormData((prevData) => ({
            ...prevData,
            name: userData.name || "",
            email: userData.email || "",
          }));
        } else {
          console.log("No such user document for UID: ", user.uid);
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    const fetchTickets = async () => {
      if (role !== "admin") return;

      const snapshot = await getDocs(collection(db, "tickets"));
      setTickets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchUserData().then(fetchTickets);
  }, [user, authLoading, router, role]);

  const toggleAnswer = (index) => {
    setAnswer((prevAnswer) => (prevAnswer === index ? "" : index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all fields.");
      return;
    }

    if (!user) {
      alert("You must be logged in to submit a ticket.");
      return;
    }

    try {
      await addDoc(collection(db, "tickets"), {
        title: `Contact Us Message from ${formData.name}`,
        createdBy: user.uid,
        canView: [user.uid, adminUID],
        messages: [
          {
            senderId: user.uid,
            senderName: formData.name,
            message: formData.message,
            timestamp: new Date(),
          },
        ],
        status: "open",
        createdAt: new Date(),
      });

      alert("Your message has been submitted!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error submitting message: ", error);
      alert("There was an error submitting your message. Please try again.");
    }
  };

  return (
    <main
      className={`${
        theme === "light" ? "bg-white" : "bg-gray-900"
      } min-h-screen pt-30 font-serif flex flex-col items-center`}
    >
      {user && role === "user" ? (
        <div
          className={`${
            theme === "light"
              ? "bg-gray-50 text-black"
              : "bg-gray-800 text-white"
          } w-full max-w-md rounded-2xl shadow-lg p-6 flex flex-col gap-6`}
        >
          <h1 className="text-5xl font-bold text-center">Contact Us</h1>

          <p className="text-lg text-center">
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
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`${
                theme === "light"
                  ? "bg-gray-100 text-black border-gray-400"
                  : "bg-gray-700 text-white border-gray-600"
              } p-3 border rounded-4xl px-5`}
            />

            <input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`${
                theme === "light"
                  ? "bg-gray-100 text-black border-gray-400"
                  : "bg-gray-700 text-white border-gray-600"
              } p-3 border rounded-4xl px-5`}
            />

            <textarea
              rows={5}
              placeholder="Type in your doubts or issues here..."
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className={`${
                theme === "light"
                  ? "bg-gray-100 text-black border-gray-400"
                  : "bg-gray-700 text-white border-gray-600"
              } p-3 border rounded-4xl resize-none px-5`}
            />

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-orange-500 to-amber-400 shadow-md hover:from-orange-600 hover:to-amber-500 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Submit
            </button>
          </form>

          <div className="w-full max-w-6xl text-center">
            <h2
              onClick={() => setQuestion(!question)}
              className="font-bold mb-6 cursor-pointer"
            >
              Frequently Asked Questions?
            </h2>

            {question && (
              <div>
                <ol className="list-disc list-inside text-lg">
                  <li
                    onClick={() => toggleAnswer(1)}
                    className="mb-4 cursor-pointer text-orange-500"
                  >
                    What is your return policy?
                  </li>
                  {answer === 1 && (
                    <p
                      className={`${
                        theme === "light" ? "text-black" : "text-gray-200"
                      } mb-4`}
                    >
                      We accept returns within 30 days of purchase. Please
                      ensure the items are in their original condition.
                    </p>
                  )}

                  <li
                    onClick={() => toggleAnswer(2)}
                    className="mb-4 cursor-pointer text-orange-500"
                  >
                    Do you offer international shipping?
                  </li>
                  {answer === 2 && (
                    <p
                      className={`${
                        theme === "light" ? "text-black" : "text-gray-200"
                      } mb-4`}
                    >
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
                    <p
                      className={`${
                        theme === "light" ? "text-black" : "text-gray-200"
                      } mb-4`}
                    >
                      We accept major credit cards, PayPal, and cash on
                      delivery.
                    </p>
                  )}
                </ol>
              </div>
            )}
          </div>
        </div>
      ) : (
        user &&
        role === "admin" && (
          <div className="w-full max-w-6xl flex flex-col items-center gap-6">
            <h1
              className={`${
                theme === "light" ? "text-black" : "text-white"
              } text-5xl font-bold text-center mt-10`}
            >
              Admin Ticket Panel
            </h1>

            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/ticketsChat/${ticket.id}`}
                className={`${
                  theme === "light"
                    ? "bg-gray-50 text-black"
                    : "bg-gray-800 text-white"
                } w-full rounded-2xl shadow-lg p-6 flex flex-col gap-4 hover:shadow-2xl transition-shadow duration-300`}
              >
                <h2 className="font-bold text-xl">{ticket.title}</h2>
                <p className="text-sm">Created by: {ticket.createdBy}</p>

                <div
                  className={`${
                    theme === "light" ? "bg-gray-100" : "bg-gray-700"
                  } p-3 rounded-lg max-h-64 overflow-y-auto`}
                >
                  {ticket.messages.slice(-3).map((msg, i) => (
                    <div key={i} className="mb-2">
                      <p className="font-bold">{msg.senderName}:</p>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(
                          msg.timestamp?.seconds * 1000 || msg.timestamp
                        ).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {ticket.messages.length > 3 && (
                    <p className="text-gray-500 text-xs mt-1">
                      ...see full conversation
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </main>
  );
}
