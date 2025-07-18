// src/pages/AccountPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { fetchUser, getRole, signOut } from '../api/auth';
import ListingGrid from '../components/ListingGrid';
import ListingCard from '../components/ListingCard';
// import api from '../api'; // your listings/claims API

export default function AccountPage() {
  const [user, setUser]         = useState(null);
  const [role, setRole]         = useState('member');
  const [tab, setTab]           = useState('listings');
  const [listingsData, setListingsData] = useState([]);
  const [requestsData, setRequestsData] = useState([]);
  const [claimsData, setClaimsData]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // ==== Real API calls (commented out) ====
    // Promise.all([fetchUser(), getRole()])
    //   .then(([uRes, rRes]) => {
    //     const u = uRes.data?.user || uRes.data;
    //     setUser(u);
    //     setRole(rRes.data.role);
    //   })
    //   .catch(() => setError('Failed to load profile'));

    // ==== In‑memory user ====
    setUser({
      id: 'dummy-user-id',
      email: 'member@example.com',
      user_metadata: {
        first_name: 'Jane',
        last_name: 'Doe',
        member_type: 'S',
      },
    });
    setRole('member'); // or 'admin'
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // ==== Real API calls (commented out) ====
    // const listingsPromise = api.from('view_listings_by_user').select('*').eq('reported_by', user.id);
    // const requestsPromise = api.from('claims').select('*').eq('claimant_id', user.id);
    // const claimsPromise   = api.from('view_pending_claims').select('*');
    //
    // Promise.all([listingsPromise, requestsPromise, claimsPromise])
    //   .then(([lRes, rRes, cRes]) => {
    //     setListingsData(lRes.data);
    //     setRequestsData(rRes.data);
    //     setClaimsData(cRes.data);
    //   })
    //   .catch(() => setError('Failed to load data'))
    //   .finally(() => setLoading(false));

    // ==== In‑memory fallback ====
    setTimeout(() => {
      setListingsData([
        { listing_id: 'L1', title: 'Blue Backpack', description: 'Lost near the library.' },
        { listing_id: 'L2', title: 'Yellow Notebook', description: 'Lost during lecture.' },
      ]);
      setRequestsData([
        { claim_id: 'C1', listing_id: 'L1', status: 'pending' },
      ]);
      setClaimsData([
        { claim_id: 'C1', listing_id: 'L1', claimant_first: 'Jane', claimant_last: 'Doe', title: 'Blue Backpack' },
      ]);
      setLoading(false);
    }, 300);
  }, [user]);

  if (loading) return <p>Loading…</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;

  // Define tabs
  const tabs = role === 'admin'
    ? [{ key: 'claims', label: 'Pending Claims' }]
    : [
        { key: 'listings', label: 'My Listings' },
        { key: 'requests', label: 'My Requests' },
      ];

  return (
    <div>
      <h2>My Profile</h2>
      <p><strong>Name:</strong> {user.user_metadata.first_name} {user.user_metadata.last_name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {role}</p>
      {role === 'member' && (
        <p><strong>Type:</strong> {user.user_metadata.member_type}</p>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '1rem', margin: '2rem 0' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderBottom: tab === t.key ? '2px solid #667eea' : '2px solid transparent',
              background: 'transparent',
              cursor: 'pointer',
              fontWeight: tab === t.key ? 'bold' : 'normal',
            }}
          >
            {t.label}
          </button>
        ))}
        
      </div>

      {/* Content – switch using preloaded data */}
      {tab === 'listings' && (
        <ListingGrid items={listingsData} showRequestButton={false} />
      )}
      {tab === 'requests' && (
        requestsData.map(req => (
          <ListingCard
            key={req.claim_id}
            item={{ title: `Claim for ${req.listing_id}`, description: `Status: ${req.status}` }}
          />
        ))
      )}
      {tab === 'claims' && (
        claimsData.map(c => (
          <div key={c.claim_id} style={{ marginBottom: '1rem' }}>
            <p>{c.title} requested by {c.claimant_first} {c.claimant_last}</p>
            <button disabled>Approve</button>
            <button disabled>Reject</button>
          </div>
        ))
      )}
    </div>
  );
}
