// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AuthPage       from './pages/AuthPage';
import DashboardPage  from './pages/DashboardPage';
import AccountPage    from './pages/AccountPage';
import MyListingsPage from './pages/MyListingsPage';
import MyRequestsPage from './pages/MyRequestsPage';
import RequestsPage   from './pages/RequestsPage';
import ClaimsPage     from './pages/ClaimsPage';
import RoleBased        from './components/RoleBased'; 
import { MemberHome, AdminHome } from './pages/DashboardHome';
import ListingDetailPage from './pages/ListingDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public auth */}
        <Route path="/"      element={<Navigate to="/auth" replace />} />
        <Route path="/auth"  element={<AuthPage />} />

        {/* Dashboard and its nested pages */}
        <Route path="/dashboard/*" element={<DashboardPage />}>

          {/* index (no sub‑path) */}
          <Route
            index
            element={
              // show home panel based on role
              <RoleBased
                admin={<AdminHome />}
                member={<MemberHome />}
              />
            }
          />

          <Route path="listings/:id" element={<ListingDetailPage />} />

          {/* admin‑only pages */}
          <Route path="requests" element={<RequestsPage />} />

          {/* shared */}
          <Route path="account" element={<AccountPage />} />

        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
