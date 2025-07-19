import api from './auth'; // your axios instance

// Fetches all open listings via GET /listings
export function fetchOpenListings() {
    return api.get('/listings')   // unwrap here
  }


// fetch one listing by its ID
export function fetchListingById(id) {
  return api.get(`/listings/${id}`).then(res => res.data);
}


// new: create a listing via your FastAPI backend
export function createListing(payload) {
    // payload must match your Pydantic model on the server
    return api.post('/listings', payload);
  }
