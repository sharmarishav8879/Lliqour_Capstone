"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useUserAuth } from "../auth/_util/auth-context";
import { db } from "../auth/_util/firebase";

export default function Profile() {
  const { user, firebaseSignOut } = useUserAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const handleSignOut = async () => {
    try {
      await firebaseSignOut();
      router.push("/auth/login");
    } catch (error) {
      alert("Error signing out: ", error.message);
    }
  };

  useEffect(() => {
    if (user !== undefined) {
      setLoading(false);
    }
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnapshot = await getDoc(userDocRef);
          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            setName(userData.name);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleSignIn = () => {
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <p className="text-4xl font-bold mt-4 text-orange-500 font-serif text-center">
          Loading...
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {user ? (
        <div className="flex flex-col items-center justify-center font-serif h-100 bg-black p-4 rounded-lg shadow-md gap-2">
          <h1 className="text-4xl font-bold top-0 text-white">Profile</h1>
          <p className="text-3xl mt-4 p-3 rounded  text-orange-600 ">
            Name: {name || "No name available"}
          </p>
          <p className="text-3xl mt-4  text-orange-600 ">Email: {user.email}</p>
          <div>
            <button
              onClick={handleSignOut}
              className="mt-6 bg-orange-600 text-white px-6 py-3 rounded hover:bg-orange-700 transition duration-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-50 p-4 rounded-lg shadow-md gap-2">
          <p className="text-4xl font-bold mt-4 text-black font-serif">
            No user logged in, please log in to access your profile.
          </p>
          <button
            onClick={handleSignIn}
            className="mt-6 bg-orange-600 text-white px-6 py-3 rounded hover:bg-orange-700 transition duration-300"
          >
            Log In
          </button>
        </div>
      )}
    </div>
  );
}
