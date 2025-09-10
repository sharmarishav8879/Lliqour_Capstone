export default function SignUp() {
  return (
    <div className="flex flex-col items-center justify-center font-serif min-h-screen bg-gray-100 gap-4">
      <h1 className="text-4xl font-bold mt-4 text-black font-serif">
        Sign Up Page
      </h1>
      <p className="text-lg text-black">
        Please fill in the details to create an account.
      </p>
      <input
        className="p-2 border border-gray-700 rounded text-black"
        type="text"
        placeholder="Enter a username"
      />
      <input
        className="p-2 border border-gray-700 rounded text-black"
        type="email"
        placeholder="Enter your email"
      />
      <input
        className="p-2 border border-gray-700 rounded text-black"
        type="password"
        placeholder="Enter a strong password"
      />
      <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded mt-4">
        Sign Up
      </button>
    </div>
  );
}
