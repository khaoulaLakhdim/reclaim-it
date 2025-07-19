// src/pages/ListingDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createClaim }   from "../api/claims";
import { getRole }       from "../api/auth";
import { fetchUserById } from "../api/users";

export default function ListingDetailPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  // either we have a listing-only:
  //   state.item
  // or a claim-inspect:
  //   state.claim + state.listing
  const listing = state?.listing ?? state?.item;
  const claim   = state?.claim;

  const [role, setRole]           = useState("member");
  const [reporter, setReporter]   = useState(null);
  const [claimant, setClaimant]   = useState(null);
  const [loadingReporter, setLoadingReporter] = useState(false);
  const [loadingClaimant, setLoadingClaimant] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  // redirect back if no listing provided
  if (!listing) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>Listing not found.</p>
        <button onClick={() => navigate(-1)} style={backBtn}>
          Back
        </button>
      </div>
    );
  }

  // load user role
  useEffect(() => {
    getRole()
      .then(r => setRole(r.data.role))
      .catch(() => setRole("member"));
  }, []);

  // fetch reporter (the one who posted the listing)
  useEffect(() => {
    if (!listing.reported_by) return;
    setLoadingReporter(true);
    fetchUserById(listing.reported_by)
      .then(u => setReporter(u))
      .catch(() => setReporter(null))
      .finally(() => setLoadingReporter(false));
  }, [listing.reported_by]);

  // fetch claimant (only if inspecting a claim)
  useEffect(() => {
    if (!claim?.claimant_id) return;
    setLoadingClaimant(true);
    fetchUserById(claim.claimant_id)
      .then(u => setClaimant(u))
      .catch(() => setClaimant(null))
      .finally(() => setLoadingClaimant(false));
  }, [claim?.claimant_id]);

  const isFound = listing.listing_type === "F";
  const accent  = isFound ? "#38a169" : "#e53e3e";

  const reporterName = loadingReporter
    ? "Loading…"
    : reporter
      ? `${reporter.first_name || ""} ${reporter.last_name || ""}`.trim() || reporter.email
      : "Unknown reporter";

  const claimantName = claim
    ? loadingClaimant
      ? "Loading…"
      : claimant
        ? `${claimant.first_name || ""} ${claimant.last_name || ""}`.trim() || claimant.email
        : "Unknown claimant"
    : null;

  // Claiming UI only on listing grid → only when member + found + no existing claim
  const handleClaimClick = () => setConfirmOpen(true);
  const confirmYes = () => {
    createClaim(listing.listing_id)
      .then(() => {
        setConfirmOpen(false);
        setSuccessOpen(true);
      })
      .catch(err => {
        console.error("Claim error:", err);
        setConfirmOpen(false);
      });
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <button onClick={() => navigate(-1)} style={backBtn}>
        ← Back
      </button>

      <h2 style={{ borderBottom: `3px solid ${accent}`, paddingBottom: "0.5rem" }}>
        {listing.title} {isFound ? "(Found)" : "(Lost)"}
      </h2>

      {listing.image_url && (
        <img
          src={listing.image_url}
          alt={listing.title}
          style={{
            width: "100%",
            maxHeight: 400,
            objectFit: "cover",
            borderRadius: 8,
            marginBottom: "1rem"
          }}
        />
      )}

      {/* Listing details */}
      <p><strong>Description:</strong> {listing.description}</p>
      <p><strong>When:</strong> {listing.event_date}</p>
      <p><strong>Where:</strong> {listing.location}</p>
      {listing.brand  && <p><strong>Brand:</strong> {listing.brand}</p>}
      {listing.color  && <p><strong>Color:</strong> {listing.color}</p>}
      {listing.notes  && <p><strong>Notes:</strong> {listing.notes}</p>}
      <p>
        <strong>Status:</strong>{" "}
        <span style={{ color: accent, fontWeight: "bold" }}>
          {listing.status}
        </span>
      </p>

      {/* Reporter */}
      <p><strong>Reported by:</strong> {reporterName}</p>

      {/* If inspecting a claim, show claim info here */}
      {claim && (
        <div style={{ marginTop: "1.5rem", padding: "1rem", border: "1px solid #e2e8f0", borderRadius: 4 }}>
          <h3>Claim Details</h3>
          <p><strong>Status:</strong> {claim.status}</p>
          <p>
            <strong>Requested at:</strong>{" "}
            {new Date(claim.claim_date).toLocaleString()}
          </p>
          <p><strong>Claimant:</strong> {claimantName}</p>
        </div>
      )}

      {/* Otherwise, show “Claim” button for members on found items */}
      {!claim && role==="member" && isFound && (
        <button onClick={handleClaimClick} style={claimBtn}>
          Claim Item
        </button>
      )}

      {/* Confirm Modal */}
      {confirmOpen && (
        <Modal>
          <p>Are you sure this item is yours?</p>
          <div style={modalActions}>
            <button onClick={confirmYes} style={modalBtnPrimary}>
              Yes, I am sure
            </button>
            <button onClick={() => setConfirmOpen(false)} style={modalBtn}>
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Success Modal */}
      {successOpen && (
        <Modal>
          <p>
            Your request is going to be reviewed by an admin and we’ll get back to you shortly.
            Please check the Requests tab to keep track of your request status.
          </p>
          <button onClick={() => setSuccessOpen(false)} style={modalBtnPrimary}>
            I Understand
          </button>
        </Modal>
      )}
    </div>
  );
}

// — shared styles & Modal —
const backBtn = {
  marginBottom: "1rem",
  background: "transparent",
  border: "none",
  color: "#3182ce",
  cursor: "pointer"
};
const claimBtn = {
  marginTop: "1.5rem",
  padding: "0.75rem 1.5rem",
  background: "#3182ce",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: "1rem"
};
const modalActions = {
  display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem"
};
const modalBtn = {
  padding: "0.5rem 1rem",
  background: "#e2e8f0",
  border: "none",
  borderRadius: 4,
  cursor: "pointer"
};
const modalBtnPrimary = {
  ...modalBtn,
  background: "#3182ce",
  color: "#fff"
};

function Modal({ children }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: "#fff", padding: "2rem", borderRadius: 8,
        maxWidth: "90%", width: 400, textAlign: "center"
      }}>
        {children}
      </div>
    </div>
  );
}
