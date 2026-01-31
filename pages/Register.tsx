
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { UserRole, EducationLevel } from '../types';

interface Props {
  onToggle: () => void;
}

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
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Default registration is ALWAYS Student for security.
      // Admin roles must be set manually in DB.
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        role: UserRole.STUDENT,
        level,
        isActive: false,
        activationCode: null,
        activatedAt: null,
        createdAt: serverTimestamp()
      });
    } catch (err: any) {
      setError('حدث خطأ أثناء التسجيل. قد يكون البريد مستخدماً بالفعل.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-emerald-700 mb-2">حساب جديد</h1>
          <p className="text-gray-500">انضم إلينا وابدأ رحلة التعلم</p>
        </div>

        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 p-4 mb-6 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">السنة الدراسية</label>
            <select
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white"
              value={level}
              onChange={(e) => setLevel(e.target.value as EducationLevel)}
            >
              {Object.values(EducationLevel).map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">كلمة المرور</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-emerald-200"
          >
            {loading ? 'جاري إنشاء الحساب...' : 'تسجيل حساب'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          لديك حساب بالفعل؟{' '}
          <button onClick={onToggle} className="text-emerald-600 font-bold hover:underline">
            سجل دخولك هنا
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
