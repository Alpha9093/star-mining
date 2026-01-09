
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
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
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { 
  getAuth, 
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

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
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

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
  onAuthStateChanged, signOut, signInWithPopup
};
