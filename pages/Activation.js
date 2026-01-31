
import React, { useState } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig.js';

const Activation = ({ profile, onActivated }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const codeRef = doc(db, 'activationCodes', code);
      const codeSnap = await getDoc(codeRef);
      if (!codeSnap.exists()) {
        setError('كود التفعيل غير صحيح.');
        setLoading(false);
        return;
      }
      const codeData = codeSnap.data();
      if (codeData.isUsed) {
        setError('هذا الكود تم استخدامه من قبل.');
        setLoading(false);
        return;
      }
      await updateDoc(codeRef, { isUsed: true, usedBy: profile.uid });
      await updateDoc(doc(db, 'users', profile.uid), {
        isActive: true,
        activatedAt: serverTimestamp(),
        role: codeData.role || profile.role,
        level: codeData.level || profile.level
      });
      onActivated();
    } catch (err) {
      setError('حدث خطأ أثناء التفعيل. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => auth.signOut();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 text-right">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-yellow-500 py-4 text-center">
          <h2 className="text-white text-xl font-bold">تفعيل الحساب مطلوب</h2>
        </div>
        <div className="p-8">
          <p className="text-gray-600 mb-6 text-center">يرجى إدخال كود التفعيل الذي استلمته من إدارة المنصة للدخول إلى الأقسام التعليمية.</p>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}
          <form onSubmit={handleActivate} className="space-y-4">
            <input
              type="text"
              required
              className="w-full text-center text-2xl tracking-widest px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-yellow-500 outline-none transition uppercase"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="123456"
              maxLength={6}
            />
            <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-transform active:scale-95 shadow-lg">
              {loading ? 'جاري التحقق...' : 'تفعيل الآن'}
            </button>
          </form>
          <div className="mt-8 border-t pt-4 text-center">
            <button onClick={handleLogout} className="text-gray-500 text-sm hover:underline">تسجيل الخروج</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activation;
