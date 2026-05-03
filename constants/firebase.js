import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDxdXngFIaCU3WOrsLCUPwDY7WDJo90vgI",
  authDomain: "eventifyjnu.firebaseapp.com",
  projectId: "eventifyjnu",
  storageBucket: "eventifyjnu.firebasestorage.app",
  messagingSenderId: "251472111113",
  appId: "1:251472111113:web:b5632bd313e5ba9ee47ad8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
