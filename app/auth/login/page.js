"use client";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth, db } from "../_util/firebase";
import { doc, getDoc } from "firebase/firestore";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    <main className="bg-white min-h-screen pt-40 font-serif flex flex-col items-center">
      <div className="w-full max-w-md bg-gray-50 rounded-2xl shadow-lg p-6 flex flex-col gap-6">
        <h1 className="text-5xl font-bold text-black text-center mt-10">
          Login
        </h1>
        <p className="text-lg text-black text-center">
          Please enter your credentials to log in.
        </p>

        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-6 w-full max-w-md"
        >
          <input
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border bg-gray-50 border-gray-400 rounded-4xl text-black px-5"
            type="email"
            placeholder="Email"
            value={email}
          />

          <div className="relative">
            <input
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 border bg-gray-50 border-gray-400 rounded-4xl text-black px-5 w-full pr-12"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
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
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-4xl transition duration-300"
          >
            Log In
          </button>
        </form>

        <div className="flex flex-row text-black items-center justify-center gap-2">
          Don&apos;t have an account?
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
