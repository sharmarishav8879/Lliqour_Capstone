"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleSignOut = () => {
    setUser(null);
    router.push("/");
  };

  const handleSignIn = () => {
    router.push("/auth/login");
  };

  useEffect(() => {
    setTimeout(() => {
      // For the case if no user is signed in
      setUser(null);
      setLoading(false);

      // For the case if a user is signed in
      // setUser({ name: "Bob the Builder", email: "bobthebuilder@me.com" });
      // setLoading(false);
    }, 3000);
  }, []);

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
            Name: {user.name}
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
