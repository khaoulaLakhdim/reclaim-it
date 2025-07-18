import React, { useEffect, useState } from 'react';
import ListingGrid from '../components/ListingGrid';
// import { fetchAllRequests } from '../api/listings';

export default function RequestsPage() {
  const [requests, setRequests] = useState([
    { id: 'rq1', title: 'Lost Wallet', description: 'User A claims it.' },
    { id: 'rq2', title: 'Found Glasses', description: 'User B claims them.' },
  ]);

  useEffect(() => {
    // fetchAllRequests().then(res => setRequests(res.data)).catch(console.error);
  }, []);

  return (
    <>
      <h2>All Claim Requests</h2>
      <ListingGrid items={requests} showRequestButton={false} />
    </>
  );
}
