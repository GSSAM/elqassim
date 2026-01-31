import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { UserRole, EducationLevel } from '../types';

interface Props { onToggle: () => void; }

const Login: React.FC<Props> = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupMode, setSetupMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // دعم كلمة "admin" للدخول السريع للمسؤول
    const finalEmail = email.trim().toLowerCase() === 'admin' ? 'admin@tamayuz.local' : email;

    try {
      await signInWithEmailAndPassword(auth, finalEmail, password);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' && email.toLowerCase() === 'admin') {
        setError('حساب المدير غير موجود. هل تود تهيئة النظام الآن؟');
        setSetupMode(true);
      } else {
        setError('خطأ في البريد أو كلمة المرور.');
      }
    } finally {
      setLoading(false);
    }
  };

  const setupAdmin = async () => {
    setLoading(true);
    try {
      const adminEmail = 'admin@tamayuz.local';
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
      alert('تم إنشاء حساب المدير بنجاح!');
      window.location.reload();
    } catch (err: any) {
      setError('فشلت التهيئة: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-700 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-right">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-bold">ت</div>
          <h1 className="text-3xl font-bold text-gray-800">منصة التميز</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm flex flex-col gap-3">
            <span>{error}</span>
            {setupMode && (
              <button onClick={setupAdmin} className="bg-red-600 text-white font-bold py-2 rounded-lg">تهيئة حساب المدير</button>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="text"
            required
            className="w-full px-5 py-4 rounded-xl border-2 border-gray-50 focus:border-blue-500 outline-none"
            placeholder="البريد الإلكتروني أو admin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            className="w-full px-5 py-4 rounded-xl border-2 border-gray-50 focus:border-blue-500 outline-none"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95">
            {loading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-500">
          ليس لديك حساب؟ <button onClick={onToggle} className="text-blue-700 font-bold hover:underline">سجل الآن</button>
        </p>
      </div>
    </div>
  );
};

export default Login;