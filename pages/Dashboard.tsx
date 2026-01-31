import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserProfile, Section } from '../types';

const Dashboard: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(query(collection(db, 'sections')));
        const allSections = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Section));
        
        // Filter sections based on user role and level
        const accessible = allSections.filter(s => 
          s.allowedRoles.includes(profile.role) && 
          (s.allowedLevels.length === 0 || s.allowedLevels.includes(profile.level))
        );
        setSections(accessible);
      } catch (err) {
        console.error("Error fetching sections:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, [profile]);

  return (
    <div className="space-y-8 text-right">
      <header className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">مرحباً بك، {profile.email.split('@')[0]}</h1>
          <p className="text-slate-500 mt-1">الصف الدراسي: <span className="text-blue-600 font-bold">{profile.level}</span></p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl font-bold text-sm border border-emerald-100 flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          حسابك نشط ومفعل
        </div>
      </header>

      <section>
        <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-lg">📚</span>
          المواد والأقسام الدراسية
        </h2>

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2, 3].map(i => (
               <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-slate-100"></div>
             ))}
           </div>
        ) : sections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map(section => (
              <div key={section.id} className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-all duration-300 group cursor-pointer hover:border-blue-200">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                  {section.icon || '📖'}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{section.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6 h-10 line-clamp-2">
                  {section.description || 'تصفح المحتوى التعليمي والدروس الخاصة بهذا القسم...'}
                </p>
                <button className="w-full bg-slate-50 py-4 rounded-xl font-bold text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center gap-2">
                  <span>دخول القسم</span>
                  <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📭</div>
            <h3 className="font-bold text-slate-600">لا توجد أقسام متاحة حالياً</h3>
            <p className="text-slate-400 text-sm mt-2">يرجى التحقق من مستواك الدراسي أو التواصل مع الإدارة.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;