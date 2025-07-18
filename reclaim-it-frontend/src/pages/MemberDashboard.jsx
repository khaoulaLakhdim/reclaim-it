// src/pages/MemberDashboard.jsx
import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ListingGrid from '../components/ListingGrid';
import AddItemDialog from '../components/AddItemDialog';

export default function MemberDashboard({ role, onSignOut }) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  // Replace with real fetch
  const dummyItems = [
    { id: '1', title: 'Blue Backpack', description: 'Lost near library.' },
    { id: '2', title: 'Silver Watch', description: 'Found in cafeteria.' },
    // …
  ];

  const handleRequest = (item) => {
    console.log('Requesting claim for', item);
    // TODO: call your API to create a claim request
  };

  return (
    <DashboardLayout role={role} onSignOut={onSignOut}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => setDialogOpen(true)}
          style={{
            padding: '0.5rem 1rem',
            background: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Add Listing
        </button>
      </div>

      <ListingGrid
        items={dummyItems}
        showRequestButton={true}
        onRequest={handleRequest}
      />

      <AddItemDialog open={isDialogOpen} onClose={() => setDialogOpen(false)} />
    </DashboardLayout>
  );
}
