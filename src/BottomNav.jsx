// BottomNav.jsx - Responsive, fixed bottom navigation bar with icons only
import React from 'react';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import BuildIcon from '@mui/icons-material/Build';

const navItems = [
  { key: 'home', label: 'Home', icon: <HomeIcon /> },
  { key: 'fuel', label: 'Fuel', icon: <LocalGasStationIcon /> },
  { key: 'maintenance', label: 'Maintenance', icon: <BuildIcon /> },
  { key: 'profile', label: 'Profile', icon: <PersonIcon /> },
];

export default function BottomNav({ current, onNavigate }) {
  return (
    <Paper elevation={8} sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 100, borderRadius: '18px 18px 0 0', maxWidth: 420, margin: '0 auto 12px auto', height: 64 }}>
      <BottomNavigation
        showLabels
        value={navItems.findIndex(item => item.key === current)}
        onChange={(_, newValue) => onNavigate(navItems[newValue].key)}
        sx={{ borderRadius: '18px 18px 0 0', height: 64 }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.key}
            label={item.label}
            icon={item.icon}
            sx={{ minWidth: 0, maxWidth: 120 }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
