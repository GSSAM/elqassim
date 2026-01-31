import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { EducationLevel, UserProfile, UserRole } from '../types';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [newCode, setNewCode] = useState('');
  const [codeLevel, setCodeLevel] = useState<EducationLevel>(EducationLevel.LEVEL_1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchUsers = async () => {
    setFetching(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
      setUsers(snap.docs.map(d => d.data() as UserProfile));
    } catch (e) {
      console.error("Error fetching users", e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const generateCode = async () => {
    if (!newCode || newCode.length < 4) {
      alert('الرجاء إدخال كود صحيح (4 رموز على الأقل)');
      return;
    }
    setLoading(true);
    try {
      const codeId = newCode.trim().toUpperCase();
      await setDoc(doc(db, 'activationCodes', codeId), {
        code: codeId,
        level: codeLevel,
        isUsed: false,
        createdAt: new Date().toISOString()
      });
      alert(`تم حفظ الكود بنجاح: ${codeId}`);
      setNewCode('');
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء حفظ الكود. تأكد من صلاحياتك.');
    } finally {
      setLoading(false);
    }
  };

  const activeUsers = users.filter(u => u.isActive).length;

  return (
    <div className="space-y-8 text-right">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 flex flex-col justify-between">
          <p className="text-slate-400 font-bold text-sm">إجمالي الطلاب</p>
          <p className="text-4xl font-black text-blue-600 mt-2">{users.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 flex flex-col justify-between">
          <p className="text-slate-400 font-bold text-sm">الحسابات النشطة</p>
          <p className="text-4xl font-black text-emerald-600 mt-2">{activeUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-amber-100 flex flex-col justify-between">
          <p className="text-slate-400 font-bold text-sm">بانتظار التفعيل</p>
          <p className="text-4xl font-black text-amber-500 mt-2">{users.length - activeUsers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Code Generator */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
            <h2 className="text-xl font-bold mb-6 text-slate-800">توليد أكواد التفعيل</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">كود التفعيل (يدوي)</label>
                <input 
                  type="text" 
                  placeholder="مثال: TAMAYUZ2025" 
                  className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-all uppercase text-center font-mono text-lg" 
                  value={newCode} 
                  onChange={e => setNewCode(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">الصلاحية (المستوى)</label>
                <select 
                  className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                  value={codeLevel} 
                  onChange={e => setCodeLevel(e.target.value as EducationLevel)}
                >
                  {Object.values(EducationLevel).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <button 
                onClick={generateCode} 
                disabled={loading} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all mt-4"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ الكود في النظام'}
              </button>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">سجل المستخدمين المسجلين</h2>
              <button onClick={fetchUsers} className="text-blue-600 text-sm font-bold hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors">
                {fetching ? 'جاري التحديث...' : 'تحديث القائمة ↻'}
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-slate-400 text-xs border-b border-slate-100">
                    <th className="pb-4 text-right pr-4">المستخدم</th>
                    <th className="pb-4 text-center">المستوى</th>
                    <th className="pb-4 text-center">الحالة</th>
                    <th className="pb-4 text-left pl-4">تاريخ التسجيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 pr-4">
                        <p className="font-bold text-slate-700 text-sm">{u.email}</p>
                        <p className="text-[10px] text-slate-400">{u.role === UserRole.ADMIN ? 'مدير النظام' : 'طالب'}</p>
                      </td>
                      <td className="py-4 text-center">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold">{u.level}</span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`text-[10px] px-3 py-1 rounded-full font-bold ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {u.isActive ? 'مفعل' : 'غير مفعل'}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-left text-xs text-slate-400 font-mono">
                        {u.createdAt?.toDate ? new Date(u.createdAt.toDate()).toLocaleDateString('ar-EG') : 'الآن'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && !fetching && (
                <p className="text-center text-slate-400 py-8">لا يوجد مستخدمين حتى الآن</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;