import React, { useState } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { UserProfile } from '../types';

interface Props { profile: UserProfile; onActivated: () => void; }

const Activation: React.FC<Props> = ({ profile, onActivated }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length < 4) return;
    setLoading(true);
    try {
      const codeRef = doc(db, 'activationCodes', cleanCode);
      const codeSnap = await getDoc(codeRef);
      if (!codeSnap.exists() || codeSnap.data().isUsed) {
        setError('الكود غير صحيح أو مستخدم.');
      } else {
        await updateDoc(codeRef, { isUsed: true, usedBy: profile.uid, usedAt: serverTimestamp() });
        await updateDoc(doc(db, 'users', profile.uid), { isActive: true, activatedAt: serverTimestamp() });
        onActivated();
      }
    } catch (err) { setError('خطأ في التفعيل.'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-6">تفعيل الحساب</h2>
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">{error}</div>}
        <form onSubmit={handleActivate} className="space-y-6">
          <input type="text" required className="w-full text-center text-3xl font-mono p-5 rounded-2xl border-2 outline-none focus:border-orange-500" placeholder="XXXX" value={code} onChange={(e) => setCode(e.target.value)} />
          <button disabled={loading} className="w-full bg-orange-500 text-white font-bold py-5 rounded-2xl shadow-lg">{loading ? 'جاري التحقق...' : 'تفعيل'}</button>
        </form>
        <button onClick={() => auth.signOut()} className="mt-8 text-gray-400 text-sm hover:underline">خروج</button>
      </div>
    </div>
  );
};

export default Activation;