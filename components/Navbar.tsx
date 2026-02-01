
import React from 'react';
import { auth } from '../firebaseConfig';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
}

const Navbar: React.FC<Props> = ({ profile }) => {
  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <span className="text-xl font-bold">ت</span>
          </div>
          <span className="font-bold text-xl text-blue-800 hidden sm:block">منصة التميز</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end text-xs">
            <span className="font-bold text-gray-700">{profile.email}</span>
            <span className="text-blue-500 font-semibold">{profile.role === 'admin' ? 'مدير النظام' : profile.level}</span>
          </div>
          
          <button
            onClick={() => auth.signOut()}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
          >
            <span>خروج</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
