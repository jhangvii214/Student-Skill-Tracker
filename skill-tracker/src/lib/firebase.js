import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace with your actual Firebase config from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyA4zt8Ht1KfaQs4hl7sSRvKbewck_yVa2s",
  authDomain: "student-skill-tracker-e1899.firebaseapp.com",
  projectId: "student-skill-tracker-e1899",
  storageBucket: "student-skill-tracker-e1899.firebasestorage.app",
  messagingSenderId: "115593772864",
  appId: "1:115593772864:web:bf71c9af2af18a4da504a5",
  measurementId: "G-ZD7RD30E6G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
