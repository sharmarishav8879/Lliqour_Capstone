import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { serverTimestamp } from "firebase/firestore";

export const addProducts = async (productData) => {
  const productRef = await addDoc(collection(db, "products"), {
    ...productData,
    createdAt: serverTimestamp(),
  });
  return productRef.id;
};

export const UpdateProducts = async (productId, productData) => {
  const productRef = doc(db, "products", productId);
  await updateDoc(productRef, productData);
};

export const DeleteProducts = async (productId) => {
  const productRef = doc(db, "products", productId);
  await deleteDoc(productRef);
};
