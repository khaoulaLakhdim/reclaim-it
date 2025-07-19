// src/api/claims.js
import api from './auth';

export function createClaim(listing_id) {
  return api.post('/claims', { listing_id });
}

// src/api/claims.js

/**
 * Fetch all claims (any status). Backend: GET /admin/claims
 * Returns an array of claim objects:
 *  { claim_id, listing_id, claimant_id, status, claim_date, title, description, image_url, ... }
 */
// src/api/claims.js

export function fetchAllClaims() {
  return api
    .get("/admin/claims")
    .then(res => {
      console.log("🔍 raw /admin/claims response:", res.data);
      // res.data is { data: [...], count, error }
      const arr = res.data.data;            // <-- grab the inner .data
      console.log("🔍 extracted claims array:", arr);
      return Array.isArray(arr) ? arr : [];
    })
    .catch(err => {
      console.error("❌ fetchAllClaims error:", err);
      throw err;
    });
}


export function updateClaimStatus(claimId, newStatus) {
    // FastAPI expects a query‐param “status”
    return api.post(
      `/admin/claims/${claimId}/status`,
      null,
      { params: { status: newStatus } }
    );
  }

  export function attachProof(claimId, url) {
    return api.post(`/admin/claims/${claimId}/proof`, { url });
  }