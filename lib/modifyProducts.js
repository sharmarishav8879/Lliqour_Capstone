import { db } from "@/app/auth/_util/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { serverTimestamp } from "firebase/firestore";

export const addProducts = async (productData) => {
  const productRef = await addDoc(collection(db, "products"), {
    ...productData,
    createdAt: serverTimestamp(),
  });
  return productRef.id;
};

export const UpdateProducts = async (productDocId, productData) => {
  if (!productDocId) throw new Error("Firestore document ID is missing!");
  const productRef = doc(db, "products", productDocId);
  await setDoc(productRef, productData, { merge: true });
};

export const DeleteProducts = async (productId) => {
  const productRef = doc(db, "products", productId);
  await deleteDoc(productRef);
};
