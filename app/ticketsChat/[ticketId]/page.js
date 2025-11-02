//Prompt: "make me a basic [ticketsId] that matches my theme and displays both sides of the converstation" + also sending both contactUs and Account pages to work with and use logic from them to make it work with firebase and auth

"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUserAuth } from "../../auth/_util/auth-context";
import { db } from "../../auth/_util/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useTheme } from "@/components/ThemeToggle";

export default function TicketChat() {
  const params = useParams();
  const ticketId = params.ticketId;
  const { user, loading: authLoading } = useUserAuth();
  const router = useRouter();

  const [ticket, setTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchUserName = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserName(userDocSnap.data().name || user.email);
        } else {
          setUserName(user.email);
        }
      } catch (err) {
        console.error("Error fetching user name:", err);
        setUserName(user.email);
      }
    };

    const fetchTicket = async () => {
      try {
        const ticketRef = doc(db, "tickets", ticketId);
        const ticketSnap = await getDoc(ticketRef);

        if (!ticketSnap.exists()) {
          alert("Ticket not found");
          router.push("/account");
          return;
        }

        const ticketData = ticketSnap.data();

        if (!ticketData.canView.includes(user.uid)) {
          alert("You do not have permission to view this ticket.");
          router.push("/account");
          return;
        }

        setTicket({ id: ticketSnap.id, ...ticketData });
      } catch (err) {
        console.error("Error fetching ticket:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
    fetchTicket();
  }, [user, authLoading, router, ticketId]);

  const sendReply = async () => {
    if (!replyText.trim()) return;

    try {
      const ticketRef = doc(db, "tickets", ticketId);
      const newMessage = {
        senderId: user.uid,
        senderName: userName,
        message: replyText.trim(),
        timestamp: new Date(),
      };

      await updateDoc(ticketRef, {
        messages: arrayUnion(newMessage),
      });

      setTicket((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));
      setReplyText("");
    } catch (err) {
      console.error("Error sending reply:", err);
      alert("Failed to send message");
    }
  };

  if (loading)
    return <p className="text-black mt-40 text-center">Loading ticket...</p>;

  return (
    <main
      className={`${
        theme === "light" ? "bg-white" : "bg-gray-900"
      } min-h-screen pt-40 font-serif flex flex-col items-center px-4`}
    >
      <div
        className={`${
          theme === "light" ? "bg-gray-50 text-black" : "bg-gray-800 text-white"
        } w-full max-w-3xl rounded-2xl shadow-lg p-6 flex flex-col gap-6`}
      >
        <h1 className="text-3xl font-bold">{ticket.title}</h1>
        <p
          className={`text-sm ${
            theme === "light" ? "text-gray-500" : "text-gray-400"
          }`}
        >
          Status: {ticket.status}
        </p>

        {/* Messages */}
        <div className="flex flex-col gap-4 mt-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
          {ticket.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl max-w-[70%] ${
                msg.senderId === user.uid
                  ? "bg-orange-500 text-white self-end"
                  : theme === "light"
                  ? "bg-gray-200 text-black self-start"
                  : "bg-gray-700 text-white self-start"
              }`}
            >
              <p className="font-semibold">{msg.senderName}</p>
              <p className="mt-1">{msg.message}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.senderId === user.uid
                    ? "text-orange-100"
                    : theme === "light"
                    ? "text-gray-600"
                    : "text-gray-300"
                }`}
              >
                {msg.timestamp.toDate
                  ? msg.timestamp.toDate().toLocaleString()
                  : new Date(msg.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Input Field */}
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            placeholder="Type a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className={`flex-1 p-3 border rounded-xl outline-none ${
              theme === "light"
                ? "border-gray-400 bg-gray-100 text-black"
                : "border-gray-600 bg-gray-700 text-white"
            }`}
          />
          <button
            onClick={sendReply}
            className="px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-orange-500 to-amber-400 shadow-md hover:from-orange-600 hover:to-amber-500 transition-all duration-300"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
