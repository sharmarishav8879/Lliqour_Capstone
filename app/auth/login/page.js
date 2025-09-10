"use client";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/auth/signUp");
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
          className="p-2 border border-gray-300 rounded text-black"
          type="text"
          placeholder="Username"
        />

        <input
          className="p-2 border border-gray-300 rounded text-black"
          type="email"
          placeholder="Email"
        />

        <input
          className="p-2 border border-gray-300 rounded text-black"
          type="password"
          placeholder="Password"
        />
        <button className="mt-2 bg-orange-600 text-white px-6 py-3 rounded hover:bg-orange-700 transition duration-300">
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
