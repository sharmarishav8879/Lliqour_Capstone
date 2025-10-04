// // lib/products.js
// // Expanded mock data array with discounts

import { db } from "@/app/auth/_util/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export const getAllProducts = async () => {
  try {
    const productsSnapshot = await getDocs(collection(db, "products"));
    const productList = productsSnapshot.docs.map((doc) => {
      return {
        docId: doc.id,
        ...doc.data(),
      };
    });
    return productList;
  } catch (error) {
    alert(`Error fetching products:  ${error.message}`);
  }
};

export const getProductBySlug = async (slug) => {
  try {
    const productRef = collection(db, "products");
    const q = query(productRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    alert(`Error fetching product:  ${error.message}`);
  }
};
