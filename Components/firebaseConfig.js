import firebase from "firebase/app";
import "firebase/auth"; // for authentication
import "firebase/firestore"; // for Firestore (if using it)

const firebaseConfig = {
  apiKey: "AIzaSyBNGoR0WLXNXGfWtqnVsKt4S4E2bRk0PNI",
  authDomain: "smart-study-planner-71dd9.firebaseapp.com",
  projectId: "smart-study-planner-71dd9",
  storageBucket: "smart-study-planner-71dd9.firebasestorage.app",
  messagingSenderId: "105140411604",
  appId: "1:105140411604:android:001c187c8dc84b3a046f41",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized
}