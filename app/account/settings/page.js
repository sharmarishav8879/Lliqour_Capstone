"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useUserAuth } from "../../auth/_util/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../auth/_util/firebase";
import { useTheme } from "@/components/ThemeToggle";

export default function AccountSettings() {
  const router = useRouter();
  const { user } = useUserAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const handleProfilePicClick = () => {
    alert("Profile picture change not implemented yet.");
  };

  const handleChangePassword = () => {
    alert("Change password not implemented yet.");
  };

  const handleManagePayment = () => {
    alert("Manage payment method not implemented yet.");
  };

  const handleDone = () => {
    router.push("/account");
  };

  useEffect(() => {
    if (!user) return;
    const fetchName = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setName(userData.name);
        }
      } catch (error) {
        console.error("Error fetching name:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchName();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen"></div>
    );
  }

  return (
    <main
      className={`${
        theme === "light" ? "bg-white" : "bg-gray-900"
      } min-h-screen flex flex-col items-center justify-start px-4 pt-40 font-serif`}
    >
      <div
        className={`${
          theme === "light" ? "bg-gray-50 text-black" : "bg-gray-800 text-white"
        } w-full max-w-md rounded-2xl shadow-lg p-6 flex flex-col gap-6`}
      >
        {user && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                onClick={handleProfilePicClick}
                className={`${
                  theme === "light" ? "bg-gray-300" : "bg-gray-700"
                } w-20 h-20 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition`}
              ></div>

              <div className="flex flex-col">
                <h1 className="text-3xl font-bold">{name}</h1>
                <p
                  className={`${
                    theme === "light" ? "text-gray-600" : "text-gray-300"
                  } text-sm`}
                >
                  {user.email}
                </p>
              </div>
            </div>

            <div>
              <button
                onClick={handleDone}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-4xl transition duration-300 mb-10"
              >
                Done
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 mt-6">
          <h2
            className={`${
              theme === "light" ? "text-black" : "text-white"
            } text-2xl font-semibold border-b pb-2`}
          >
            Settings
          </h2>

          <button
            onClick={handleChangePassword}
            className="p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-4xl shadow-sm px-5 text-left"
          >
            Change Password
          </button>

          <button
            onClick={handleManagePayment}
            className="p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-4xl shadow-sm px-5 text-left"
          >
            Manage Payment Method
          </button>
        </div>
      </div>
    </main>
  );
}
