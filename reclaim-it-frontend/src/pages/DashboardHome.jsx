// src/pages/DashboardHome.jsx
import React, { useEffect, useState } from 'react';
import ListingGrid from '../components/ListingGrid';
import { fetchOpenListings, createListing } from '../api/listing';
import { supabaseClient } from '../api/supabaseClient';

const pillContainer = {
  display: 'inline-flex',
  background: '#edf2f7',
  borderRadius: '999px',
  overflow: 'hidden',
  marginBottom: '1rem',
};
const pillButton = (active, accent) => ({
  padding: '0.5rem 1.25rem',
  border: 'none',
  cursor: 'pointer',
  background: active ? accent : 'transparent',
  color: active ? '#fff' : '#4a5568',
  fontWeight: active ? 600 : 500,
  transition: 'background 0.2s',
});

function HomeTemplate({ title, showRequestButton }) {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal]   = useState(false);
  const [categories, setCategories] = useState([]);

  const [form, setForm]             = useState({
    title:         '',
    description:   '',
    listing_type:  'F',
    event_date:    '',
    location:      '',
    category_id:   '',
    brand:         '',
    color:         '',
    notes:         '',
    imageFile:     null,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch all open listings
  useEffect(() => {
    fetchOpenListings()
      .then(res => setItems(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Fetch categories for dropdown
  useEffect(() => {
    supabaseClient
      .from('categories')
      .select('category_id, description')
      .then(({ data, error }) => {
        if (error) throw error;
        setCategories(data || []);
      })
      .catch(console.error);
  }, []);

  // Handle input changes
  function onChange(e) {
    const { name, value, files, type } = e.target;
    if (type === 'file') {
      setForm(f => ({ ...f, imageFile: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  // Submit new listing
  async function onSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      // 1) upload image to Supabase bucket
      const ext = form.imageFile.name.split('.').pop();
      const key = `listings/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabaseClient
        .storage
        .from('reclaim-it-items')
        .upload(key, form.imageFile, { upsert: true });
      if (upErr) throw upErr;

      // 2) get public URL
      const { data: urlData, error: urlErr } = await supabaseClient
        .storage
        .from('reclaim-it-items')
        .getPublicUrl(key);
      if (urlErr) throw urlErr;
      const image_url = urlData.publicUrl;

      // 3) create listing via backend
      await createListing({ ...form, image_url });

      // 4) refresh list
      const fresh = await fetchOpenListings();
      setItems(fresh.data.data || []);
      setShowModal(false);
      // reset form
      setForm({
        title:         '',
        description:   '',
        listing_type:  'F',
        event_date:    '',
        location:      '',
        category_id:   '',
        brand:         '',
        color:         '',
        notes:         '',
        imageFile:     null,
      });
    } catch (err) {
      console.error('Create listing failed:', err);
      alert(err.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  }

  const accents = { all: '#718096', found: '#38a169', lost: '#e53e3e' };

  // Filtered list
  const filtered = items.filter(item => {
    if (filterType === 'all') return true;
    return filterType === 'found'
      ? item.listing_type === 'F'
      : item.listing_type === 'L';
  });

  return (
    <section style={{ padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
      {/* Header + Add Listing button */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ flex: 1, margin: 0, color: '#2d3748' }}>{title}</h3>
        {showRequestButton && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '0.5rem 1rem',
              background: '#3182ce',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            + Add Listing
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={pillContainer}>
          {['all','found','lost'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={pillButton(filterType === type, accents[type])}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Listings grid or messages */}
      {loading ? (
        <p style={{ color: '#4a5568' }}>Loading listings…</p>
      ) : !filtered.length ? (
        <p style={{ color: '#4a5568' }}>
          No {title.toLowerCase()} match “{filterType}”.
        </p>
      ) : (
        <ListingGrid items={filtered} showRequestButton={showRequestButton} />
      )}

      {/* Create Listing Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <form
            onClick={e => e.stopPropagation()}
            onSubmit={onSubmit}
            style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: 10,
              width: '90%',
              maxWidth: 480,
              maxHeight: '90%',
              overflowY: 'auto',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#2d3748' }}>
              Report an Item
            </h2>
            {/* Type radio */}
            <fieldset style={{ marginBottom:'1.5rem', border:'none', padding:0 }}>
              <legend style={{ marginBottom:'0.5rem', fontWeight:500, color:'#4a5568' }}>
                I'm reporting because…*
              </legend>
              <label style={{ display:'block', marginBottom:'0.5rem', fontSize:'0.95rem' }}>
                <input
                  type="radio"
                  name="listing_type"
                  value="F"
                  checked={form.listing_type==='F'}
                  onChange={onChange}
                  style={{ marginRight:6 }}
                />
                I found an item that is not mine and want to report it
              </label>
              <label style={{ display:'block', fontSize:'0.95rem' }}>
                <input
                  type="radio"
                  name="listing_type"
                  value="L"
                  checked={form.listing_type==='L'}
                  onChange={onChange}
                  style={{ marginRight:6 }}
                />
                I lost an item and want to report it
              </label>
            </fieldset>

            {/* Title */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#4a5568' }}>
                Title*
              </label>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                required
                style={{
                  width:'100%', padding:'0.75rem', borderRadius:6,
                  border:'1px solid #cbd5e0', fontFamily:'inherit'
                }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#4a5568' }}>
                Description*
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                required
                style={{
                  width:'100%', padding:'0.75rem', borderRadius:6,
                  border:'1px solid #cbd5e0', fontFamily:'inherit'
                }}
              />
            </div>

            {/* Date */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#4a5568' }}>
                Date
              </label>
              <input
                type="date"
                name="event_date"
                value={form.event_date}
                onChange={onChange}
                style={{
                  width:'100%', padding:'0.75rem', borderRadius:6,
                  border:'1px solid #cbd5e0', fontFamily:'inherit'
                }}
              />
            </div>

            {/* Location */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#4a5568' }}>
                Location
              </label>
              <input
                name="location"
                value={form.location}
                onChange={onChange}
                style={{
                  width:'100%', padding:'0.75rem', borderRadius:6,
                  border:'1px solid #cbd5e0', fontFamily:'inherit'
                }}
              />
            </div>

            {/* Category */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#4a5568' }}>
                Category*
              </label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={onChange}
                required
                style={{
                  width:'100%', padding:'0.75rem', borderRadius:6,
                  border:'1px solid #cbd5e0', fontFamily:'inherit'
                }}
              >
                <option value="" disabled>— select category —</option>
                {categories.map(c => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#4a5568' }}>
                Brand
              </label>
              <input
                name="brand"
                value={form.brand}
                onChange={onChange}
                style={{
                  width:'100%', padding:'0.75rem', borderRadius:6,
                  border:'1px solid #cbd5e0', fontFamily:'inherit'
                }}
              />
            </div>

            {/* Color */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#4a5568' }}>
                Color
              </label>
              <input
                name="color"
                value={form.color}
                onChange={onChange}
                style={{
                  width:'100%', padding:'0.75rem', borderRadius:6,
                  border:'1px solid #cbd5e0', fontFamily:'inherit'
                }}
              />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#4a5568' }}>
                Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={onChange}
                style={{
                  width:'100%', padding:'0.75rem', borderRadius:6,
                  border:'1px solid #cbd5e0', fontFamily:'inherit'
                }}
              />
            </div>

            

            {/* Image upload */}
            <div style={{ marginBottom:'1.5rem' }}>
              <label style={{ display:'block', marginBottom:4, fontWeight:500, color:'#4a5568' }}>
                Image*
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={onChange}
                required
                style={{ fontFamily:'inherit' }}
              />
            </div>

            {/* Buttons */}
            <div style={{ textAlign:'right' }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  marginRight:'1rem',
                  padding:'0.5rem 1rem',
                  borderRadius:6,
                  border:'1px solid #e2e8f0',
                  background:'transparent',
                  color:'#4a5568',
                  cursor:'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding:'0.5rem 1.5rem',
                  borderRadius:6,
                  background:'#3182ce',
                  color:'#fff',
                  border:'none',
                  boxShadow:'0 2px 6px rgba(0,0,0,0.1)',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export function MemberHome() {
  return <HomeTemplate title="Available Listings" showRequestButton={true} />;
}

export function AdminHome() {
  return <HomeTemplate title="All Listings" showRequestButton={false} />;
}
