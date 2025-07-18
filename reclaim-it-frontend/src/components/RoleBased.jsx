import React, { useEffect, useState } from 'react';
import { getRole } from '../api/auth';

/**
 * Fetches the current user’s role and renders either
 * the `admin` or `member` prop accordingly.
 */
export default function RoleBased({ admin, member }) {
  const [role, setRole]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getRole()
      .then(res => setRole(res.data.role))
      .catch(err => setError(err.response?.data?.detail || 'Failed to load role'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error)   return <p style={{ color: 'red' }}>Error: {error}</p>;

  return role === 'admin' ? admin : member;
}
