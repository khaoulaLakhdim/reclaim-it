import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getRole, signOut } from '../api/auth';

export default function DashboardPage({ children, onSignOut}) {
  const [role, setRole]     = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]    = useState('');

  useEffect(() => {
    getRole()
      .then(res => setRole(res.data.role))
      .catch(err => setError(err.response?.data?.detail || 'Failed to load role'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    signOut();
    window.location.href = '/auth';
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <DashboardLayout role={role} onSignOut={handleLogout}>
      {/* All nested pages will render here */}
      <Outlet context={{ role }}> {children}</Outlet>
    </DashboardLayout>
  );
}
