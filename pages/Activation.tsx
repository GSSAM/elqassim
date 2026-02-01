
import React, { useState } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { UserProfile, ActivationCode } from '../types';

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
    setLoading(true);
    setError('');

    try {
      const codeRef = doc(db, 'activationCodes', code.trim().toUpperCase());
      const codeSnap = await getDoc(codeRef);

      if (!codeSnap.exists()) {
        setError('كود التفعيل غير موجود أو غير صحيح.');
        setLoading(false);
        return;
      }

      const codeData = codeSnap.data() as ActivationCode;
      if (codeData.isUsed) {
        setError('هذا الكود تم استخدامه مسبقاً.');
        setLoading(false);
        return;
      }

      // حساب تاريخ الانتهاء
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + codeData.durationDays);

      await updateDoc(codeRef, {
        isUsed: true,
        usedBy: profile.uid,
        usedAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'users', profile.uid), {
        isActive: true,
        subStart: startDate,
        subEnd: endDate,
        level: codeData.level || profile.level
      });

      onActivated();
    } catch (err) {
      setError('خطأ في الاتصال بالسيرفر.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 text-right">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">تنشيط الاشتراك</h2>
          <p className="text-blue-100 text-sm mt-2">أدخل كود التفعيل المكون من 6 أرقام أو رموز</p>
        </div>
        
        <div className="p-8">
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm text-center font-bold border border-red-100">{error}</div>}
          
          {profile.subEnd && (
            <div className="bg-amber-50 text-amber-700 p-4 rounded-xl mb-6 text-sm text-center border border-amber-100">
              <p className="font-bold">انتهى اشتراكك السابق في:</p>
              <p className="font-mono">{profile.subEnd.toDate().toLocaleDateString('ar-EG')}</p>
            </div>
          )}

          <form onSubmit={handleActivate} className="space-y-6">
            <input
              type="text"
              required
              className="w-full text-center text-3xl font-mono p-5 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-500 transition-all uppercase placeholder-slate-200"
              placeholder="XXXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
              {loading ? 'جاري التحقق...' : 'تفعيل الاشتراك الآن'}
            </button>
          </form>

          <button onClick={() => auth.signOut()} className="w-full mt-8 text-slate-400 text-sm hover:text-slate-600 transition-colors">تسجيل الخروج</button>
        </div>
      </div>
    </div>
  );
};

export default Activation;
