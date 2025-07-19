// src/components/ListingCard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ListingCard({ item, showRequestButton }) {
  const navigate = useNavigate();
  const accent   = item.listing_type === 'L' ? '#e53e3e' : '#38a169'; // L=Lost, F=Found

  // when the member hits “Claim Item” on the card,
  // we navigate straight to the detail page and hand off the item
  function handleCardClaimClick(e) {
    e.stopPropagation();
    e.preventDefault(); // prevent Link itself
    navigate(`/dashboard/listings/${item.listing_id}`, { state: { item } });
  }

  return (
    <div style={{
      border: `1px solid #ddd`,
      borderRadius: 8,
      overflow: 'hidden',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      cursor: 'pointer'
    }}>
      <Link
        to={`/dashboard/listings/${item.listing_id}`}
        state={{ item }}
        style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}
      >
        <div style={{ borderTop: `4px solid ${accent}`, height: 4 }} />
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.title}
            style={{ width: '100%', height: 120, objectFit: 'cover' }}
          />
        )}
        <div style={{ padding: '0.75rem', flex: 1 }}>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>
            {item.title}
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>
            {item.description}
          </p>
        </div>
      </Link>

      {/*
        Only show the claim button if:
        1) showRequestButton is true (i.e. member view)
        2) this is a “found” item (listing_type === 'F')
      */}
      {showRequestButton && item.listing_type === 'F' && (
        <button
          onClick={handleCardClaimClick}
          style={{
            margin: '0.5rem',
            padding: '0.5rem',
            background: '#3182ce',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Claim Item
        </button>
      )}
    </div>
  );
}
