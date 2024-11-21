import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBNGoR0WLXNXGfWtqnVsKt4S4E2bRk0PNI",
  authDomain: "smart-study-planner-71dd9.firebaseapp.com",
  projectId: "smart-study-planner-71dd9",
  databaseURL: "https://smart-study-planner-71dd9-default-rtdb.firebaseio.com",
  storageBucket: "smart-study-planner-71dd9.firebasestorage.app",
  messagingSenderId: "105140411604",
  appId: "1:105140411604:android:001c187c8dc84b3a046f41",
};

// Check if Firebase has already been initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage), // Set persistence using AsyncStorage
});

// Initialize Realtime Database
export const db = getDatabase(app);

// Initialize Firestore with offline persistence
export const firestore = initializeFirestore(app, {
  cache: persistentLocalCache,
});
