// SINGLE source of truth for Firebase
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyArxMudk2D7PpcyuaVSFzhvzK_iUkbm9pU",
  authDomain: "lliqour-capstone.firebaseapp.com",
  projectId: "lliqour-capstone",
  storageBucket: "lliqour-capstone.firebasestorage.app",
  messagingSenderId: "77810037721",
  appId: "1:77810037721:web:b38840e64428494bdd9fc8",
};

// ✅ use existing app if it’s already created (prevents duplicate-app errors)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// optional helper
export const ensureUser = () =>
  new Promise((resolve, reject) => {
    if (auth.currentUser) return resolve(auth.currentUser);
    signInAnonymously(auth).catch(reject);
    onAuthStateChanged(auth, (u) => u && resolve(u), reject);
  });
