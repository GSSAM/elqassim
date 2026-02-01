import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserProfile, UserRole, EducationLevel } from '../types';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [newCode, setNewCode] = useState('');
  const [codeLevel, setCodeLevel] = useState<EducationLevel>(EducationLevel.LEVEL_1);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setUsers(snap.docs.map(d => d.data() as UserProfile));
  };

  useEffect(() => { fetchData(); }, []);

  const generateCode = async () => {
    if (!newCode || newCode.length < 4) return alert('الكود قصير جداً');
    setLoading(true);
    try {
      const cleanCode = newCode.trim().toUpperCase();
      await setDoc(doc(db, 'activationCodes', cleanCode), {
        code: cleanCode,
        role: UserRole.STUDENT,
        level: codeLevel,
        isUsed: false,
        createdAt: serverTimestamp()
      });
      alert('تم إنشاء الكود: ' + cleanCode);
      setNewCode('');
    } catch (e) {
      alert('حدث خطأ في إنشاء الكود');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-right">
      <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">إصدار أكواد تفعيل</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="مثلاً: MATH101"
            className="w-full border-2 border-gray-50 bg-gray-50 p-4 rounded-xl outline-none focus:border-blue-500 text-center font-mono text-xl uppercase"
            value={newCode}
            onChange={e => setNewCode(e.target.value)}
          />
          <select
            className="w-full p-4 rounded-xl border-2 border-gray-50 bg-gray-50 outline-none focus:border-blue-500"
            value={codeLevel}
            onChange={e => setCodeLevel(e.target.value as EducationLevel)}
          >
            {Object.values(EducationLevel).map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button
            onClick={generateCode}
            disabled={loading}
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-colors"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ الكود في النظام'}
          </button>
        </div>
      </div>

      <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">الطلاب المسجلين ({users.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400">
                <th className="py-4 text-right">البريد الإلكتروني</th>
                <th className="py-4 text-center">المرحلة</th>
                <th className="py-4 text-left">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.uid}>
                  <td className="py-4 font-bold text-gray-700">{u.email}</td>
                  <td className="py-4 text-center">{u.level}</td>
                  <td className="py-4 text-left">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${u.isActive ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {u.isActive ? 'نشط' : 'غير مفعل'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;