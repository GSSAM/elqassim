import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Activation from './pages/Activation.js';
import Dashboard from './pages/Dashboard.js';
import AdminPanel from './pages/AdminPanel.js';
import Navbar from './components/Navbar.js';
import LoadingScreen from './components/LoadingScreen.js';

const App = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('login');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
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

  if (!profile.isActive) {
    return <Activation profile={profile} onActivated={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar profile={profile} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {profile.role === 'admin' ? (
          <AdminPanel profile={profile} />
        ) : (
          <Dashboard profile={profile} />
        )}
      </main>
      <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
        جميع الحقوق محفوظة لمنصة التميز التعليمية &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;