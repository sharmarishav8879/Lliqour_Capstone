"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/auth/_util/firebase";
import Protected from "@/components/protected";

export default function CustomerSupport() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Protected requiredRole="admin">
      <div className="w-full min-h-screen mt-25 p-6 text-black bg-white font-serif">
        <h1 className="text-4xl font-bold mb-6 text-black text-center">
          Customer Complaints
        </h1>

        <div className="flex flex-wrap gap-6 justify-center">
          {complaints.length === 0 ? (
            <p className="text-gray-500 text-lg">No complaints yet</p>
          ) : (
            complaints.map((complaint) => (
              <div
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
      </div>
    </Protected>
  );
}
