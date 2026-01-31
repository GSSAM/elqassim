import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserRole, EducationLevel, UserProfile } from '../types';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [code, setCode] = useState('');
  const [level, setLevel] = useState<EducationLevel>(EducationLevel.LEVEL_1);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
    setUsers(snap.docs.map(d => d.data() as UserProfile));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleGenerateCode = async () => {
    if (!code) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'activationCodes', code.toUpperCase()), {
        code: code.toUpperCase(),
        level,
        isUsed: false,
        createdAt: new Date().toISOString()
      });
      alert('تم حفظ الكود!');
      setCode('');
    } catch (e) { alert('خطأ في الصلاحيات'); }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-right">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-6 text-blue-600">توليد أكواد التفعيل</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="مثال: MATH2025"
            className="w-full p-4 rounded-xl border bg-slate-50 outline-none focus:border-blue-500 font-mono text-center text-xl uppercase"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <select
            className="w-full p-4 rounded-xl border bg-slate-50 outline-none"
            value={level}
            onChange={e => setLevel(e.target.value as EducationLevel)}
          >
            {Object.values(EducationLevel).map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button onClick={handleGenerateCode} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg">حفظ الكود</button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-6 flex justify-between">
          <span>المستخدمون</span>
          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">{users.length}</span>
        </h2>
        <div className="overflow-y-auto max-h-[500px] space-y-3">
          {users.map(u => (
            <div key={u.uid} className="p-4 border rounded-2xl flex justify-between items-center bg-slate-50">
              <div className="text-right">
                <p className="font-bold text-sm">{u.email}</p>
                <p className="text-[10px] text-slate-400">{u.level}</p>
              </div>
              <div>
                {u.isActive ? 
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-1 rounded-full font-bold">مفعل</span> :
                  <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-1 rounded-full font-bold">غير مفعل</span>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;