import { useState, useEffect } from 'react';
import AuthPage from './AuthPage';
import { supabase } from './supabaseClient';
import './App.css';
import FuelRecords from './FuelRecords';
import MaintenanceRecords from './MaintenanceRecords';
import ProfilePage from './ProfilePage';
import { NotificationProvider, useNotification } from './Notification';

function AppContent() {
  const [session, setSession] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
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

  if (showProfile) {
    return (
      <div className="app-bg">
        <div className="app-container">
          <div className="app-header">
            <h1 className="app-title">Profile</h1>
            <button className="secondary app-btn" onClick={() => setShowProfile(false)}>
              Back
            </button>
          </div>
          <ProfilePage />
        </div>
      </div>
    );
  }

  return (
    <div className="app-bg">
      <div className="app-container">
        <div className="app-header">
          <h1 className="app-title">Car Maintenance & Fuel Tracker</h1>
          <div className="app-btn-group">
            <button className="app-btn" onClick={() => setShowProfile(true)}>
              Profile
            </button>
            <button className="secondary app-btn" onClick={async () => {
              await supabase.auth.signOut();
              setSession(null);
              notify('Logged out', 'success');
            }}>
              Logout
            </button>
          </div>
        </div>
        <div className="app-grid">
          <FuelRecords />
          <MaintenanceRecords />
        </div>
      </div>
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
