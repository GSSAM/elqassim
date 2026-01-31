
import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-blue-600">ت</div>
      </div>
      <p className="mt-6 text-gray-500 animate-pulse font-semibold">جاري تحضير المنصة...</p>
    </div>
  );
};

export default LoadingScreen;
