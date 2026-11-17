import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmfoJOtH3WZdCLWhw9PXlJQqxJT3CqBhU",
  authDomain: "lenka-store-diwali.firebaseapp.com",
  projectId: "lenka-store-diwali",
  storageBucket: "lenka-store-diwali.firebasestorage.app",
  messagingSenderId: "42221075191",
  appId: "1:42221075191:web:ca555726f192c3469171f2",
  measurementId: "G-DZCM25T6B3",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
