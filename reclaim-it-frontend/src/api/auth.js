// src/api/auth.js
import axios from 'axios';

// 1) Create base axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// 2) Auto‑attach JWT from localStorage on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3) Sign In: store the returned token in localStorage
export async function signIn({ email, password }) {
  const res = await api.post('/sign_in', { email, password });
  // Supabase v1 returns access_token at root; v2 nests it under session.access_token
  const token = res.data.access_token || res.data.session?.access_token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    console.warn('No token returned from sign_in');
  }
  return res;
}

// 4) Sign Up: unchanged (usually no token here unless you auto‑login)
export function signUp({ firstName, lastName, email, password }) {
  return api.post('/sign_up', { firstName, lastName, email, password });
}

// 5) Fetch current user (optional)
export function fetchUser() {
  return api.get('/user');
}

// 6) Sign Out: clear the token and call backend
export function signOut() {
  localStorage.removeItem('token');
  return api.post('/signout');
}

// 7) Get role from your new endpoint
export function getRole() {
  return api.get('/auth/role');
}

export default api;
