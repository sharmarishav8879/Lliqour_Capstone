"use client";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";

export default function Login() {
  const router = useRouter();
  const { loginNewUser } = useContext(AuthContext);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = () => {
    router.push("/auth/signUp");
  };

  const handleLogin = () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (!currentUser) {
      alert("No user found. Please sign up first.");
    } else if (
      email === currentUser.email &&
      password === currentUser.password &&
      userName === currentUser.name
    ) {
      loginNewUser(currentUser);
      router.push("/account");
    } else {
      alert("Invalid credentials. Please try again.");
    }
  };
  return (
    <main>
      <div className="flex flex-col items-center justify-center font-serif min-h-screen bg-gray-100 gap-4">
        <h1 className="text-4xl font-bold mt-4 text-black font-serif">
          Login Page
        </h1>
        <p className="text-lg text-black">
          Please enter your credentials to log in.
        </p>

        <input
          onChange={(e) => setUserName(e.target.value)}
          className="p-2 border border-gray-300 rounded text-black"
          type="text"
          placeholder="Username"
        />

        <input
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border border-gray-300 rounded text-black"
          type="email"
          placeholder="Email"
        />

        <input
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border border-gray-300 rounded text-black"
          type="password"
          placeholder="Password"
        />
        <button
          onClick={handleLogin}
          className="mt-2 bg-orange-600 text-white px-6 py-3 rounded hover:bg-orange-700 transition duration-300"
        >
          Log In
        </button>

        <div className="flex flex-row text-black items-center justify-center gap-2">
          Don't have an account?
          <p onClick={handleSignIn} className="text-orange-500 cursor-pointer">
            Click here to Sign Up
          </p>
        </div>
      </div>
    </main>
  );
}
