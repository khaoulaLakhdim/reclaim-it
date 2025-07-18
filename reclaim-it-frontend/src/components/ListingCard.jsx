// src/components/ListingCard.jsx
import React from 'react';

export default function ListingCard({
  item,
  showRequestButton = false,
  onRequest = () => {}
}) {
  const styles = {
    card: {
      background: '#fff',
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    title: {
      margin: 0,
      fontSize: '1.1rem',
      fontWeight: 600,
      color: '#1f2937',
    },
    description: {
      flex: 1,
      fontSize: '0.9rem',
      color: '#4b5563',
      margin: '0.5rem 0 1rem',
    },
    btn: {
      padding: '0.5rem',
      background: '#3b82f6',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 500,
      transition: 'background 0.2s',
    }
  };

  return (
    <div style={styles.card}>
      <h4 style={styles.title}>{item.title}</h4>
      <p style={styles.description}>{item.description}</p>
      {showRequestButton && (
        <button
          onClick={() => onRequest(item)}
          style={styles.btn}
          onMouseEnter={e => (e.currentTarget.style.background = '#2563eb')}
          onMouseLeave={e => (e.currentTarget.style.background = '#3b82f6')}
        >
          Request Claim
        </button>
      )}
    </div>
  );
}
