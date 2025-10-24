import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/NavbarAdmin.css';

const NavbarAdmin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('storage')); // Trigger auth re-check
    navigate('/login');
  };

  return (
    <nav className="navbar-admin">
      <ul>
        <li><Link to="/adminDashboard">Dashboard</Link></li>
        <li><Link to="/ManageUsers">Manage Users</Link></li>
        <li><Link to="/Reports">Reports</Link></li>
        <li><Link to="/ModerateItemsExchange">Moderate Items Exchange</Link></li>
        <li><Link to="/ExchangeHistory">Exchange History</Link></li>
        <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
      </ul>
    </nav>
  );
};

export default NavbarAdmin;