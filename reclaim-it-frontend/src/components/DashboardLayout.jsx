// src/components/DashboardLayout.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

export default function DashboardLayout({ role, children, onSignOut }) {
    const navItems = role === 'admin'
    ? [
        { label: 'Home',    path: '/dashboard' },
        { label: 'Requests', path: '/dashboard/requests' },
        { label: 'Profile',  path: '/dashboard/account' },
      ]
    : [
        { label: 'Home',    path: '/dashboard' },
        { label: 'Profile',  path: '/dashboard/account' },
    ];

  const styles = {
    container: {
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex',
      fontFamily: 'Inter, sans-serif',
    },
    sidebar: {
      width: 260,
      background: 'linear-gradient(180deg, #1e3a8a 0%, #111827 100%)',
      color: '#f3f4f6',
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      margin: 0,
      marginBottom: '2rem',
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    nav: {
      flex: 1,
    },
    navLink: (isActive) => ({
      display: 'block',
      padding: '0.75rem 1rem',
      marginBottom: '0.5rem',
      borderRadius: '8px',
      color: isActive ? '#fff' : '#9ca3af',
      background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
      textDecoration: 'none',
      transition: 'background 0.2s, color 0.2s',
      fontWeight: 500,
    }),
    logoutBtn: {
      marginTop: 'auto',
      width: '100%',
      padding: '0.75rem',
      background: '#800020',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'background 0.2s',
    },
    main: {
      flex: 1,
      padding: '2rem',
      background: '#f9fafb',
      overflowY: 'auto',
    },
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h2 style={styles.header}>Dashboard</h2>
        <nav style={styles.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}        // only “Home” uses end
              style={({ isActive }) => styles.navLink(isActive)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={onSignOut}
          style={styles.logoutBtn}
        >
          Logout
        </button>
      </aside>
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}
