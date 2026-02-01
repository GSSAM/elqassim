
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, query, orderBy, serverTimestamp, deleteDoc, writeBatch, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserProfile, EducationLevel, ActivationCode, EducationalContent, ContentType } from '../types';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'codes' | 'content'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [contentList, setContentList] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'used' | 'unused'>('all');

  // إعدادات إضافة المحتوى
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    type: 'lesson' as ContentType,
    level: EducationLevel.LEVEL_1,
    content: '',
    scheduledAt: ''
  });

  // إعدادات توليد الأكواد
  const [batchCount, setBatchCount] = useState(10);
  const [codeDays, setCodeDays] = useState(30);
  const [codeLvl, setCodeLvl] = useState(EducationLevel.LEVEL_1);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const uSnap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
        setUsers(uSnap.docs.map(d => d.data() as UserProfile));
      } else if (activeTab === 'codes') {
        const cSnap = await getDocs(query(collection(db, 'activationCodes'), orderBy('createdAt', 'desc')));
        setCodes(cSnap.docs.map(d => d.data() as ActivationCode));
      } else if (activeTab === 'content') {
        const coSnap = await getDocs(query(collection(db, 'content'), orderBy('createdAt', 'desc')));
        setContentList(coSnap.docs.map(d => ({ id: d.id, ...d.data() } as EducationalContent)));
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const generateBatch = async () => {
    setLoading(true);
    const batch = writeBatch(db);
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let i = 0; i < batchCount; i++) {
      let codeId = '';
      for (let j = 0; j < 8; j++) codeId += chars.charAt(Math.floor(Math.random() * chars.length));
      const ref = doc(db, 'activationCodes', codeId);
      batch.set(ref, {
        code: codeId,
        durationDays: codeDays,
        level: codeLvl,
        isUsed: false,
        createdAt: serverTimestamp()
      });
    }
    await batch.commit();
    alert(`تم توليد ${batchCount} كود بنجاح`);
    fetchData();
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.title || !newContent.content) return alert('يرجى ملء الحقول الأساسية');
    
    setLoading(true);
    try {
      let finalContent = newContent.content;
      
      // تحويل رابط يوتيوب العادي إلى Embed تلقائياً
      if (newContent.type === 'video' && finalContent.includes('youtube.com/watch?v=')) {
        const videoId = finalContent.split('v=')[1].split('&')[0];
        finalContent = `https://www.youtube.com/embed/${videoId}`;
      } else if (newContent.type === 'video' && finalContent.includes('youtu.be/')) {
        const videoId = finalContent.split('youtu.be/')[1];
        finalContent = `https://www.youtube.com/embed/${videoId}`;
      }

      await addDoc(collection(db, 'content'), {
        ...newContent,
        content: finalContent,
        scheduledAt: newContent.scheduledAt ? new Date(newContent.scheduledAt) : null,
        createdAt: serverTimestamp()
      });
      
      alert('تم نشر المحتوى بنجاح');
      setNewContent({ title: '', description: '', type: 'lesson', level: EducationLevel.LEVEL_1, content: '', scheduledAt: '' });
      fetchData();
    } catch (e) { alert('خطأ في النشر'); }
    setLoading(false);
  };

  const deleteItem = async (col: string, id: string) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذه العملية.')) return;
    await deleteDoc(doc(db, col, id));
    fetchData();
  };

  return (
    <div className="space-y-8 text-right pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-800">لوحة الإدارة</h1>
          <p className="text-slate-400 text-sm mt-1">إدارة الطلاب، الأكواد، والمحتوى التعليمي</p>
        </div>
        <div className="flex gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100 overflow-x-auto w-full md:w-auto">
          {['users', 'codes', 'content'].map((tab: any) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              {tab === 'users' ? 'الطلاب' : tab === 'codes' ? 'الأكواد' : 'إدارة المحتوى'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-right">الطالب</th>
                <th className="p-4 text-center">المستوى</th>
                <th className="p-4 text-center">الحالة</th>
                <th className="p-4 text-left">الانتهاء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.uid} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-700">{u.email}</td>
                  <td className="p-4 text-center font-bold text-blue-600">{u.level}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${u.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                      {u.isActive ? 'نشط' : 'غير مفعل'}
                    </span>
                  </td>
                  <td className="p-4 text-left font-mono text-slate-400">{u.subEnd?.toDate().toLocaleDateString('ar-EG') || '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'codes' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold mb-6 text-slate-800">توليد أكواد جديدة</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">الكمية</label>
                  <select className="w-full p-4 rounded-xl border bg-slate-50 font-bold" value={batchCount} onChange={e => setBatchCount(Number(e.target.value))}>
                    <option value={10}>10 أكواد</option>
                    <option value={20}>20 كود</option>
                    <option value={50}>50 كود</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">المدة (أيام)</label>
                    <input type="number" className="w-full p-4 rounded-xl border bg-slate-50 font-bold" value={codeDays} onChange={e => setCodeDays(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">المستوى</label>
                    <select className="w-full p-4 rounded-xl border bg-slate-50 font-bold" value={codeLvl} onChange={e => setCodeLvl(e.target.value as any)}>
                      {Object.values(EducationLevel).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={generateBatch} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
                  {loading ? 'جاري التوليد...' : 'توليد الأكواد'}
                </button>
              </div>
            </div>
          </div>

          <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h2 className="font-bold text-slate-700">سجل الأكواد</h2>
                <div className="flex gap-2">
                  {['all', 'used', 'unused'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s as any)} className={`px-3 py-1 rounded-lg text-xs font-bold ${filterStatus === s ? 'bg-blue-600 text-white' : 'text-slate-400 bg-white border'}`}>
                      {s === 'all' ? 'الكل' : s === 'used' ? 'مستعمل' : 'جاهز'}
                    </button>
                  ))}
                </div>
             </div>
             <div className="overflow-y-auto max-h-[600px]">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {codes.filter(c => filterStatus === 'all' ? true : (filterStatus === 'used' ? c.isUsed : !c.isUsed)).map(c => (
                      <tr key={c.code} className={`hover:bg-slate-50 ${c.isUsed ? 'bg-slate-50 opacity-60' : ''}`}>
                        <td className="p-4 font-mono font-bold text-blue-700 text-lg">{c.code}</td>
                        <td className="p-4 text-center font-bold text-slate-500">{c.level}</td>
                        <td className="p-4 text-center">
                          {c.isUsed ? <span className="text-red-500 text-[10px] font-bold">بواسطة: {c.usedByEmail}</span> : <span className="text-emerald-500 text-[10px] font-bold">جاهز</span>}
                        </td>
                        <td className="p-4 text-left">
                          <button onClick={() => deleteItem('activationCodes', c.code)} className="text-slate-300 hover:text-red-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* فورم إضافة المحتوى */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-black mb-8 text-slate-800">إضافة محتوى جديد</h2>
            <form onSubmit={handleAddContent} className="space-y-6">
              <input 
                type="text" 
                placeholder="عنوان الدرس أو البث" 
                className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:border-blue-500 outline-none transition-all font-bold"
                value={newContent.title}
                onChange={e => setNewContent({...newContent, title: e.target.value})}
              />
              <textarea 
                placeholder="وصف مختصر للمحتوى" 
                className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:border-blue-500 outline-none transition-all min-h-[100px]"
                value={newContent.description}
                onChange={e => setNewContent({...newContent, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">النوع</label>
                  <select 
                    className="w-full p-4 rounded-xl border bg-slate-50 font-bold"
                    value={newContent.type}
                    onChange={e => setNewContent({...newContent, type: e.target.value as any})}
                  >
                    <option value="lesson">درس نصي</option>
                    <option value="video">فيديو (يوتيوب)</option>
                    <option value="live">بث مباشر</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">المستوى الدراسي</label>
                  <select 
                    className="w-full p-4 rounded-xl border bg-slate-50 font-bold"
                    value={newContent.level}
                    onChange={e => setNewContent({...newContent, level: e.target.value as any})}
                  >
                    {Object.values(EducationLevel).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              
              {newContent.type === 'live' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">موعد البث</label>
                  <input 
                    type="datetime-local" 
                    className="w-full p-4 rounded-xl border bg-slate-50 font-bold"
                    value={newContent.scheduledAt}
                    onChange={e => setNewContent({...newContent, scheduledAt: e.target.value})}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">
                  {newContent.type === 'lesson' ? 'محتوى الدرس (يدعم HTML)' : 'رابط الفيديو أو رابط البث'}
                </label>
                <textarea 
                  className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:border-blue-500 outline-none transition-all min-h-[200px] font-mono text-sm"
                  value={newContent.content}
                  onChange={e => setNewContent({...newContent, content: e.target.value})}
                  placeholder={newContent.type === 'video' ? 'https://www.youtube.com/watch?v=...' : 'اكتب محتوى الدرس هنا...'}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {loading ? 'جاري النشر...' : 'نشر المحتوى الآن'}
              </button>
            </form>
          </div>

          {/* قائمة المحتوى المنشور */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col">
            <div className="p-8 border-b border-slate-50">
              <h2 className="text-xl font-bold text-slate-800">المحتوى المنشور حالياً</h2>
            </div>
            <div className="overflow-y-auto max-h-[800px] p-6 space-y-4">
              {contentList.map(item => (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all flex justify-between items-center group">
                  <div className="flex gap-4 items-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${
                      item.type === 'lesson' ? 'bg-blue-50 text-blue-600' : 
                      item.type === 'video' ? 'bg-red-50 text-red-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {item.type === 'lesson' ? '📄' : item.type === 'video' ? '🎬' : '📡'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 leading-none">{item.title}</h4>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500">{item.level}</span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{item.type}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => deleteItem('content', item.id)} className="p-2 text-slate-200 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
              {contentList.length === 0 && <p className="text-center text-slate-300 py-10">لا يوجد محتوى منشور بعد.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
