import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/NavbarAdmin.css';

const NavbarAdmin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
   // window.dispatchEvent(new Event('storage')); // Trigger auth re-check
    navigate('/');
    window.location.reload(); // ✅ Ensures state resets
  };

  return (
    <nav className="navbar-admin">
      {/* My heading and logo*/}
            <div className="navbar-logo">
              <h2>Administrator</h2>
              
            </div>

      <ul>
        <li><Link to="/analysis">Analysis</Link></li>
        <li><Link to="/ManageUsers">Manage Users</Link></li>
        <li><Link to="/exchangeHistory">Exchange History</Link></li>
        <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
      </ul>
    </nav>
  );
};

export default NavbarAdmin;