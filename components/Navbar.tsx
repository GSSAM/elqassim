import React from 'react';
import { auth } from '../firebaseConfig';
import { UserProfile } from '../types';

const Navbar: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  return (
    <nav className="bg-white border-b h-20 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl">ت</div>
          <span className="font-bold text-slate-800 text-xl hidden sm:block">منصة التميز</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-700 leading-none">{profile.email}</p>
            <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase">{profile.role === 'admin' ? 'المدير' : profile.level}</p>
          </div>
          <button onClick={() => auth.signOut()} className="px-5 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold text-sm border border-red-100 transition-colors">خروج</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;