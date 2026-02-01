
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserProfile, EducationalContent, ContentType } from '../types';

interface Props { profile: UserProfile; }

const Dashboard: React.FC<Props> = ({ profile }) => {
  const [content, setContent] = useState<EducationalContent[]>([]);
  const [filter, setFilter] = useState<ContentType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [readingLesson, setReadingLesson] = useState<EducationalContent | null>(null);

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

  if (readingLesson) {
    return (
      <div className="bg-white min-h-screen rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom duration-500">
        <div className="bg-blue-600 p-8 text-white flex justify-between items-center">
          <div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">درس تعليمي</span>
            <h1 className="text-3xl font-black">{readingLesson.title}</h1>
          </div>
          <button onClick={() => setReadingLesson(null)} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/30 transition-all font-bold">X</button>
        </div>
        <div className="p-8 md:p-12 prose prose-blue max-w-none text-right leading-loose text-slate-700" dangerouslySetInnerHTML={{ __html: readingLesson.content }}></div>
        <div className="p-8 border-t border-slate-50 flex justify-center">
          <button onClick={() => setReadingLesson(null)} className="bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-700 transition-all">العودة للرئيسية</button>
        </div>
      </div>
    );
  }

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

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['all', 'lesson', 'video', 'live'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t as any)}
            className={`px-8 py-3 rounded-2xl whitespace-nowrap font-bold transition-all ${filter === t ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
          >
            {t === 'all' ? 'الكل' : t === 'lesson' ? '📑 الدروس' : t === 'video' ? '🎬 الفيديوهات' : '📡 بث مباشر'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white animate-pulse rounded-3xl border border-slate-100"></div>)}
        </div>
      ) : filteredContent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {filteredContent.map(item => (
            <div key={item.id} className="bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all border border-slate-100 overflow-hidden group">
              <div className={`h-2 bg-gradient-to-l ${item.type === 'lesson' ? 'from-blue-500 to-cyan-400' : item.type === 'video' ? 'from-red-500 to-rose-400' : 'from-purple-500 to-indigo-400'}`}></div>
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${item.type === 'lesson' ? 'bg-blue-50 text-blue-600' : item.type === 'video' ? 'bg-red-50 text-red-600' : 'bg-purple-50 text-purple-600'}`}>
                    {item.type === 'lesson' ? 'درس تعليمي' : item.type === 'video' ? 'شرح فيديو' : 'بث مباشر'}
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono">{item.createdAt?.toDate().toLocaleDateString('ar-EG')}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">{item.description}</p>
                
                {item.type === 'video' ? (
                  <div className="aspect-video bg-slate-900 rounded-2xl mb-4 overflow-hidden shadow-inner">
                    <iframe className="w-full h-full" src={item.content} title="YouTube video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                  </div>
                ) : item.type === 'live' ? (
                  <div className="bg-purple-50 p-6 rounded-2xl mb-4 border border-purple-100 text-center">
                    <div className="animate-pulse mb-3 inline-block">🔴</div>
                    <p className="text-purple-700 text-sm font-bold mb-4">موعد البث القادم: {item.scheduledAt ? new Date(item.scheduledAt.toDate()).toLocaleString('ar-EG') : 'قريباً'}</p>
                    <a href={item.content} target="_blank" rel="noreferrer" className="block w-full text-center bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 shadow-md transition-all active:scale-95">الانضمام للبث المباشر</a>
                  </div>
                ) : (
                   <button onClick={() => setReadingLesson(item)} className="w-full bg-slate-50 text-slate-700 font-bold py-4 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2">
                     <span>ابدأ القراءة والمذاكرة</span>
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                   </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-20 text-center rounded-3xl border border-dashed border-slate-200">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">قريباً جداً...</h2>
          <p className="text-slate-400 font-bold">يقوم فريقنا حالياً بتجهيز أقوى المحتويات التعليمية لمستواك الدراسي.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
