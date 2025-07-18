import React, { useEffect, useState } from 'react';
import ListingGrid from '../components/ListingGrid';
// import { fetchMyListings } from '../api/listings';

export default function MyListingsPage() {
  const [items, setItems] = useState([
    { id: '1', title: 'Blue Backpack', description: 'Lost near library.' },
    { id: '2', title: 'Silver Watch', description: 'Found in cafeteria.' },
  ]);

  useEffect(() => {
    // fetchMyListings().then(res => setItems(res.data)).catch(console.error);
  }, []);

  return (
    <>
      <h2>My Listings</h2>
      <ListingGrid items={items} showRequestButton={false} />
    </>
  );
}
