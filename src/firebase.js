import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyAF0LoTbgo1jUw2JruESvPocIOLObWV_wI",
  authDomain: "ecommerce-a6744.firebaseapp.com",
  projectId: "ecommerce-a6744",
  storageBucket: "ecommerce-a6744.firebasestorage.app",
  messagingSenderId: "236292039507",
  appId: "1:236292039507:web:1765d7ff032f5cfb0af7a6",
  measurementId: "G-23FCTPD0BG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();