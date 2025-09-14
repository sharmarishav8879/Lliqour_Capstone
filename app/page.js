import Image from "next/image";

export default function Home() {
  return (
    <main>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Image
          src="/Logo.jpg"
          alt="Legacy Liquor Logo"
          width={150}
          height={150}
        />
        <h1 className="text-4xl font-bold mt-4 text-black">Legacy Liquor</h1>
        <p className="mt-2 text-lg text-black">
          Your one-stop shop for fine spirits
        </p>
      </div>
    </main>
  );
}
