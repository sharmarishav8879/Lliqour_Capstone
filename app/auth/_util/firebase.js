// firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArxMudk2D7PpcyuaVSFzhvzK_iUkbm9pU",
  authDomain: "lliqour-capstone.firebaseapp.com",
  projectId: "lliqour-capstone",
  storageBucket: "lliqour-capstone.firebasestorage.app",
  messagingSenderId: "77810037721",
  appId: "1:77810037721:web:b38840e64428494bdd9fc8",
};

// ✅ this line prevents the "already exists" error
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
