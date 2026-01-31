
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * تأكد من استبدال القيم أدناه بمفاتيح مشروعك الحقيقية من Firebase Console
 */
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDfoaKaJDZBf99IKuhsnEdIQp8Re887G6c",
  authDomain: "al-tamayuz-platform.firebaseapp.com",
  projectId: "al-tamayuz-platform",
  storageBucket: "al-tamayuz-platform.firebasestorage.app",
  messagingSenderId: "831767903372",
  appId: "1:831767903372:web:61d9e59cdf4a4d76eb4fa9",
  measurementId: "G-GEV687KDKK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
