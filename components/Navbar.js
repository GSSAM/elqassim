
import React from 'react';
import { auth } from '../firebaseConfig.js';

const Navbar = ({ profile }) => {
  return (
    <nav className="bg-white border-b sticky top-0 z-50 text-right">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <span className="text-xl font-bold">ت</span>
          </div>
          <span className="font-bold text-xl text-blue-800 hidden sm:block">منصة التميز</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end text-xs">
            <span className="font-bold text-gray-700">{profile.email}</span>
            <span className="text-blue-500 font-semibold">{profile.role === 'admin' ? 'مدير النظام' : profile.level}</span>
          </div>
          <button onClick={() => auth.signOut()} className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border">خروج</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
