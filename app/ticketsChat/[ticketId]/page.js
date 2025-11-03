//Prompt: "make me a basic [ticketsId] that matches my theme and displays both sides of the converstation" + also sending both contactUs and Account pages to work with and use logic from them to make it work with firebase and auth

"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUserAuth } from "../../auth/_util/auth-context";
import { db } from "../../auth/_util/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  deleteDoc,
} from "firebase/firestore";
import { IoMdRefresh } from "react-icons/io";
import { MdOutlineSaveAlt } from "react-icons/md";
import { TbCancel } from "react-icons/tb";
import { MdModeEditOutline } from "react-icons/md";

export default function TicketChat() {
  const params = useParams();
  const ticketId = params.ticketId;
  const { user, loading: authLoading } = useUserAuth();
  const router = useRouter();

  const [ticket, setTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("user");
  const [ticketDeleted, setTicketDeleted] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    if (!loading && ticketDeleted) {
      router.push("/contactUs");
    }
  }, [loading, ticketDeleted, router]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUserName(data.name || user.email);
          setRole(data.role || "user");
        } else {
          setUserName(user.email);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setUserName(user.email);
      }
    };

    const fetchTicket = async () => {
      try {
        const ticketRef = doc(db, "tickets", ticketId);
        const ticketSnap = await getDoc(ticketRef);

        if (!ticketSnap.exists()) {
          setTicketDeleted(true);
          return;
        }

        const ticketData = ticketSnap.data();

        const canView = Array.isArray(ticketData.canView)
          ? ticketData.canView
          : [];

        if (!canView.includes(user.uid) && ticketData.createdBy !== user.uid) {
          alert("You do not have permission to view this ticket.");
          router.push("/account");
          return;
        }

        setTicket({ id: ticketSnap.id, ...ticketData });
      } catch (err) {
        console.error("Error fetching ticket:", err);
        setTicketDeleted(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData().then(fetchTicket);

    const interval = setInterval(fetchTicket, 5000);
    return () => clearInterval(interval);
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

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleCloseTicket = async () => {
    if (!ticket?.id) return;
    if (!confirm("Are you sure you want to close this ticket?")) return;

    try {
      const ticketRef = doc(db, "tickets", ticket.id);
      await deleteDoc(ticketRef);
      alert("Ticket closed successfully!");
      router.push("/contactUs");
    } catch (err) {
      console.error("Error closing ticket:", err);
      alert("Failed to close ticket.");
    }
  };

  if (loading || ticketDeleted) {
    return <p className="text-black mt-40 text-center">Loading ticket...</p>;
  }

  return (
    <main className="bg-white min-h-screen pt-40 font-serif flex flex-col items-center px-4">
      <div className="w-full max-w-3xl bg-gray-50  shadow-lg p-6 flex flex-col gap-6 rounded-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {role === "admin" && isEditingTitle ? (
              <>
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="text-3xl font-bold flex-1 py-2 px-3 border border-gray-400 rounded-4xl"
                />
                <button
                  onClick={async () => {
                    try {
                      const ticketRef = doc(db, "tickets", ticket.id);
                      await updateDoc(ticketRef, { title: editingTitle });
                      setTicket((prev) => ({ ...prev, title: editingTitle }));
                      setIsEditingTitle(false);
                      alert("Ticket name updated successfully!");
                    } catch (err) {
                      console.error("Error updating ticket title:", err);
                      alert("Failed to update ticket title.");
                    }
                  }}
                  className="p-2 rounded-4xl font-medium text-white bg-green-500 hover:bg-green-600 transition-all duration-300 flex items-center gap-2"
                >
                  <MdOutlineSaveAlt size={20} />
                </button>

                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="p-2 rounded-4xl font-medium text-white bg-gray-400 hover:bg-gray-500 transition-all duration-300 flex items-center gap-2"
                >
                  <TbCancel size={20} />
                </button>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold text-black">
                  {ticket.title}
                </h1>
                {role === "admin" && (
                  <button
                    onClick={() => {
                      setEditingTitle(ticket.title);
                      setIsEditingTitle(true);
                    }}
                    className="p-2 rounded-4xl text-white bg-gradient-to-r from-orange-500 to-amber-400 shadow-md hover:from-orange-600 hover:to-amber-500 transition-all duration-300 flex items-center justify-center"
                  >
                    <MdModeEditOutline size={20} />
                  </button>
                )}
              </>
            )}
          </div>

          <button
            onClick={handleRefresh}
            title="Refresh ticket"
            className="p-2 rounded-full text-black hover:text-orange-500 transition-colors duration-200"
          >
            <IoMdRefresh size={26} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">
            Status:{" "}
            <span
              className={`font-semibold ${
                ticket.status === "Closed" ? "text-red-600" : "text-green-600"
              }`}
            >
              {ticket.status}
            </span>
          </p>

          {role === "admin" && ticket.status !== "Closed" && (
            <button
              onClick={handleCloseTicket}
              className="text-sm px-3 py-1 bg-red-500 text-white rounded-4xl hover:bg-red-600 transition-all duration-300"
            >
              Close Ticket
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4 mt-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
          {ticket.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl max-w-[70%] ${
                msg.senderId === user.uid
                  ? "bg-orange-500 text-white self-end"
                  : "bg-gray-200 text-black self-start"
              }`}
            >
              <p className="font-semibold">{msg.senderName}</p>
              <p className="mt-1">{msg.message}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.senderId === user.uid
                    ? "text-orange-100"
                    : "text-gray-600"
                }`}
              >
                {msg.timestamp.toDate
                  ? msg.timestamp.toDate().toLocaleString()
                  : new Date(msg.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <input
            type="text"
            placeholder="Type a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1 p-3 border border-gray-400 rounded-4xl"
          />
          <button
            onClick={sendReply}
            className="px-6 py-3 rounded-4xl font-medium text-white bg-gradient-to-r from-orange-500 to-amber-400 shadow-md hover:from-orange-600 hover:to-amber-500 transition-all duration-300"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
