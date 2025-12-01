// // lib/products.js
// // Expanded mock data array with discounts

import { db } from "@/app/auth/_util/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import toast from "react-hot-toast";

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

export const getProductsByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];

  try {
    const q = query(collection(db, "products"), where("__name__", "in", ids));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    toast.error(`Error fetching products`);
    console.error("Error fetching products by IDs:", error);
    return [];
  }
};
