// To tell firebase that we are using it in our project like adding it.
import { initializeApp } from "firebase/app";
// This will give all the authentication methods.
import { getAuth } from "firebase/auth";
// This will give us access to the firestore database.
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArxMudk2D7PpcyuaVSFzhvzK_iUkbm9pU",
  authDomain: "lliqour-capstone.firebaseapp.com",
  projectId: "lliqour-capstone",
  storageBucket: "lliqour-capstone.firebasestorage.app",
  messagingSenderId: "77810037721",
  appId: "1:77810037721:web:3130da1a0e24e8b6dd9fc8",
};

// To make firebase use the above config in our project.
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

