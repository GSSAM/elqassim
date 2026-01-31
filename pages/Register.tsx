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
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        role: UserRole.STUDENT,
        level,
        isActive: false,
        createdAt: serverTimestamp()
      });
    } catch (err: any) {
      setError('البريد مستخدم بالفعل أو كلمة المرور ضعيفة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-600 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-right">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-10">حساب جديد</h1>
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm text-center">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-5">
          <input type="email" required className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 outline-none focus:border-emerald-500" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} />
          <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 outline-none bg-white" value={level} onChange={(e) => setLevel(e.target.value as EducationLevel)}>
            {Object.values(EducationLevel).map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
          </select>
          <input type="password" required className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 outline-none focus:border-emerald-500" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} />
          <button disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg">{loading ? 'جاري الحفظ...' : 'تسجيل'}</button>
        </form>
        <p className="text-center mt-8 text-sm text-gray-500">لديك حساب؟ <button onClick={onToggle} className="text-emerald-600 font-bold hover:underline">دخول</button></p>
      </div>
    </div>
  );
};

export default Register;