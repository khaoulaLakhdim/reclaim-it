import React, { useEffect, useState } from "react";
import { fetchAllClaims, updateClaimStatus, attachProof } from "../api/claims";
import { fetchListingById }                  from "../api/listing";
import { fetchUserById }                     from "../api/users";
import RequestCard                           from "../components/RequestCard";
import { supabaseClient }                    from "../api/supabaseClient";

export default function RequestsPage() {
  const [claims, setClaims]       = useState([]);
  const [listings, setListings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [boardView, setBoardView] = useState(false);
  const [selected, setSelected]   = useState(null); // { claim, listing }
  const [showDetail, setShowDetail] = useState(false);
  const [updating, setUpdating]     = useState(false);
  const [claimant, setClaimant]     = useState(null);
  const [loadingClaimant, setLoadingClaimant] = useState(false);

  // Proof‐upload modal state
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofFile, setProofFile]           = useState(null);

  const STATUSES = ["pending", "waiting", "rejected", "collected"];
  const LABELS   = {
    pending:   "Pending",
    waiting:   "Waiting",
    rejected:  "Rejected",
    collected: "Collected",
  };

  // 1) Fetch claims + their listings
  useEffect(() => {
    let mounted = true;
    fetchAllClaims()
      .then(arr => {
        if (!mounted) return;
        setClaims(arr);
        return Promise.all(
          arr.map(c => fetchListingById(c.listing_id).catch(() => null))
        );
      })
      .then(ls => {
        if (!mounted) return;
        setListings(ls);
      })
      .catch(() => mounted && setError("Couldn’t load claims or listings"))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, []);

  // 2) When a claim is selected, fetch the claimant’s profile
  useEffect(() => {
    if (!selected?.claim?.claimant_id) {
      setClaimant(null);
      return;
    }
    setLoadingClaimant(true);
    fetchUserById(selected.claim.claimant_id)
      .then(u => setClaimant(u))
      .catch(() => setClaimant(null))
      .finally(() => setLoadingClaimant(false));
  }, [selected]);

  if (loading) return <p style={styles.loading}>Loading requests…</p>;
  if (error)   return <p style={styles.error}>{error}</p>;

  // Group {claim,listing} pairs by status
  const byStatus = STATUSES.reduce((acc, s) => {
    acc[s] = claims
      .map((c,i) => ({ claim: c, listing: listings[i] }))
      .filter(x => x.claim.status === s);
    return acc;
  }, {});

  function openDetail(pair) {
    setSelected(pair);
    setShowDetail(true);
  }

  function handleStatusChange(e) {
    setSelected(sel => ({
      ...sel,
      claim: { ...sel.claim, status: e.target.value }
    }));
  }

  function saveStatus() {
    setUpdating(true);
    updateClaimStatus(selected.claim.claim_id, selected.claim.status)
      .then(() => {
        // update list locally
        setClaims(cs =>
          cs.map(c =>
            c.claim_id === selected.claim.claim_id
              ? { ...c, status: selected.claim.status }
              : c
          )
        );
      })
      .catch(console.error)
      .finally(() => {
        setUpdating(false);
        if (selected.claim.status === "collected") {
          setShowProofModal(true);
        }
      });
  }

  function handleProofUpload() {
    if (!proofFile || !selected) return;
    // upload to bucket
    const ext  = proofFile.name.split(".").pop();
    const path = `proofs/${selected.claim.claim_id}.${ext}`;

    supabaseClient
      .storage
      .from("reclaim-it-proof")
      .upload(path, proofFile, { upsert: true })
      .then(({ error }) => {
        if (error) throw error;
        return supabaseClient
          .storage
          .from("reclaim-it-proof")
          .getPublicUrl(path)
          .data.publicUrl;
      })
      .then(publicUrl => attachProof(selected.claim.claim_id, publicUrl))
      .then(() => {
        alert("Proof uploaded successfully!");
        setShowProofModal(false);
        setProofFile(null);
      })
      .catch(err => {
        console.error(err);
        alert("Upload failed: " + err.message);
      });
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>All Requests</h1>

      <button
        onClick={() => setBoardView(b => !b)}
        style={{
          ...styles.toggleBtn,
          ...(boardView ? styles.toggleActive : {})
        }}
      >
        {boardView ? "List View" : "Board View"}
      </button>

      {boardView ? (
        <div style={styles.board}>
          {STATUSES.map(status => (
            <div key={status} style={styles.column}>
              <h2 style={styles.columnHeader}>
                {LABELS[status]} ({byStatus[status].length})
              </h2>
              {byStatus[status].map(pair => (
                <div
                  key={pair.claim.claim_id}
                  onClick={() => openDetail(pair)}
                  style={styles.cardWrapper}
                >
                  <RequestCard
                    item={{
                      title: pair.claim.title,
                      description: `By ${pair.claim.claimant_first || pair.claim.claimant_id}`,
                      image_url: pair.claim.image_url,
                      listing_type: pair.claim.listing_type
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.grid}>
          {claims.map((c, i) => (
            <div
              key={c.claim_id}
              onClick={() => openDetail({ claim: c, listing: listings[i] })}
              style={styles.cardWrapper}
            >
              <RequestCard
                item={{
                  title: c.title,
                  description: `Status: ${c.status}`,
                  image_url: c.image_url,
                  listing_type: c.listing_type
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selected && (
        <div style={styles.overlay} onClick={() => setShowDetail(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Claim Details</h3>
            <label style={styles.label}>Status</label>
            <select
              value={selected.claim.status}
              onChange={handleStatusChange}
              disabled={updating}
              style={styles.select}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{LABELS[s]}</option>
              ))}
            </select>
            <button
              onClick={saveStatus}
              disabled={updating}
              style={styles.saveBtn}
            >
              {updating ? "Saving…" : "Save"}
            </button>

            <p style={styles.meta}>
              <strong>Requested at:</strong>{" "}
              {new Date(selected.claim.claim_date).toLocaleString()}
            </p>
            <p style={styles.meta}>
              <strong>Requested by:</strong>{" "}
              {loadingClaimant
                ? "Loading…"
                : claimant
                  ? `${claimant.first_name || ""} ${claimant.last_name || ""}`.trim() || claimant.email
                  : selected.claim.claimant_id
              }
            </p>

            <hr style={styles.divider} />

            <h3 style={styles.modalTitle}>Listing Details</h3>
            {selected.listing ? (
              <>
                <img
                  src={selected.listing.image_url}
                  alt={selected.listing.title}
                  style={styles.modalImage}
                />
                <p><strong>Title:</strong> {selected.listing.title}</p>
                <p><strong>Description:</strong> {selected.listing.description}</p>
                <p><strong>Location:</strong> {selected.listing.location}</p>
                <p><strong>Date:</strong> {selected.listing.event_date}</p>
              </>
            ) : (
              <p style={styles.error}>Couldn’t load listing info.</p>
            )}

            <button
              onClick={() => setShowDetail(false)}
              style={styles.closeBtn}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Proof Upload Modal */}
      {showProofModal && (
        <div style={styles.overlay} onClick={() => setShowProofModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Upload Identity Proof</h3>
            <p>Please upload the claimant’s ID proof image:</p>
            <input
              type="file"
              accept="image/*"
              onChange={e => setProofFile(e.target.files[0])}
              style={{ margin: "1rem 0" }}
            />
            <button
              onClick={handleProofUpload}
              disabled={!proofFile}
              style={styles.saveBtn}
            >
              Upload
            </button>
            <button
              onClick={() => setShowProofModal(false)}
              style={{ ...styles.closeBtn, top: 16, right: 16 }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container:   { padding: "2rem", fontFamily: "'Inter', sans-serif" },
  title:       { margin: 0, fontSize: "1.75rem", color: "#333" },
  toggleBtn:   {
    margin: "1rem 0 2rem",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: 4,
    background: "#ddd",
    cursor: "pointer",
    fontWeight: 500
  },
  toggleActive:{ background: "#667eea", color: "#fff" },
  board:       { display: "flex", gap: "1rem", overflowX: "auto" },
  column:      {
    flex: "0 0 240px",
    background: "#fafafa",
    borderRadius: 6,
    padding: "0.5rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
  },
  columnHeader:{ margin: "0 0 .75rem", fontSize: "1.1rem", textAlign: "center" },
  grid:        {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))",
    gap: "1rem"
  },
  cardWrapper:{ cursor: "pointer", transition: "transform .1s" },
  overlay:     {
    position: "fixed", top:0, left:0, right:0, bottom:0,
    background: "rgba(0,0,0,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  modal:       {
    background: "#fff", borderRadius: 8, maxWidth: 600, width: "90%",
    padding: "2rem", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxHeight: "90%", overflowY: "auto", position: "relative"
  },
  modalTitle:  { margin: 0, marginBottom: "1rem", color: "#333" },
  label:       { margin: "1rem 0 .5rem", fontWeight: 500 },
  select:      { width: "100%", padding: ".5rem", borderRadius: 4, border: "1px solid #ccc", marginBottom: "1rem" },
  saveBtn:     { padding: ".5rem 1rem", background: "#3182ce", color: "#fff", border:"none", borderRadius:4, cursor:"pointer", marginBottom:"1rem" },
  meta:        { fontSize: ".9rem", color: "#555", marginBottom: "1rem" },
  divider:     { border:0, borderTop:"1px solid #eee", margin:"1rem 0" },
  modalImage:  { width:"100%", maxHeight:240, objectFit:"cover", borderRadius:4, marginBottom:"1rem" },
  closeBtn:    { position:"absolute", top:16, right:16, background:"transparent", border:"none", fontSize:"1.2rem", cursor:"pointer", color:"#888" },
  loading:     { padding:"2rem", textAlign:"center", color:"#666" },
  error:       { padding:"2rem", textAlign:"center", color:"#c00" },
};
