import { db } from "@/app/auth/_util/firebase";
import { 
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";

export const AddProducts = async (productData) => {
  const productRef = await addDoc(collection(db, "products"), {
    ...productData,
    createdAt: serverTimestamp(),
  });
  return productRef.id;
};

export const UpdateProducts = async (productDocId, productData) => {
  if (!productDocId) throw new Error("Firestore document ID is missing!");
  const productRef = doc(db, "products", productDocId);
  await updateDoc(productRef, {
    ...productData,
  });
};

export const DeleteProducts = async (productId) => {
  const productRef = doc(db, "products", productId);
  await deleteDoc(productRef);
};

/**
 * Add a review to a product document
 * @param {string} productId - The `id` field of the product (not the Firestore doc ID)
 * @param {object} reviewData - { title, description, starScore, date, id }
 */
export const AddReviewToProduct = async (productId, reviewData) => {
  if (!productId) throw new Error("Product ID is missing!");
  if (!reviewData) throw new Error("Review data is missing!");

  const productsRef = collection(db, "products");
  const q = query(productsRef, where("id", "==", productId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error(`Product not found with id: ${productId}`);
  }

  const productDocRef = querySnapshot.docs[0].ref;

  await updateDoc(productDocRef, {
    reviews: arrayUnion(reviewData),
  });
};