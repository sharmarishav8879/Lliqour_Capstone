import { db } from "@/app/auth/_util/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function ViewReplies() {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const repliesSnapshot = await getDocs(collection(db, "replies"));
        const allReplies = repliesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReplies(allReplies);
      } catch (error) {
        alert(`Error fetching replies: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchReplies();
  }, []);

  if (loading) {
    return (
      <p className="text-2xl font-semibold mt-20 text-orange-500 font-serif text-center">
        Loading replies...
      </p>
    );
  }

  return (
    <div className="max-h-[600px] overflow-y-auto p-6 bg-gray-50 rounded-xl shadow-inner border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 font-serif text-center">
        📬 All Replies
      </h2>

      {replies.length === 0 ? (
        <p className="text-gray-500 text-lg text-center">No replies yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-gray-800 truncate mr-2">
                    {reply.userEmail}
                  </h3>
                  {reply.createdAt?.seconds && (
                    <span className="text-xs text-gray-400">
                      {new Date(
                        reply.createdAt.seconds * 1000
                      ).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
                  {reply.reply}
                </p>
                {reply.ticketId && (
                  <span className="text-xs text-gray-400 mt-1 ">
                    Ticket ID: {reply.ticketId}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
