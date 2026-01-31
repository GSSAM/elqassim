import React, { useState } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig.js';

const Activation = ({ profile, onActivated }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async (e) => {
    e.preventDefault();
    if (code.length < 4) return;
    setLoading(true);
    setError('');
    try {
      const codeRef = doc(db, 'activationCodes', code.trim().toUpperCase());
      const codeSnap = await getDoc(codeRef);
      
      if (!codeSnap.exists()) {
        setError('كود التفعيل غير صحيح أو منتهي الصلاحية.');
        setLoading(false);
        return;
      }

      const codeData = codeSnap.data();
      if (codeData.isUsed) {
        setError('هذا الكود تم استخدامه مسبقاً من قبل طالب آخر.');
        setLoading(false);
        return;
      }

      // 1. Mark code as used
      await updateDoc(codeRef, { 
        isUsed: true, 
        usedBy: profile.uid,
        usedAt: serverTimestamp() 
      });

      // 2. Activate user account
      await updateDoc(doc(db, 'users', profile.uid), {
        isActive: true,
        activatedAt: serverTimestamp(),
        level: codeData.level || profile.level
      });

      onActivated();
    } catch (err) {
      console.error(err);
      setError('حدث خطأ في الاتصال بالقاعدة. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 text-right">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-orange-500 py-6 text-center text-white">
          <h2 className="text-2xl font-bold">خطوة التفعيل الأخيرة</h2>
        </div>
        <div className="p-8">
          <p className="text-gray-600 mb-8 text-center leading-relaxed">
            للحصول على كامل صلاحيات المنصة، يرجى إدخال الكود الرقمي الذي استلمته من إدارة المنصة.
          </p>
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm text-center border border-red-100">{error}</div>}
          <form onSubmit={handleActivate} className="space-y-6">
            <input
              type="text"
              required
              className="w-full text-center text-3xl tracking-[10px] px-4 py-5 rounded-2xl border-2 border-gray-100 focus:border-orange-500 outline-none transition uppercase bg-gray-50"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="XXXXXX"
              maxLength={12}
            />
            <button disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-5 rounded-2xl shadow-lg transition-transform active:scale-95">
              {loading ? 'جاري التحقق...' : 'تفعيل حسابي الآن'}
            </button>
          </form>
          <div className="mt-8 pt-4 border-t text-center">
            <button onClick={() => auth.signOut()} className="text-gray-400 text-sm hover:underline">تسجيل الخروج</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activation;