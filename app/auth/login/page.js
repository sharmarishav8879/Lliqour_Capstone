"use client";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth, db } from "../_util/firebase";
import { doc, getDoc } from "firebase/firestore";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { useTheme } from "@/components/ThemeToggle";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { theme } = useTheme();

  const handleSignIn = () => {
    router.push("/auth/signUp");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        alert("Please fill in all fields");
        return;
      }

      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredentials.user;
      console.log("User logged in: ", user);
      const userRef = doc(db, "users", user.uid);
      const userDocSnapshot = await getDoc(userRef);

      if (userDocSnapshot.exists()) {
        const { role } = userDocSnapshot.data();
        if (role === "admin") {
          router.push("/admin");
        } else {
          router.push("/account");
        }
      } else {
        alert("User not found");
      }
    } catch (error) {
      alert(`Error logging in: ${error.message}`);
    }
  };

  return (
    <main
      className={`${
        theme === "light" ? "bg-white" : "bg-gray-900"
      } min-h-screen pt-40 font-serif flex flex-col items-center`}
    >
      <div
        className={`${
          theme === "light" ? "bg-gray-50 text-black" : "bg-gray-800 text-white"
        } w-full max-w-md rounded-2xl shadow-lg p-6 flex flex-col gap-6`}
      >
        <h1 className="text-5xl font-bold text-center mt-10">Login</h1>
        <p className="text-lg text-center">
          Please enter your credentials to log in.
        </p>

        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-6 w-full max-w-md"
        >
          <input
            onChange={(e) => setEmail(e.target.value)}
            className={`${
              theme === "light"
                ? "bg-gray-50 border-gray-400 text-black"
                : "bg-gray-700 border-gray-600 text-white"
            } p-3 border rounded-4xl px-5`}
            type="email"
            placeholder="Email"
            value={email}
          />

          <div className="relative">
            <input
              onChange={(e) => setPassword(e.target.value)}
              className={`${
                theme === "light"
                  ? "bg-gray-50 border-gray-400 text-black"
                  : "bg-gray-700 border-gray-600 text-white"
              } p-3 border rounded-4xl px-5 w-full pr-12`}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`${
                theme === "light" ? "text-gray-500" : "text-gray-300"
              } absolute right-4 top-1/2 transform -translate-y-1/2`}
            >
              {showPassword ? (
                <HiOutlineEyeOff size={24} />
              ) : (
                <HiOutlineEye size={24} />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-full font-medium text-white bg-gradient-to-r from-orange-500 to-amber-400 shadow-md hover:from-orange-600 hover:to-amber-500 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Log In
          </button>
        </form>

        <div className="flex flex-row items-center justify-center gap-2">
          <span>Don't have an account?</span>
          <p
            onClick={handleSignIn}
            className="text-orange-500 cursor-pointer font-semibold"
          >
            Click here to Sign Up
          </p>
        </div>
      </div>
    </main>
  );
}
