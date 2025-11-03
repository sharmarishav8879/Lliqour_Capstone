import { db } from "@/app/auth/_util/firebase";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MailboxDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [mailboxMessages, setMailboxMessages] = useState([]);
  const [unReadMessages, setUnReadMessages] = useState(0);

  useEffect(() => {
    try {
      const q = query(
        collection(db, "announcements"),
        orderBy("createdAt", "desc"),
        limit(2)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMailboxMessages(messages);

        const readIds = JSON.parse(
          localStorage.getItem("readAnnouncements") || "[]"
        );
        const unreadCount = messages.filter(
          (msg) => !readIds.includes(msg.id)
        ).length;
        setUnReadMessages(unreadCount);
        return () => unsubscribe();
      });
    } catch (error) {
      console.error("Error fetching mailbox messages: ", error);
      toast.error("Failed to load mailbox messages.");
    }
  }, []);

  const markAllAsRead = () => {
    const allIds = mailboxMessages.map((msg) => msg.id);
    localStorage.setItem("readAnnouncements", JSON.stringify(allIds));
    setUnReadMessages(0);
  };

  return (
    <div>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) markAllAsRead();
        }}
        className="relative p-2"
      >
        <Mail className="w-7 h-7 text-gray-900" />
        {unReadMessages > 0 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full">
            {unReadMessages.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50">
          <h3 className="font-semibold text-gray-800 mb-2">
            Latest Announcements
          </h3>
          {mailboxMessages.length === 0 ? (
            <p className="text-gray-500 text-sm">No announcements yet.</p>
          ) : (
            <ul className="space-y-3 max-h-64 overflow-y-auto">
              {mailboxMessages.map((a) => (
                <li
                  key={a.id}
                  className="border-b pb-2 last:border-none text-sm text-gray-700"
                >
                  <p className="font-bold text-orange-500">{a.title}</p>
                  <p className="text-gray-900 line-clamp-2 hover:line-clamp-none">
                    {a.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
