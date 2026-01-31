import React from 'react';

const LoadingScreen: React.FC<{ message?: string }> = ({ message = "جاري التحميل..." }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-6 text-slate-500 font-bold animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingScreen;