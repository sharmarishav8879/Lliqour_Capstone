"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "../_util/auth-context";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../_util/firebase";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleSignIn = async () => {
    try {
      if (!name || !email || !password) {
        alert("Please fill in all fields");
        return;
      }
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredentials.user;
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
      });
      console.log("User signed up: ", user);
      router.push("/auth/login");
    } catch (error) {
      alert(`Error signing up:  ${error.message}`);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center font-serif min-h-screen bg-gray-100 gap-4">
      <h1 className="text-4xl font-bold mt-4 text-black font-serif">
        Sign Up Page
      </h1>
      <p className="text-lg text-black">
        Please fill in the details to create an account.
      </p>
      <input
        onChange={(e) => setName(e.target.value)}
        className="p-2 border border-gray-700 rounded text-black"
        type="text"
        placeholder="Enter a username"
      />
      <input
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 border border-gray-700 rounded text-black"
        type="email"
        placeholder="Enter your email"
      />
      <input
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border border-gray-700 rounded text-black"
        type="password"
        placeholder="Enter a strong password"
      />
      <button
        onClick={handleSignIn}
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded mt-4"
      >
        Sign Up
      </button>
    </div>
  );
}
