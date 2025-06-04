import { useState, useEffect } from 'react';
import AuthPage from './AuthPage';
import { supabase } from './supabaseClient';
import FuelRecords from './FuelRecords';
import MaintenanceRecords from './MaintenanceRecords';
import ProfilePage from './ProfilePage';
import { NotificationProvider, useNotification } from './Notification';
import BottomNav from './BottomNav';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

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
      <Box minHeight="100vh" bgcolor="#f3f4f6">
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <ProfilePage />
        </Container>
        <BottomNav current={nav} onNavigate={setNav} />
      </Box>
    );
  }

  let mainContent;
  if (nav === 'fuel') mainContent = <FuelRecords />;
  else if (nav === 'maintenance') mainContent = <MaintenanceRecords />;
  else mainContent = (
    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
      <FuelRecords />
      <MaintenanceRecords />
    </Box>
  );

  return (
    <Box minHeight="100vh" bgcolor="#f3f4f6">
      <Container maxWidth="sm" sx={{ py: 4 }}>
        {mainContent}
      </Container>
      <BottomNav current={nav} onNavigate={setNav} />
    </Box>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}
