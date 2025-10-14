"use client";

import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/app/auth/_util/firebase";

/**
 * Deletes a product by its custom `id` field.
 * @param {string} customId
 */
export async function deleteProduct(customId) {
  if (!customId) throw new Error("Product ID is required");

  try {
    const q = query(collection(db, "products"), where("id", "==", customId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error(`No product found with id "${customId}"`);
    }

    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, "products", docSnap.id));
      console.log(`Deleted product Firestore doc ID: ${docSnap.id}`);
    }
  } catch (error) {
    console.error(`Error deleting product: ${error.message}`);
    throw error;
  }
}
