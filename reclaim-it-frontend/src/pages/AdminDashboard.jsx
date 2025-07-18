// src/pages/AdminDashboard.jsx
import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ListingGrid from '../components/ListingGrid';

export default function AdminDashboard({ role, onSignOut }) {
  // Same dummy data (or fetch the real listings)
  const dummyItems = [
    { id: '1', title: 'Blue Backpack', description: 'Lost near library.' },
    { id: '2', title: 'Silver Watch', description: 'Found in cafeteria.' },
    // …
  ];

  return (
    <DashboardLayout role={role} onSignOut={onSignOut}>
      <ListingGrid
        items={dummyItems}
        showRequestButton={false}  // no “Request Claim” for admins
      />
    </DashboardLayout>
  );
}
