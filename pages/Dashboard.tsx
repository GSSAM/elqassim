import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserProfile, Section } from '../types';

interface Props { profile: UserProfile; }

const Dashboard: React.FC<Props> = ({ profile }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const querySnapshot = await getDocs(query(collection(db, 'sections')));
        const all = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Section[];
        const filtered = all.filter(s =>
          s.allowedRoles.includes(profile.role) &&
          (s.allowedLevels.length === 0 || s.allowedLevels.includes(profile.level))
        );
        setSections(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, [profile]);

  return (
    <div className="space-y-8 text-right">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">أهلاً بك في منصة التميز</h1>
          <p className="text-slate-500">{profile.email} - <span className="text-blue-600 font-bold">{profile.level}</span></p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-5 py-2 rounded-full font-bold text-sm border border-emerald-100 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          حسابك مفعل
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-48 bg-white rounded-3xl animate-pulse"></div>)
        ) : sections.length > 0 ? (
          sections.map(section => (
            <div key={section.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-xl transition group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">📚</div>
              <h3 className="text-lg font-bold mb-2">{section.title}</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">{section.description}</p>
              <button className="w-full bg-slate-50 text-slate-700 font-bold py-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all">فتح المحتوى</button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-gray-400">لا توجد مواد مخصصة لمستواك حالياً.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;