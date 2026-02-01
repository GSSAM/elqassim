import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDfoaKaJDZBf99IKuhsnEdIQp8Re887G6c",
  authDomain: "al-tamayuz-platform.firebaseapp.com",
  projectId: "al-tamayuz-platform",
  storageBucket: "al-tamayuz-platform.firebasestorage.app",
  messagingSenderId: "831767903372",
  appId: "1:831767903372:web:61d9e59cdf4a4d76eb4fa9",
  measurementId: "G-GEV687KDKK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);