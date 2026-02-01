
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, query, orderBy, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserProfile, UserRole, EducationLevel, ContentType } from '../types';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'codes' | 'content'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // فورم الكود
  const [newCode, setNewCode] = useState('');
  const [codeDays, setCodeDays] = useState(30);
  const [codeLvl, setCodeLvl] = useState(EducationLevel.LEVEL_1);

  // فورم المحتوى
  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cType, setCType] = useState<ContentType>('lesson');
  const [cLvl, setCLvl] = useState(EducationLevel.LEVEL_1);
  const [cContent, setCContent] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const uSnap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
    setUsers(uSnap.docs.map(d => d.data() as UserProfile));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const saveCode = async () => {
    if (!newCode) return;
    await setDoc(doc(db, 'activationCodes', newCode.trim().toUpperCase()), {
      code: newCode.trim().toUpperCase(),
      durationDays: codeDays,
      level: codeLvl,
      isUsed: false,
      createdAt: serverTimestamp()
    });
    alert('تم حفظ الكود بنجاح');
    setNewCode('');
  };

  const saveContent = async () => {
    await addDoc(collection(db, 'content'), {
      title: cTitle,
      description: cDesc,
      type: cType,
      level: cLvl,
      content: cContent,
      createdAt: serverTimestamp()
    });
    alert('تم إضافة المحتوى');
    setCTitle(''); setCDesc(''); setCContent('');
  };

  return (
    <div className="space-y-8 text-right">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-800">لوحة الإدارة</h1>
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          {['users', 'codes', 'content'].map((tab: any) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {tab === 'users' ? 'الطلاب' : tab === 'codes' ? 'الأكواد' : 'المحتوى'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-right">الطالب</th>
                <th className="p-4 text-center">المستوى</th>
                <th className="p-4 text-center">حالة الاشتراك</th>
                <th className="p-4 text-left">ينتهي في</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{u.email}</div>
                    <div className="text-[10px] text-slate-400">UID: {u.uid.slice(0, 8)}...</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold">{u.level}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${u.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                      {u.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="p-4 text-left font-mono text-slate-500 text-xs">
                    {u.subEnd?.toDate().toLocaleDateString('ar-EG') || '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'codes' && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold mb-6">إنشاء أكواد تفعيل جديدة</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">الكود (أرقام وحروف)</label>
              <input type="text" className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:border-blue-500 outline-none uppercase font-bold text-center text-2xl" placeholder="XXXXXX" value={newCode} onChange={e => setNewCode(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">مدة التفعيل (أيام)</label>
                <select className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 outline-none focus:border-blue-500 font-bold" value={codeDays} onChange={e => setCodeDays(Number(e.target.value))}>
                  <option value={1}>يوم تجريبي (1)</option>
                  <option value={30}>شهر (30)</option>
                  <option value={90}>3 أشهر (90)</option>
                  <option value={180}>6 أشهر (180)</option>
                  <option value={365}>سنة (365)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">المستوى</label>
                <select className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 outline-none focus:border-blue-500 font-bold" value={codeLvl} onChange={e => setCodeLvl(e.target.value as any)}>
                  {Object.values(EducationLevel).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <button onClick={saveCode} className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-blue-600 transition-colors shadow-lg">حفظ الكود في النظام</button>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
             <h2 className="text-xl font-bold mb-6">إضافة محتوى جديد</h2>
             <div className="space-y-4">
                <input type="text" placeholder="عنوان الدرس/الفيديو" className="w-full p-4 rounded-xl border border-slate-100 outline-none focus:border-blue-500" value={cTitle} onChange={e => setCTitle(e.target.value)} />
                <textarea placeholder="وصف قصير" className="w-full p-4 rounded-xl border border-slate-100 outline-none focus:border-blue-500 h-24" value={cDesc} onChange={e => setCDesc(e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <select className="w-full p-4 rounded-xl border border-slate-100 font-bold" value={cType} onChange={e => setCType(e.target.value as any)}>
                    <option value="lesson">درس نصي</option>
                    <option value="video">فيديو YouTube</option>
                    <option value="live">بث مباشر</option>
                  </select>
                  <select className="w-full p-4 rounded-xl border border-slate-100 font-bold" value={cLvl} onChange={e => setCLvl(e.target.value as any)}>
                    {Object.values(EducationLevel).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <input type="text" placeholder={cType === 'video' ? 'Embed URL (YouTube)' : 'رابط البث أو محتوى الدرس'} className="w-full p-4 rounded-xl border border-slate-100 outline-none focus:border-blue-500" value={cContent} onChange={e => setCContent(e.target.value)} />
                <button onClick={saveContent} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 shadow-lg">إضافة للمنصة</button>
             </div>
          </div>
          
          <div className="bg-blue-600 text-white p-8 rounded-3xl flex flex-col justify-center shadow-2xl">
            <h2 className="text-3xl font-black mb-4">نصائح للمدير</h2>
            <ul className="space-y-3 opacity-90 text-sm list-disc pr-5">
              <li>للفيديوهات، استخدم رابط الـ Embed مثل: https://www.youtube.com/embed/XXXX</li>
              <li>الأكواد التجريبية (يوم واحد) مفيدة لجذب الطلاب الجدد.</li>
              <li>يمكنك إدراج روابط Google Drive للملفات داخل خانة المحتوى.</li>
              <li>البث المباشر يتطلب وضع الرابط وموعد البث في الوصف.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
