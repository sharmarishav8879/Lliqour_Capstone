"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/app/auth/_util/firebase";
import Protected from "@/components/protected";
import ViewReplies from "@/adminComponents/viewReplies";

export default function CustomerSupport() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const complaintsSnapshot = await getDocs(
          collection(db, "contactMessages")
        );
        const customerComplaints = complaintsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComplaints(customerComplaints);
      } catch (error) {
        alert(`Error fetching complaints: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []); //

  if (loading) {
    return (
      <p className="text-4xl font-bold mt-30 text-orange-500 font-serif flex justify-center">
        Loading...
      </p>
    );
  }

  const handleTicketClicked = (complaint) => {
    setSelectedTicket(complaint);
  };

  const handleCloseTicket = () => {
    setSelectedTicket(null);
  };

  const handleSendTicket = async () => {
    if (reply === "") {
      alert("Reply cannot be empty");
      return;
    }
    try {
      const addedReply = await addDoc(collection(db, "replies"), {
        ticketId: selectedTicket.id,
        userEmail: selectedTicket.email,
        reply,
        createdAt: new Date(),
      });
      setReply("");
      alert("Reply sent!");
      setSelectedTicket(null);
    } catch (error) {
      alert(`Error sending reply: ${error.message}`);
      return;
    }
  };

  return (
    <Protected requiredRole="admin">
      <div className="w-full min-h-screen mt-25 p-6 text-black bg-white font-serif">
        <h1 className="text-4xl font-bold mb-6 text-black text-center">
          Customer Complaints
        </h1>
        <div className="absolute top-4 right-4 text-white  mt-25  cursor-pointer">
          {showReplies ? (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center z-50 font-serif">
              <ViewReplies />
              <button
                onClick={() => setShowReplies(false)}
                className="bg-white text-black hover:bg-gray-200 p-2 rounded cursor-pointer mt-2"
              >
                Close Replies
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowReplies(true)}
              className="bg-black p-2 rounded cursor-pointer"
            >
              View Replies
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-6 justify-center">
          {complaints.length === 0 ? (
            <p className="text-gray-500 text-lg">No complaints yet</p>
          ) : (
            complaints.map((complaint) => (
              <div
                onClick={() => handleTicketClicked(complaint)}
                key={complaint.id}
                className="bg-black border-2 border-orange-400 rounded-2xl shadow-lg p-4 min-w-[220px] max-w-[300px] hover:shadow-xl hover:scale-105 transition-transform duration-300"
              >
                <p className="text-lg font-semibold text-orange-400">
                  {complaint.name}
                </p>
                <p className="text-sm text-white mb-2">{complaint.email}</p>
                <p className="text-white">{complaint.message}</p>
              </div>
            ))
          )}
        </div>
        {selectedTicket && (
          <div onClick={handleCloseTicket}>
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 font-serif">
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-[90%] md:w-[500px] p-6 relative "
              >
                <div className="bg-black p-8 rounded w-full mt-15 font-serif text-orange-500">
                  {" "}
                  <p>Name: {selectedTicket.name}</p>
                  <p>Email: {selectedTicket.email}</p>
                  <p>Message: {selectedTicket.message}</p>
                </div>

                <input
                  type="text"
                  placeholder="Reply"
                  onChange={(e) => setReply(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 mt-2 mb-2 w-full"
                />
                <button className="mt-4" onClick={handleSendTicket}>
                  <span className="text-gray-600 bg-white border border-gray-500 hover:bg-gray-100 cursor-pointer px-4 py-2 rounded mt-4">
                    Send
                  </span>
                </button>
                <button
                  onClick={handleCloseTicket}
                  className="bg-black text-orange-500 absolute top-2 right-2  px-4 py-2 rounded mt-4"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Protected>
  );
}
