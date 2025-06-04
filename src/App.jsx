import { useState, useEffect } from 'react';
import AuthPage from './AuthPage';
import { supabase } from './supabaseClient';
import './App.css';
import FuelRecords from './FuelRecords';
import MaintenanceRecords from './MaintenanceRecords';
import ProfilePage from './ProfilePage';
import { NotificationProvider, useNotification } from './Notification';
import BottomNav from './BottomNav';

function AppContent() {
  const [session, setSession] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [nav, setNav] = useState('home');
  const notify = useNotification();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') notify('Logged out', 'success');
      if (event === 'SIGNED_IN') notify('Login successful', 'success');
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [notify]);

  if (!session) {
    return <AuthPage onAuth={() => {
      supabase.auth.getSession().then(({ data }) => setSession(data.session));
      notify('Login successful', 'success');
    }} />;
  }

  // Mobile navigation logic
  if (showProfile || nav === 'profile') {
    return (
      <div className="app-bg">
        <div className="app-container responsive-app-container">
          <ProfilePage />
        </div>
        <BottomNav current={nav} onNavigate={setNav} />
      </div>
    );
  }

  let mainContent;
  if (nav === 'fuel') mainContent = <FuelRecords />;
  else if (nav === 'maintenance') mainContent = <MaintenanceRecords />;
  else mainContent = (
    <div className="app-grid">
      <FuelRecords />
      <MaintenanceRecords />
    </div>
  );

  return (
    <div className="app-bg">
      <div className="app-container responsive-app-container">
        {mainContent}
      </div>
      <BottomNav current={nav} onNavigate={setNav} />
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}
