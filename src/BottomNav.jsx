// BottomNav.jsx - Responsive, fixed bottom navigation bar with icons only
import React from 'react';

// Simple SVG icons (inline, no external deps)
const icons = {
  home: (
    <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><path d="M3 11.5L12 4l9 7.5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 10.5V20a1 1 0 0 0 1 1h3.5a1 1 0 0 0 1-1v-4h2v4a1 1 0 0 0 1 1H18a1 1 0 0 0 1-1v-9.5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  profile: (
    <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="4" stroke="#2563eb" strokeWidth="2"/><path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke="#2563eb" strokeWidth="2"/></svg>
  ),
  fuel: (
    <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><rect x="4" y="3" width="10" height="18" rx="2" stroke="#2563eb" strokeWidth="2"/><path d="M14 7h2a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2" stroke="#2563eb" strokeWidth="2"/><circle cx="9" cy="16" r="1.5" fill="#2563eb"/></svg>
  ),
  maintenance: (
    <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><path d="M21 7.5l-4.5 4.5-3-3L3 19.5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="17.5" cy="7.5" r="2.5" stroke="#2563eb" strokeWidth="2"/></svg>
  ),
};

const navItems = [
  { key: 'home', label: 'Home', icon: icons.home },
  { key: 'fuel', label: 'Fuel', icon: icons.fuel },
  { key: 'maintenance', label: 'Maintenance', icon: icons.maintenance },
  { key: 'profile', label: 'Profile', icon: icons.profile },
];

export default function BottomNav({ current, onNavigate }) {
  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.key}
          className={
            'bottom-nav-btn' + (current === item.key ? ' active' : '')
          }
          aria-label={item.label}
          onClick={() => onNavigate(item.key)}
          type="button"
        >
          {item.icon}
        </button>
      ))}
    </nav>
  );
}
