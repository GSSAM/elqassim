
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserProfile, EducationalContent, ContentType } from '../types';

interface Props { profile: UserProfile; }

const Dashboard: React.FC<Props> = ({ profile }) => {
  const [content, setContent] = useState<EducationalContent[]>([]);
  const [filter, setFilter] = useState<ContentType | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'content'),
          where('level', '==', profile.level),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setContent(snap.docs.map(d => ({ id: d.id, ...d.data() } as EducationalContent)));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchContent();
  }, [profile]);

  const filteredContent = filter === 'all' ? content : content.filter(c => c.type === filter);

  const daysLeft = profile.subEnd ? Math.ceil((profile.subEnd.toDate().getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="space-y-8 text-right">
      <header className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">مرحباً بك، {profile.email.split('@')[0]} 👋</h1>
          <div className="flex gap-3 mt-4">
            <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-sm font-bold border border-blue-100">{profile.level}</span>
            <span className={`px-4 py-1 rounded-full text-sm font-bold border ${daysLeft < 5 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              متبقي {daysLeft} يوم في اشتراكك
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[200px]">
          <span className="text-slate-400 text-xs mb-1">تاريخ انتهاء الصلاحية</span>
          <span className="text-xl font-mono font-bold text-slate-700">
            {profile.subEnd?.toDate().toLocaleDateString('ar-EG')}
          </span>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'lesson', 'video', 'live'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t as any)}
            className={`px-6 py-2 rounded-full whitespace-nowrap font-bold transition-all ${filter === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
          >
            {t === 'all' ? 'الكل' : t === 'lesson' ? 'الدروس' : t === 'video' ? 'الفيديوهات' : 'بث مباشر'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white animate-pulse rounded-3xl border border-slate-100"></div>)}
        </div>
      ) : filteredContent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredContent.map(item => (
            <div key={item.id} className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all border border-slate-100 overflow-hidden group">
              <div className={`h-3 bg-gradient-to-l ${item.type === 'lesson' ? 'from-blue-500 to-cyan-400' : item.type === 'video' ? 'from-red-500 to-rose-400' : 'from-purple-500 to-indigo-400'}`}></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${item.type === 'lesson' ? 'bg-blue-50 text-blue-600' : item.type === 'video' ? 'bg-red-50 text-red-600' : 'bg-purple-50 text-purple-600'}`}>
                    {item.type === 'lesson' ? 'درس نصي' : item.type === 'video' ? 'فيديو' : 'بث مباشر'}
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono">{item.createdAt.toDate().toLocaleDateString('ar-EG')}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">{item.description}</p>
                
                {item.type === 'video' ? (
                  <div className="aspect-video bg-slate-900 rounded-xl mb-4 overflow-hidden shadow-inner">
                    <iframe className="w-full h-full" src={item.content} title="YouTube video" frameBorder="0" allowFullScreen></iframe>
                  </div>
                ) : item.type === 'live' ? (
                  <div className="bg-purple-50 p-4 rounded-xl mb-4 border border-purple-100">
                    <p className="text-purple-700 text-xs font-bold mb-2">موعد البث: {item.scheduledAt?.toDate().toLocaleString('ar-EG')}</p>
                    <a href={item.content} target="_blank" rel="noreferrer" className="block w-full text-center bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700">الانضمام للبث الآن</a>
                  </div>
                ) : (
                   <button onClick={() => alert('سيتم فتح المحتوى النصي هنا')} className="w-full bg-slate-50 text-slate-700 font-bold py-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all">قراءة الدرس</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-20 text-center rounded-3xl border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <p className="text-slate-400 font-bold">لا يوجد محتوى متاح لمستواك حالياً.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
