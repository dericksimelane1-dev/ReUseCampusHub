import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import AdminDashboard from './components/AdminDashboard';
import ManageUsers from './components/ManageUsers';
import Reports from './components/Reports';
import ModerateItemsExchange from './components/ModerateItemsExchange';
import ExchangeHistory from './components/ExchangeHistory';
import ProtectedRoute from './components/ProtectedRoute';
import NavbarAdmin from './components/NavbarAdmin';

function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token === 'admin-token') {
        setIsAuthenticated(true);
        setIsAdmin(true);
      } else if (token && token.split('.').length === 3) {
        try {
          const decoded = jwtDecode(token);
          setIsAuthenticated(true);
          setIsAdmin(decoded.role === 'admin'); // assuming token has a 'role' field
        } catch (err) {
          console.error('Invalid token:', err);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <Router>
      {(isAuthenticated && isAdmin) && <NavbarAdmin />}
      <Routes>
        <Route
          path="/adminDashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated && isAdmin}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ManageUsers"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated && isAdmin}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated && isAdmin}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/moderate-items"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated && isAdmin}>
              <ModerateItemsExchange />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/exchange-history"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated && isAdmin}>
              <ExchangeHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={<Navigate to={isAuthenticated && isAdmin ? "/adminDashboard" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default AdminApp;