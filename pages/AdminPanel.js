
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';
import { UserRole, EducationLevel } from '../types.js';

const AdminPanel = ({ profile }) => {
  const [users, setUsers] = useState([]);
  const [newCode, setNewCode] = useState('');
  const [codeLevel, setCodeLevel] = useState(EducationLevel.LEVEL_1);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
      setUsers(usersSnap.docs.map(d => d.data()));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const generateCode = async () => {
    if (!newCode || newCode.length < 4) {
      alert('الرجاء إدخال كود صحيح (4 رموز على الأقل)');
      return;
    }
    try {
      await setDoc(doc(db, 'activationCodes', newCode), {
        code: newCode,
        role: UserRole.STUDENT,
        level: codeLevel,
        isUsed: false,
        createdAt: new Date().toISOString()
      });
      alert('تم إنشاء كود التفعيل بنجاح');
      setNewCode('');
    } catch (e) {
      alert('خطأ في الصلاحيات');
    }
  };

  return (
    <div className="space-y-6 text-right">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50">
          <p className="text-gray-400 text-sm">إجمالي المستخدمين</p>
          <p className="text-3xl font-black text-blue-600">{users.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50">
          <p className="text-gray-400 text-sm">نشطون</p>
          <p className="text-3xl font-black text-emerald-600">{users.filter(u => u.isActive).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-gray-800">توليد الأكواد</h2>
            <div className="space-y-5">
              <input
                type="text"
                placeholder="مثال: EXCEL2025"
                className="w-full border-2 border-gray-50 bg-gray-50 p-4 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all font-mono text-center text-lg"
                value={newCode}
                onChange={e => setNewCode(e.target.value.toUpperCase())}
              />
              <select
                className="w-full border-2 border-gray-50 bg-gray-50 p-4 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all"
                value={codeLevel}
                onChange={e => setCodeLevel(e.target.value)}
              >
                {Object.values(EducationLevel).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button onClick={generateCode} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-all shadow-lg">حفظ الكود</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-800">سجل المستخدمين</h2>
            <button onClick={fetchUsers} className="text-blue-600 text-sm font-bold">تحديث القائمة</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-xs border-b border-gray-50">
                  <th className="pb-4 text-right">المستخدم</th>
                  <th className="pb-4 text-center">المستوى</th>
                  <th className="pb-4 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.uid}>
                    <td className="py-4">{u.email}</td>
                    <td className="py-4 text-center">{u.level}</td>
                    <td className="py-4 text-center">{u.isActive ? 'مفعل' : 'غير مفعل'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
