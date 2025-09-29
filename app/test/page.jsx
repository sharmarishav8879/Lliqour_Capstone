"use client";
import { addDoc, collection } from "firebase/firestore";
import { db, ensureUser } from "@/lib/firebase";

export default function TestPage() {
  async function addMessage() {
    // make sure user is signed in (anonymous OK)
    await ensureUser();

    // write a test doc into contactMessages
    await addDoc(collection(db, "contactMessages"), {
      name: "Joseph",
      email: "test@example.com",
      message: "Hello Firebase from Next.js!",
      createdAt: new Date().toISOString(),
    });

    alert("✅ Added a test document to Firestore!");
  }

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">Firestore Test</h1>
      <button
        onClick={addMessage}
        className="px-4 py-2 rounded bg-black text-white"
      >
        Add Test Doc
      </button>
    </div>
  );
}
