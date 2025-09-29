"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useUserAuth } from "../auth/_util/auth-context";
import { db } from "../auth/_util/firebase";
import { HiOutlineCog } from "react-icons/hi";

export default function Profile() {
  const { user, loading: authLoading, firebaseSignOut } = useUserAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const handleSignOut = async () => {
    try {
      await firebaseSignOut();
      router.push("/auth/login");
    } catch (error) {
      alert("Error signing out: " + error.message);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setName(userData.name);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">

      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen flex flex-col items-center justify-start px-4 pt-40 font-serif">
      <div className="w-full max-w-md bg-gray-50 rounded-2xl shadow-lg p-6 flex flex-col gap-6">
        {user && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-300 rounded-full overflow-hidden">
              </div>

              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-black">
                  {name || "No Name"}
                </h1>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <button
                onClick={handleSignOut}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-4xl transition duration-300"
              >
                Sign Out
              </button>

              <button
                onClick={() => router.push("/account/settings")}
                className="mt-2 flex items-center gap-2 text-gray-600 hover:text-black transition duration-300"
              >
                <HiOutlineCog size={24} />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 mt-6">
          <h2 className="text-2xl font-semibold text-black border-b pb-2">
            Current Orders
          </h2>

          <div className="flex flex-col gap-3">
            <div className="p-4 bg-white border rounded-4xl shadow-sm px-5">
              <p className="font-medium text-gray-800">Order #12345</p>
              <p className="text-sm text-gray-500">Placed on: 2025-09-01</p>
            </div>
            <div className="p-4 bg-white border rounded-4xl shadow-sm px-5">
              <p className="font-medium text-gray-800">Order #12346</p>
              <p className="text-sm text-gray-500">Placed on: 2025-09-05</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-6">
          <h2 className="text-2xl font-semibold text-black border-b pb-2">
            Order History
          </h2>

          <div className="flex flex-col gap-3">
            <div className="p-4 bg-white border rounded-4xl shadow-sm px-5">
              <p className="font-medium text-gray-800">Order #12345</p>
              <p className="text-sm text-gray-500">Placed on: 2025-09-01</p>
            </div>
            <div className="p-4 bg-white border rounded-4xl shadow-sm px-5">
              <p className="font-medium text-gray-800">Order #12346</p>
              <p className="text-sm text-gray-500">Placed on: 2025-09-05</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 mt-6">
          <h2 className="text-2xl font-semibold text-black border-b pb-2">
            Support Tickets
          </h2>

          <div className="flex flex-col gap-3">
            <div className="p-4 bg-white border rounded-4xl shadow-sm px-5">
              <p className="font-medium text-gray-800">Order Issue</p>
              <p className="text-sm text-gray-500">Opened on: 2025-09-01</p>
            </div>
            <div className="p-4 bg-white border rounded-4xl shadow-sm px-5">
              <p className="font-medium text-gray-800">Delivery Request</p>
              <p className="text-sm text-gray-500">Opened on: 2025-09-05</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
