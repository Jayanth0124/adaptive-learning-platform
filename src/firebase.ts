// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Ensure getAuth is imported

// Use import.meta.env for modern build tools (Vite, Parcel 2+)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // Uncomment if you use analytics
};

// This log is crucial for debugging. Check your browser console to see if the projectId is correct.
console.log("Firebase Project ID Initialized:", firebaseConfig.projectId);

if (!firebaseConfig.projectId) {
  alert("CRITICAL ERROR: Firebase config is not loading. Check your .env file and the VITE_ prefixes.");
  console.error("Firebase config is missing Project ID. Full config:", firebaseConfig);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// EXPORT THE AUTH AND DB INSTANCES
export const auth = getAuth(app); // THIS IS THE CRITICAL LINE THAT NEEDS 'export'
export const db = getFirestore(app);
export default app; // This exports the app instance itself as default