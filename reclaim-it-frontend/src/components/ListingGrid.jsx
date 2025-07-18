// src/components/ListingGrid.jsx
import React from 'react';
import ListingCard from './ListingCard';

export default function ListingGrid({
  items = [],
  showRequestButton = false,
  onRequest = () => {}
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1rem',
      }}
    >
      {items.map(item => (
        <ListingCard
          key={item.id}
          item={item}
          showRequestButton={showRequestButton}
          onRequest={onRequest}
        />
      ))}
    </div>
  );
}
