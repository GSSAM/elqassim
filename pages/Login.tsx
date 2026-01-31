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
    
    // Admin Shortcut
    const finalEmail = email.trim().toLowerCase() === 'admin' ? 'admin@tamayuz.local' : email;

    try {
      await signInWithEmailAndPassword(auth, finalEmail, password);
    } catch (err: any) {
      console.error(err);
      if (email.toLowerCase() === 'admin' && (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential')) {
        setError('حساب المدير غير موجود. هل تود تهيئة النظام؟');
        setSetupMode(true);
      } else {
        setError('خطأ في البريد الإلكتروني أو كلمة المرور.');
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
      alert('تم تهيئة حساب المدير بنجاح!');
      window.location.reload();
    } catch (err: any) {
      setError('فشل إنشاء المدير: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-10 text-right">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-bold shadow-inner">
            ت
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">منصة التميز</h1>
          <p className="text-slate-500 mt-2 font-medium">تسجيل الدخول</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm border border-red-100 flex flex-col gap-2">
            <span className="font-bold">{error}</span>
            {setupMode && (
              <button onClick={setupAdmin} className="bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-md">
                تهيئة حساب المدير الآن
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 mr-1">البريد الإلكتروني</label>
            <input 
              type="text" 
              required 
              className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 outline-none focus:border-blue-500 focus:bg-blue-50 transition-all text-slate-700 font-medium placeholder:text-slate-300" 
              placeholder="name@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 mr-1">كلمة المرور</label>
            <input 
              type="password" 
              required 
              className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 outline-none focus:border-blue-500 focus:bg-blue-50 transition-all text-slate-700 font-medium placeholder:text-slate-300" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-400 font-medium">
          ليس لديك حساب؟ <button onClick={onToggle} className="text-blue-600 font-bold hover:underline">أنشئ حساباً جديداً</button>
        </p>
      </div>
    </div>
  );
};

export default Login;