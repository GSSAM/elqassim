
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserProfile, UserRole, EducationLevel, Section } from '../types';

interface Props {
  profile: UserProfile;
}

const AdminPanel: React.FC<Props> = ({ profile }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [newCode, setNewCode] = useState('');
  const [codeLevel, setCodeLevel] = useState<EducationLevel>(EducationLevel.LEVEL_1);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
      setUsers(usersSnap.docs.map(d => d.data() as UserProfile));
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
      alert('تم إنشاء كود التفعيل: ' + newCode);
      setNewCode('');
    } catch (e) {
      alert('خطأ في الصلاحيات أو اتصال القاعدة');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50">
          <p className="text-gray-400 text-sm">إجمالي المستخدمين</p>
          <p className="text-3xl font-black text-blue-600">{users.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50">
          <p className="text-gray-400 text-sm">نشطون الآن</p>
          <p className="text-3xl font-black text-emerald-600">{users.filter(u => u.isActive).length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-50">
          <p className="text-gray-400 text-sm">بانتظار التفعيل</p>
          <p className="text-3xl font-black text-orange-600">{users.filter(u => !u.isActive).length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-50">
          <p className="text-gray-400 text-sm">المستوى النشط</p>
          <p className="text-xl font-bold text-purple-600">الثالث الثانوي</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
              توليد أكواد التفعيل
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 mr-1">الكود الرقمي أو النصي</label>
                <input
                  type="text"
                  placeholder="مثال: EXCEL2025"
                  className="w-full border-2 border-gray-50 bg-gray-50 p-4 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all font-mono text-center text-lg"
                  value={newCode}
                  onChange={e => setNewCode(e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 mr-1">المرحلة الدراسية للكود</label>
                <select
                  className="w-full border-2 border-gray-50 bg-gray-50 p-4 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all"
                  value={codeLevel}
                  onChange={e => setCodeLevel(e.target.value as EducationLevel)}
                >
                  {Object.values(EducationLevel).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <button
                onClick={generateCode}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-all shadow-lg active:scale-95"
              >
                حفظ الكود في النظام
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-800">سجل المستخدمين الأخير</h2>
            <button onClick={fetchUsers} className="text-blue-600 text-sm font-bold hover:bg-blue-50 px-3 py-1 rounded-lg transition">تحديث القائمة</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-50">
                  <th className="pb-4 font-bold">المستخدم</th>
                  <th className="pb-4 font-bold text-center">المستوى</th>
                  <th className="pb-4 font-bold text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={3} className="py-10 text-center text-gray-400 animate-pulse">جاري تحميل البيانات...</td></tr>
                ) : users.map(u => (
                  <tr key={u.uid} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700">{u.email}</span>
                        <span className="text-[10px] text-gray-400">{u.uid.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                        {u.level}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      {u.isActive ? (
                        <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-100">مُفعل</span>
                      ) : (
                        <span className="text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-[10px] font-bold border border-orange-100">بانتظار الكود</span>
                      )}
                    </td>
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
