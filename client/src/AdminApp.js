import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import Analysis from './components/Analysis';
import ManageUsers from './components/ManageUsers';
//import ExchangeTracking from './components/ExchangeStatus';
import ProtectedRoute from './components/ProtectedRoute';
import NavbarAdmin from './components/NavbarAdmin';
import ExchangeHistory from './components/exchangeHistory';

function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading
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
          setIsAdmin(decoded.role === 'admin');
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
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Wait until auth is checked
  }

  return (
    <Router>
      {(isAuthenticated && isAdmin) && <NavbarAdmin />}
      <Routes>
        <Route
          path="/analysis"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated && isAdmin}>
              <Analysis />
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
          path="/exchangeHistory"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated && isAdmin}>
              <ExchangeHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={<Navigate to={isAuthenticated && isAdmin ? "/analysis" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default AdminApp;