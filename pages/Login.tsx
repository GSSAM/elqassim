import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { UserRole, EducationLevel } from '../types';

interface Props {
  onToggle: () => void;
}

const Login: React.FC<Props> = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // دعم كلمة admin كاختصار للبريد المخصص
    const finalEmail = email.trim().toLowerCase() === 'admin' ? 'admin@platform.local' : email;

    try {
      await signInWithEmailAndPassword(auth, finalEmail, password);
    } catch (err: any) {
      if (email.toLowerCase() === 'admin' && (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential')) {
        setError('حساب المدير غير موجود حالياً. هل تود إنشاء حساب المدير الافتراضي؟');
        setShowSetup(true);
      } else {
        setError('خطأ في البيانات. تأكد من البريد وكلمة المرور.');
      }
    } finally {
      setLoading(false);
    }
  };

  const initAdmin = async () => {
    setLoading(true);
    try {
      const adminEmail = 'admin@platform.local';
      const adminPass = 'startsq@1985';
      const { user } = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: adminEmail,
        role: UserRole.ADMIN,
        level: EducationLevel.LEVEL_3,
        isActive: true,
        createdAt: serverTimestamp()
      });
      alert('تم إنشاء حساب المدير بنجاح! استخدم admin وكلمة المرور للدخول.');
      window.location.reload();
    } catch (e: any) {
      setError('فشل الإنشاء: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-right">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-bold">ت</div>
          <h1 className="text-3xl font-extrabold text-gray-800">تسجيل الدخول</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm flex flex-col gap-2">
            <span>{error}</span>
            {showSetup && (
              <button onClick={initAdmin} className="bg-red-600 text-white py-2 rounded-lg font-bold">إنشاء المدير الآن</button>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="text"
            placeholder="البريد الإلكتروني أو admin"
            className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-blue-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform">
            {loading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-400">
          ليس لديك حساب؟ <button onClick={onToggle} className="text-blue-600 font-bold">أنشئ حساباً جديداً</button>
        </p>
      </div>
    </div>
  );
};

export default Login;