import React from 'react';

/**
 * Simple modal dialog to “add an item.”
 * For now it just displays a message and a Close button.
 */
export default function AddItemDialog({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          padding: '2rem',
          minWidth: '300px',
          textAlign: 'center',
        }}
      >
        <h2>Add Listing</h2>
        <p>You want to add an item.</p>
        <button onClick={onClose} style={{ marginTop: '1rem' }}>
          Close
        </button>
      </div>
    </div>
  );
}
