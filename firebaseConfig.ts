
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * تأكد من استبدال القيم أدناه بمفاتيح مشروعك الحقيقية من Firebase Console
 */
const firebaseConfig = {
  apiKey: "AIzaSy...", // ضع هنا مفتاح API الفعلي
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// فحص بسيط لمنع الانهيار إذا لم يتم وضع المفاتيح
if (firebaseConfig.apiKey.includes("AIzaSy") === false) {
  console.warn("تنبيه: يجب وضع مفاتيح Firebase الحقيقية في ملف firebaseConfig.ts لكي يعمل التطبيق.");
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
