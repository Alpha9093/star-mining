
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  updateDoc, 
  query, 
  where,
  addDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  signOut,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

/**
 * 🛠️ HOW TO FIX "MISSING OR INSUFFICIENT PERMISSIONS" 🛠️
 * 
 * You must update your rules in the Firebase Console:
 * 1. Go to console.firebase.google.com
 * 2. Click "Firestore Database" -> "Rules" tab.
 * 3. Copy and Paste the rules below EXACTLY:
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Allow global read/write for the demo.
 *     // In production, you would restrict these by Auth UID.
 *     match /users/{userId} {
 *       allow read, write: if true;
 *     }
 *     match /users/{document=**} {
 *       allow list: if true;
 *       allow read, write: if true;
 *     }
 *     match /withdrawals/{document=**} {
 *       allow read, write: if true;
 *     }
 *   }
 * }
 */

const firebaseConfig = {
  apiKey: "AIzaSyBsoZHSPGItF__tFb4Q0FSZ91K9yGlP5PA",
  authDomain: "airdropbot-1d8be.firebaseapp.com",
  projectId: "airdropbot-1d8be",
  storageBucket: "airdropbot-1d8be.firebasestorage.app",
  messagingSenderId: "13966710256",
  appId: "1:13966710256:web:30be75d939b5ce922e3935"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Helper to get or create a persistent User ID
export const getUserId = () => {
  if (auth.currentUser) return auth.currentUser.uid;
  const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id;
  if (tgUser) return `tg_${tgUser}`;
  let localId = localStorage.getItem('star_mining_uid');
  if (!localId) {
    localId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('star_mining_uid', localId);
  }
  return localId;
};

export { 
  doc, setDoc, getDoc, collection, getDocs, updateDoc, query, where, addDoc, onSnapshot,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendEmailVerification
};
