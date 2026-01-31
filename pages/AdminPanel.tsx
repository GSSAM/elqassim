import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { EducationLevel, UserProfile } from '../types';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [code, setCode] = useState('');
  const [level, setLevel] = useState<EducationLevel>(EducationLevel.LEVEL_1);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
    setUsers(snap.docs.map(d => d.data() as UserProfile));
  };

  useEffect(() => { fetchData(); }, []);

  const generateCode = async () => {
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
    } catch (e) { alert('خطأ'); }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-right">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-6 text-blue-600">إنشاء أكواد التفعيل</h2>
        <div className="space-y-4">
          <input type="text" placeholder="الكود" className="w-full p-4 rounded-xl border bg-slate-50 outline-none uppercase text-center text-xl" value={code} onChange={e => setCode(e.target.value)} />
          <select className="w-full p-4 rounded-xl border bg-slate-50 outline-none" value={level} onChange={e => setLevel(e.target.value as EducationLevel)}>
            {Object.values(EducationLevel).map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button onClick={generateCode} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg">حفظ الكود</button>
        </div>
      </div>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-6">المستخدمون ({users.length})</h2>
        <div className="max-h-[400px] overflow-y-auto space-y-3">
          {users.map(u => (
            <div key={u.uid} className="p-4 border rounded-2xl flex justify-between items-center bg-slate-50">
              <div className="text-right"><p className="font-bold text-sm">{u.email}</p><p className="text-[10px] text-slate-400">{u.level}</p></div>
              <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{u.isActive ? 'مفعل' : 'غير مفعل'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;