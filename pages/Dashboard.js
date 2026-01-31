
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';

const Dashboard = ({ profile }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(query(collection(db, 'sections')));
        const allSections = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      <header className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">أهلاً بك، {profile.email.split('@')[0]}!</h1>
          <p className="text-gray-500">مستوى: <span className="font-semibold text-blue-600">{profile.level}</span></p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-blue-700 text-sm font-bold">الحساب مفعل ومؤمن</span>
        </div>
      </header>

      <section>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          أقسامك الدراسية
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => <div key={n} className="h-48 bg-white animate-pulse rounded-2xl"></div>)}
          </div>
        ) : sections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map(section => (
              <div key={section.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border group">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">{section.title}</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">{section.description}</p>
                <button className="w-full bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 font-bold py-2 rounded-lg transition-all">دخول القسم</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-400">لا توجد أقسام متاحة لمستواك الدراسي حالياً.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
