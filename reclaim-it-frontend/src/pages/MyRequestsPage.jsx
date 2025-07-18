import React, { useEffect, useState } from 'react';
import ListingGrid from '../components/ListingGrid';
// import { fetchMyRequests } from '../api/listings';

export default function MyRequestsPage() {
  const [requests, setRequests] = useState([
    { id: 'r1', title: 'Red Umbrella', description: 'Claim requested.' },
    { id: 'r2', title: 'Car Keys', description: 'Waiting for approval.' },
  ]);

  useEffect(() => {
    // fetchMyRequests().then(res => setRequests(res.data)).catch(console.error);
  }, []);

  return (
    <>
      <h2>My Claim Requests</h2>
      <ListingGrid items={requests} showRequestButton={false} />
    </>
  );
}
