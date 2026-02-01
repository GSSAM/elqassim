
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { UserProfile, UserRole } from './types';
import Login from './pages/Login';
import Register from './pages/Register';
import Activation from './pages/Activation';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          
          // تحديث حالة النشاط بناءً على تاريخ انتهاء الاشتراك
          let isActive = data.isActive;
          if (data.role !== UserRole.ADMIN && data.subEnd) {
            const now = new Date();
            const expiry = data.subEnd.toDate();
            if (now > expiry) isActive = false;
          }
          
          if (isActive !== data.isActive) {
            await updateDoc(userRef, { isActive });
            data.isActive = isActive;
          }

          setProfile(data);
          await updateDoc(userRef, { lastLogin: serverTimestamp() });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <LoadingScreen />;

  if (!user) {
    return view === 'login' ? (
      <Login onToggle={() => setView('register')} />
    ) : (
      <Register onToggle={() => setView('login')} />
    );
  }

  if (!profile) return <LoadingScreen />;

  // إذا كان الطالب غير مفعل أو اشتراكه منتهي
  if (!profile.isActive && profile.role !== UserRole.ADMIN) {
    return <Activation profile={profile} onActivated={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar profile={profile} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {profile.role === UserRole.ADMIN ? (
          <AdminPanel />
        ) : (
          <Dashboard profile={profile} />
        )}
      </main>
      <footer className="bg-white border-t py-8 text-center text-slate-400 text-sm">
        <p className="font-bold text-slate-600 mb-1">منصة التميز التعليمية</p>
        <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;
