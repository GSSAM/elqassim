import React from 'react';
import { UserProfile } from '../types';

const Dashboard: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  return (
    <div className="space-y-8 text-right">
      <div className="bg-white p-8 rounded-3xl shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">مرحباً بك في منصة التميز</h1>
          <p className="text-slate-500">{profile.email} - <span className="text-blue-600 font-bold">{profile.level}</span></p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-5 py-2 rounded-full font-bold text-sm border border-emerald-100 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          حسابك نشط
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">📚</div>
          <h3 className="font-bold">المواد الدراسية</h3>
          <p className="text-sm text-slate-400">تصفح المحتوى التعليمي الخاص بمستواك</p>
          <button className="w-full bg-slate-100 py-3 rounded-xl font-bold text-slate-600 hover:bg-blue-600 hover:text-white transition-all">فتح</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;