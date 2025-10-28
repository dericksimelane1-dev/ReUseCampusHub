import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ItemList from './components/ItemList';
import MapView from './components/MapView';
import Messages from './components/Messages';
import EcoPoints from './components/EcoPoints';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import MessageInbox from './components/MessageInbox';




import 'leaflet/dist/leaflet.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);


useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token && token.split('.').length === 3) {
        try {
          const decoded = jwtDecode(token);
          setIsAuthenticated(true);
          setCurrentUserId(decoded.id);
        } catch (err) {
          console.error('Invalid token:', err);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth(); // Initial check
    window.addEventListener('storage', checkAuth); // Listen for changes

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);


  return (
    <Router>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
        <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ResetPassword />} />


        <Route path="/dashboard" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/items" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <ItemList />
          </ProtectedRoute>
        } />
        <Route path="/map" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <MapView />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <MessageInbox currentUserId={currentUserId} />
          </ProtectedRoute>
        } />
        <Route path="/messages/:itemId/:receiverId" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Messages currentUserId={currentUserId} />
          </ProtectedRoute>
        } />
        <Route path="/eco-points" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <EcoPoints />
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;