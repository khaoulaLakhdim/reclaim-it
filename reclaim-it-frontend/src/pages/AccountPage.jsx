// src/pages/AccountPage.jsx
import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAccountData }      from '../api/account';
import { fetchListingById }    from '../api/listing';
import RequestCard             from '../components/RequestCard';

export default function AccountPage() {
  const { role } = useOutletContext();      // from DashboardLayout

  const [data, setData]       = useState(null);
  const [tab, setTab]         = useState('listings');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Detail‑modal state
  const [selected, setSelected]   = useState(null); // { request, listing }
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    getAccountData()
      .then(raw => {
        const profile = raw.profile.data[0];
        setData({
          profile,
          listings: raw.listings  || [],
          requests: raw.requests  || []
        });
      })
      .catch(() => setError('Failed to load account data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;
  if (!data)   return null;

  const { profile, listings, requests } = data;

  // Only two tabs
  const tabs = [
    { key: 'listings', label: 'My Listings' },
    { key: 'requests', label: 'My Requests' },
  ];

  async function openRequestDetail(req) {
    // fetch the full listing on demand
    const listing = await fetchListingById(req.listing_id).catch(() => null);
    setSelected({ request: req, listing });
    setShowDetail(true);
  }

  return (
    <div>
      {/* — Profile header — */}
      <h2>My Profile</h2>
      <p>
        <strong>Name:</strong>{' '}
        {profile.first_name || '(no first name)'}{' '}
        {profile.last_name || ''}
      </p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Role:</strong> {role}</p>
      {profile.member_type && (
        <p><strong>Member Type:</strong> {profile.member_type}</p>
      )}

      {/* — Tab bar — */}
      <div style={{ display: 'flex', gap: '1rem', margin: '2rem 0' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderBottom: tab === t.key
                ? '2px solid #667eea'
                : '2px solid transparent',
              background: 'transparent',
              cursor: 'pointer',
              fontWeight: tab === t.key ? 'bold' : 'normal',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* — Listings tab — */}
      {tab === 'listings' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))',
          gap: '1rem'
        }}>
          {listings.map(item => (
            <RequestCard
              key={item.listing_id}
              item={{
                title: item.title,
                description: item.description,
                image_url: item.image_url,
                listing_type: item.listing_type
              }}
            />
          ))}
        </div>
      )}

      {/* — Requests tab — */}
      {tab === 'requests' && (
        requests.length
          ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))',
              gap: '1rem'
            }}>
              {requests.map(req => (
                <RequestCard
                  key={req.claim_id}
                  item={{
                    title: req.title,
                    description: `Status: ${req.status}`,
                    image_url: req.image_url,
                    listing_type: req.listing_type
                  }}
                  onClick={() => openRequestDetail(req)}
                />
              ))}
            </div>
          )
          : <p>You have no requests.</p>
      )}

      {/* — Detail Modal — */}
      {showDetail && selected && (
        <div
          onClick={() => setShowDetail(false)}
          style={{
            position: 'fixed', top:0, left:0, right:0, bottom:0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 8,
              maxWidth: 600,
              width: '90%',
              padding: '2rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              maxHeight: '90%',
              overflowY: 'auto',
              position: 'relative'
            }}
          >
            <h3 style={{ margin: 0, marginBottom: '1rem', color: '#333' }}>
              Request Details
            </h3>
            <p><strong>Status:</strong> {selected.request.status}</p>
            <p>
              <strong>Requested at:</strong>{' '}
              {new Date(selected.request.claim_date).toLocaleString()}
            </p>

            <hr style={{ border:0, borderTop:'1px solid #eee', margin:'1rem 0' }}/>

            <h3 style={{ marginBottom: '1rem', color: '#333' }}>
              Listing Details
            </h3>
            {selected.listing ? (
              <>
                <img
                  src={selected.listing.image_url}
                  alt={selected.listing.title}
                  style={{
                    width:'100%',
                    maxHeight:240,
                    objectFit:'cover',
                    borderRadius:4,
                    marginBottom:'1rem'
                  }}
                />
                <p><strong>Title:</strong> {selected.listing.title}</p>
                <p><strong>Description:</strong> {selected.listing.description}</p>
                <p><strong>Location:</strong> {selected.listing.location}</p>
                <p><strong>Date:</strong> {selected.listing.event_date}</p>
              </>
            ) : (
              <p style={{ color: 'red' }}>Couldn’t load listing info.</p>
            )}

            <button
              onClick={() => setShowDetail(false)}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'transparent', border: 'none',
                fontSize: '1.2rem', cursor: 'pointer', color: '#888'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
