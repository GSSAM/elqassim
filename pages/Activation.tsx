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
    setError('');

    try {
      const codeRef = doc(db, 'activationCodes', cleanCode);
      const codeSnap = await getDoc(codeRef);

      if (!codeSnap.exists()) {
        setError('كود التفعيل غير صحيح أو غير موجود.');
        setLoading(false);
        return;
      }

      const codeData = codeSnap.data();
      if (codeData.isUsed) {
        setError('عذراً، هذا الكود مستخدم بالفعل.');
        setLoading(false);
        return;
      }

      // Execute activation
      // 1. Mark code as used
      await updateDoc(codeRef, { 
        isUsed: true, 
        usedBy: profile.uid, 
        usedAt: serverTimestamp() 
      });
      
      // 2. Activate user
      await updateDoc(doc(db, 'users', profile.uid), { 
        isActive: true, 
        activatedAt: serverTimestamp(),
        // Update level if the code carries a specific level override
        level: codeData.level || profile.level
      });

      onActivated();
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 text-right">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-orange-500 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">تفعيل الحساب</h2>
          <p className="text-orange-100 text-sm mt-1">الخطوة الأخيرة للوصول إلى المحتوى</p>
        </div>
        
        <div className="p-8">
          <p className="text-slate-500 mb-8 text-sm leading-relaxed text-center font-medium">
            أهلاً بك {profile.email}.<br/>
            لإتمام تسجيلك، يرجى إدخال كود التفعيل الخاص بك.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center justify-center gap-2 border border-red-100 font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleActivate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 block mr-2">كود التفعيل</label>
              <input 
                type="text" 
                required 
                className="w-full text-center text-3xl font-mono p-5 rounded-2xl border-2 border-slate-200 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all uppercase placeholder-slate-300 text-slate-700" 
                placeholder="ABCD-1234" 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
              />
            </div>
            <button 
              disabled={loading} 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-5 rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-95 disabled:opacity-70"
            >
              {loading ? 'جاري التحقق...' : 'تفعيل الحساب الآن'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button onClick={() => auth.signOut()} className="text-slate-400 text-sm hover:text-red-500 transition-colors font-bold">تسجيل الخروج</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activation;