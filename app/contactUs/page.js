"use client";
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../auth/_util/firebase";
import { useUserAuth } from "../auth/_util/auth-context";
import NotificationBell from "@/components/notificationBell";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [question, setQuestion] = useState(false);
  const [answer, setAnswer] = useState("");
  const { user } = useUserAuth();
  const [tickets, setTickets] = useState([]);
  const [ticketResponse, setTicketResponse] = useState([]);
  const [showTicketResponse, setShowTicketResponse] = useState(false);
  const [showTickets, setShowTickets] = useState(false);
  const [hasNewTicket, setHasNewTicket] = useState(false);

  // Prompt: how to create a toggle function in react that toggles the state of a variable between an index value and an empty string
  const toggleAnswer = (idx) => {
    if (answer === idx) {
      setAnswer("");
    } else {
      setAnswer(idx);
    }
  };

  // Notification bell for new ticket responses

  useEffect(() => {
    if (!user) {
      setHasNewTicket(false);
      return;
    }

    const q = query(
      collection(db, "replies"),
      where("userEmail", "==", user.email)
    );

    let initialLoad = true;
    let previousCount = [];

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const currentCount = snapshot.docs.map((doc) => doc.id);
      if (!initialLoad) {
        const newReplies = currentCount.filter(
          (id) => !previousCount.includes(id)
        );
        if (newReplies.length > 0) {
          setHasNewTicket(true);
        }
      }
      previousCount = currentCount;
      initialLoad = false;
    });

    return () => unsubscribe();
  }, [user]);

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

  const fetchTickets = async () => {
    if (!user) {
      alert("You need to be logged in to view your tickets.");
      return;
    }

    try {
      const ticketQuery = query(
        collection(db, "contactMessages"),
        where("email", "==", user.email)
      );
      const querySnapshot = await getDocs(ticketQuery);
      const userTickets = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTickets(userTickets);
    } catch (error) {
      alert(`Error fetching tickets: ${error.message}`);
    }
  };

  const fetchTicketResponses = async () => {
    if (!user) {
      alert("You need to be logged in to view your ticket responses.");
      return;
    }

    try {
      const ticketResponseQuery = query(
        collection(db, "replies"),
        where("userEmail", "==", user.email)
      );
      const querySnapshot = await getDocs(ticketResponseQuery);
      const responses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTicketResponse(responses);
      setHasNewTicket(false);
    } catch (error) {
      alert(`Error fetching ticket responses: ${error.message}`);
    }
  };

  return (
    <main className="bg-white min-h-screen pt-40 font-serif flex flex-col items-center">
      {user && (
        <div>
          <div className="fixed top-9  right-45 z-50">
            <NotificationBell
              hasNewTicketProp={hasNewTicket}
              onClickProp={() => {
                setHasNewTicket(false);
              }}
            />
          </div>
          <div className="w-full absolute top-28 right-3 max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-6 flex flex-col items-center gap-4 transition-all duration-300 hover:shadow-2xl">
            <p className="text-lg text-gray-700 mb-2">
              View previous tickets of{" "}
              <span className="font-bold text-orange-500">{user.email}</span>
            </p>

            <button
              onClick={() => {
                fetchTickets();
                setShowTickets(!showTickets);
              }}
              className="px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-orange-500 to-amber-400 shadow-md hover:from-orange-600 hover:to-amber-500 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              {showTickets ? "Hide Tickets" : "Show Tickets"}
            </button>
            {showTickets && (
              <div className="w-full max-h-60 overflow-y-auto mt-4">
                {tickets.length === 0 ? (
                  <p className="text-gray-500 text-center">No messages yet.</p>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white border border-gray-200 rounded-2xl shadow-md p-4 mb-4 flex flex-col gap-2"
                    >
                      <p className="text-gray-800">
                        <span className="font-bold">Message:</span>{" "}
                        {ticket.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="w-full absolute top-28 left-3 max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-6 flex flex-col items-center gap-4 transition-all duration-300 hover:shadow-2xl">
            <p className="text-lg text-gray-700 mb-2">
              View ticket responses for
              <span className="font-bold text-orange-500"> {user.email}</span>
            </p>
            <button
              onClick={() => {
                fetchTicketResponses();
                setShowTicketResponse(!showTicketResponse);
              }}
              className="px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-orange-500 to-amber-400 shadow-md hover:from-orange-600 hover:to-amber-500 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              {showTicketResponse
                ? "Hide Ticket Responses"
                : "Show Ticket Responses"}
            </button>

            {showTicketResponse && (
              <div className="w-full max-h-60 overflow-y-auto mt-4">
                {ticketResponse.length === 0 ? (
                  <p className="text-gray-500 text-center">No responses yet.</p>
                ) : (
                  ticketResponse.map((response) => (
                    <div
                      key={response.id}
                      className="bg-white border border-gray-200 rounded-2xl shadow-md p-4 mb-4 flex flex-col gap-2"
                    >
                      <p className="text-gray-800">
                        <span className="font-bold">Reply Received:</span>{" "}
                        {response.reply}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
            className="px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-orange-500 to-amber-400 shadow-md hover:from-orange-600 hover:to-amber-500 transition-all duration-300 transform hover:scale-105 active:scale-95"
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
