import React, { useEffect, useState } from 'react';
import ListingGrid from '../components/ListingGrid';
// import { fetchProcessedClaims } from '../api/listings';

export default function ClaimsPage() {
  const [claims, setClaims] = useState([
    { id: 'c1', title: 'Black Jacket', description: 'Approved claim.' },
    { id: 'c2', title: 'Set of Keys',  description: 'Rejected claim.' },
  ]);

  useEffect(() => {
    // fetchProcessedClaims().then(res => setClaims(res.data)).catch(console.error);
  }, []);

  return (
    <>
      <h2>Processed Claims</h2>
      <ListingGrid items={claims} showRequestButton={false} />
    </>
  );
}
