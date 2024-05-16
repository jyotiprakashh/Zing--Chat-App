import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-7edff.firebaseapp.com",
  projectId: "reactchat-7edff",
  storageBucket: "reactchat-7edff.appspot.com",
  messagingSenderId: "519952894558",
  appId: "1:519952894558:web:3cc8424bc74bff549642cf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth= getAuth()
export const db= getFirestore()
export const storage= getStorage()