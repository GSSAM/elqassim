import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig.js';
import { UserRole, EducationLevel } from '../types.js';

const Login = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupMode, setSetupMode] = useState(false);

  const formatEmail = (input) => {
    return input.trim().toLowerCase() === 'admin' ? 'admin@platform.local' : input;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const finalEmail = formatEmail(email);
    try {
      await signInWithEmailAndPassword(auth, finalEmail, password);
    } catch (err) {
      if (err.code === 'auth/user-not-found' && email.toLowerCase() === 'admin') {
        setError('حساب المدير غير موجود. هل تود تهيئة النظام الآن؟');
        setSetupMode(true);
      } else {
        setError('خطأ في البيانات. تأكد من البريد وكلمة المرور.');
      }
    } finally {
      setLoading(false);
    }
  };

  const initializeAdmin = async () => {
    setLoading(true);
    setError('');
    const adminEmail = 'admin@platform.local';
    const adminPass = 'startsq@1985';
    try {
      const { user } = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: adminEmail,
        role: UserRole.ADMIN,
        level: EducationLevel.LEVEL_3,
        isActive: true,
        createdAt: serverTimestamp()
      });
      alert('تم تهيئة حساب المدير بنجاح!');
      window.location.reload();
    } catch (err) {
      setError('فشلت التهيئة: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-right">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-600 rounded-2xl shadow-lg mb-4 text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">منصة التميز</h1>
          <p className="text-gray-500 mt-2">بوابتك للنجاح في الثانوية العامة</p>
        </div>

        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 p-4 mb-6 rounded-lg text-red-700 text-sm flex justify-between items-center">
            <span>{error}</span>
            {setupMode && (
              <button onClick={initializeAdmin} className="bg-red-600 text-white px-3 py-1 rounded-md font-bold text-xs hover:bg-red-700">تهيئة</button>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="text"
            required
            className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-blue-500 outline-none transition-all bg-gray-50 text-right"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="البريد الإلكتروني أو admin"
          />
          <input
            type="password"
            required
            className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-blue-500 outline-none transition-all bg-gray-50 text-right"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
          />
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95">
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-between text-sm">
          <button onClick={onToggle} className="text-blue-600 font-bold hover:underline">إنشاء حساب جديد</button>
          <span className="text-gray-400">هل تواجه مشكلة؟</span>
        </div>
      </div>
    </div>
  );
};

export default Login;