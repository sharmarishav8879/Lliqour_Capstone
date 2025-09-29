"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../_util/firebase";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <main className="bg-white min-h-screen pt-40 font-serif flex flex-col items-center">
      <div className="w-full max-w-md bg-gray-50 rounded-2xl shadow-lg p-6 flex flex-col gap-6">
        <h1 className="text-5xl font-bold text-black text-center mt-10">
          Sign Up
        </h1>
        <p className="text-lg text-black text-center">
          Please fill in the details to create an account.
        </p>

        <form
          onSubmit={handleSignUp}
          className="flex flex-col gap-6 w-full max-w-md"
        >
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            className="p-3 border bg-white border-gray-400 rounded-4xl text-black px-5"
            type="text"
            placeholder="Enter your name"
          />

          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="p-3 border bg-white border-gray-400 rounded-4xl text-black px-5"
            type="email"
            placeholder="Enter your email"
          />

          <div className="relative">
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type={showPassword ? "text" : "password"}
              placeholder="Enter a strong password"
              className="p-3 border bg-white border-gray-400 rounded-4xl text-black px-5 w-full pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute bg-white right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
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
              className="p-3 border border-gray-400 rounded-4xl text-black px-5 w-full pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
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
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-4xl transition duration-300"
          >
            Sign Up
          </button>
        </form>

        <div className="flex flex-row text-black items-center justify-center gap-2">
          Already have an account?
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
