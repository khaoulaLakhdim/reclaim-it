import React from 'react';

export default function RequestCard({ item, onClick }) {
  const accent = item.listing_type === 'L' ? '#e53e3e' : '#38a169'; // L=Lost, F=Found

  return (
    <div
      onClick={onClick}
      style={{
        border: `1px solid #ddd`,
        borderRadius: 8,
        overflow: 'hidden',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: onClick ? 'pointer' : 'default'
      }}
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
    </div>
  );
}
