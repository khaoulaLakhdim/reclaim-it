import React, { useState, useRef, useEffect } from 'react';

/**
 * Avatar + dropdown menu with:
 *  - My Listings
 *  - My Requests
 *  - My Account
 *  - Logout
 */
export default function ProfileMenu({ onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Close menu on outside click
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <img
        src="https://via.placeholder.com/40"
        alt="Profile"
        onClick={() => setOpen(o => !o)}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          cursor: 'pointer',
        }}
      />
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            right: 0,
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            borderRadius: '4px',
            overflow: 'hidden',
            minWidth: '150px',
            zIndex: 100,
          }}
        >
          {['My Listings', 'My Requests', 'My Account'].map(label => (
            <button
              key={label}
              onClick={() => {
                console.log(label);
                setOpen(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
          <hr style={{ margin: 0 }} />
          <button
            onClick={onLogout}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'transparent',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              color: 'red',
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
