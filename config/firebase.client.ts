// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0u7elyrSdAWYy--b5U2sj6sc4zCleOYw",
  authDomain: "mobile-mems-app.firebaseapp.com",
  projectId: "mobile-mems-app",
  storageBucket: "mobile-mems-app.firebasestorage.app",
  messagingSenderId: "539826770888",
  appId: "1:539826770888:web:17fec6d65434477a9b26fd",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

//db
export const firestore = getFirestore(app);
export const db = getFirestore(app);
export const storage = getStorage(app);