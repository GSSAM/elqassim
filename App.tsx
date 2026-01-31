import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { UserProfile } from './types';
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
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error("Auth profile error:", error);
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

  if (!profile) return <LoadingScreen message="جاري إعداد حسابك..." />;

  if (!profile.isActive) {
    return <Activation profile={profile} onActivated={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {profile.role === 'admin' ? (
          <AdminPanel />
        ) : (
          <Dashboard profile={profile} />
        )}
      </main>
      <footer className="bg-white border-t py-6 text-center text-gray-400 text-sm">
        جميع الحقوق محفوظة لمنصة التميز التعليمية &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;