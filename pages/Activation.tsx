import React, { useState } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  onActivated: () => void;
}

const Activation: React.FC<Props> = ({ profile, onActivated }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length < 4) return;

    setLoading(true);
    setError('');

    try {
      const codeRef = doc(db, 'activationCodes', cleanCode);
      const codeSnap = await getDoc(codeRef);

      if (!codeSnap.exists()) {
        setError('كود التفعيل غير صحيح.');
        setLoading(false);
        return;
      }

      const codeData = codeSnap.data();
      if (codeData.isUsed) {
        setError('هذا الكود تم استخدامه مسبقاً.');
        setLoading(false);
        return;
      }

      // تحديث حالة الكود وحالة المستخدم
      await updateDoc(codeRef, { isUsed: true, usedBy: profile.uid, usedAt: serverTimestamp() });
      await updateDoc(doc(db, 'users', profile.uid), {
        isActive: true,
        activatedAt: serverTimestamp(),
        level: codeData.level || profile.level
      });

      onActivated();
    } catch (err) {
      setError('حدث خطأ أثناء التفعيل.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">🔑</div>
        <h2 className="text-2xl font-bold text-gray-800">تفعيل الحساب</h2>
        <p className="text-gray-500 mt-2 mb-8">أدخل الكود الرقمي لتتمكن من تصفح المنصة</p>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">{error}</div>}

        <form onSubmit={handleActivate} className="space-y-6">
          <input
            type="text"
            required
            className="w-full text-center text-3xl font-mono tracking-widest px-4 py-5 rounded-2xl border-2 border-gray-100 focus:border-orange-500 outline-none uppercase bg-gray-50"
            placeholder="XXXXXX"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-5 rounded-2xl shadow-lg">
            {loading ? 'جاري التحقق...' : 'تفعيل الآن'}
          </button>
        </form>
        <button onClick={() => auth.signOut()} className="mt-8 text-gray-400 text-sm hover:underline">تسجيل الخروج</button>
      </div>
    </div>
  );
};

export default Activation;