"use client";

import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
// cartSync is inside /lib, so firebase is a sibling file:
import { auth, db } from "./firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

async function ensureUser() {
  if (auth.currentUser) return auth.currentUser;
  await signInAnonymously(auth);
  return new Promise((resolve, reject) =>
    onAuthStateChanged(auth, (u) => (u ? resolve(u) : reject(new Error("No auth user"))))
  );
}

export async function loadCart() {
  const u = await ensureUser();
  const snap = await getDoc(doc(db, "users", u.uid));
  return snap.data()?.cart?.items ?? [];
}

export async function saveCart(items) {
  const u = await ensureUser();
  await setDoc(
    doc(db, "users", u.uid),
    { cart: { items, updatedAt: serverTimestamp() } },
    { merge: true }
  );
}

export async function subscribeCart(cb) {
  const u = await ensureUser();
  const ref = doc(db, "users", u.uid);
  return onSnapshot(ref, (snap) => cb(snap.data()?.cart?.items ?? []));
}
