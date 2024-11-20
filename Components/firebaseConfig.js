import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  //getAuth,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3XL0CuTN_OQS2DN55ctUmf5L251JXp9I",
  authDomain: "smart-study-planner-71dd9.firebaseapp.com",
  projectId: "smart-study-planner-71dd9",
  storageBucket: "smart-study-planner-71dd9.firebasestorage.app",
  messagingSenderId: "105140411604",
  appId: "1:105140411604:web:afb8ef7e4293a692046f41",
};

// Check if any Firebase apps are already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with persistence only once
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth };
