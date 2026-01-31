import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { UserRole, EducationLevel } from '../types';

interface Props { onToggle: () => void; }

const Register: React.FC<Props> = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState<EducationLevel>(EducationLevel.LEVEL_1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      setLoading(false);
      return;
    }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      // Create user profile
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        role: UserRole.STUDENT,
        level,
        isActive: false, 
        createdAt: serverTimestamp()
      });
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('البريد الإلكتروني مستخدم بالفعل.');
      } else {
        setError('حدث خطأ أثناء التسجيل. حاول مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-600 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-10 text-right">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800">حساب جديد</h1>
          <p className="text-slate-400 mt-2 font-medium">ابدأ رحلتك التعليمية معنا</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm text-center border border-red-100 font-bold">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 mr-1">البريد الإلكتروني</label>
            <input 
              type="email" 
              required 
              className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 outline-none focus:border-emerald-500 focus:bg-emerald-50 transition-all font-medium placeholder:text-slate-300" 
              placeholder="name@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 mr-1">المرحلة الدراسية</label>
            <div className="relative">
              <select 
                className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 outline-none focus:border-emerald-500 focus:bg-emerald-50 bg-white transition-all appearance-none font-medium text-slate-700 cursor-pointer" 
                value={level} 
                onChange={(e) => setLevel(e.target.value as EducationLevel)}
              >
                {Object.values(EducationLevel).map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 mr-1">كلمة المرور</label>
            <input 
              type="password" 
              required 
              className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 outline-none focus:border-emerald-500 focus:bg-emerald-50 transition-all font-medium placeholder:text-slate-300" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'جاري الحفظ...' : 'تسجيل حساب جديد'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-400 font-medium">
          لديك حساب بالفعل؟ <button onClick={onToggle} className="text-emerald-600 font-bold hover:underline">تسجيل الدخول</button>
        </p>
      </div>
    </div>
  );
};

export default Register;