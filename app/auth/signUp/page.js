"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../_util/firebase";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { useTheme } from "@/components/ThemeToggle";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { theme } = useTheme();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredentials.user;
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
      });
      console.log("User signed up: ", user);
      router.push("/auth/login");
    } catch (error) {
      alert(`Error signing up: ${error.message}`);
    }
  };

  const handleSignInRedirect = () => {
    router.push("/auth/login");
  };

  return (
    <main
      className={`${
        theme === "light" ? "bg-white" : "bg-gray-900"
      } min-h-screen pt-30 font-serif flex flex-col items-center`}
    >
      <div
        className={`${
          theme === "light" ? "bg-gray-50 text-black" : "bg-gray-800 text-white"
        } w-full max-w-md rounded-2xl shadow-lg p-6 flex flex-col gap-6`}
      >
        <h1 className="text-5xl font-bold text-center ">Sign Up</h1>
        <p className="text-lg text-center">
          Please fill in the details to create an account.
        </p>

        <form
          onSubmit={handleSignUp}
          className="flex flex-col gap-6 w-full max-w-md"
        >
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            className={`${
              theme === "light"
                ? "bg-white border-gray-400 text-black"
                : "bg-gray-700 border-gray-600 text-white"
            } p-3 border rounded-4xl px-5`}
            type="text"
            placeholder="Enter your name"
          />

          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className={`${
              theme === "light"
                ? "bg-white border-gray-400 text-black"
                : "bg-gray-700 border-gray-600 text-white"
            } p-3 border rounded-4xl px-5`}
            type="email"
            placeholder="Enter your email"
          />

          <div className="relative">
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type={showPassword ? "text" : "password"}
              placeholder="Enter a strong password"
              className={`${
                theme === "light"
                  ? "bg-white border-gray-400 text-black"
                  : "bg-gray-700 border-gray-600 text-white"
              } p-3 border rounded-4xl px-5 w-full pr-12`}
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

          <div className="relative">
            <input
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              className={`${
                theme === "light"
                  ? "bg-white border-gray-400 text-black"
                  : "bg-gray-700 border-gray-600 text-white"
              } p-3 border rounded-4xl px-5 w-full pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`${
                theme === "light" ? "text-gray-500" : "text-gray-300"
              } absolute right-4 top-1/2 transform -translate-y-1/2`}
            >
              {showConfirmPassword ? (
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
            Sign Up
          </button>
        </form>

        <div className="flex flex-row items-center justify-center gap-2">
          <span>Already have an account?</span>
          <p
            onClick={handleSignInRedirect}
            className="text-orange-500 cursor-pointer font-semibold"
          >
            Log In
          </p>
        </div>
      </div>
    </main>
  );
}
