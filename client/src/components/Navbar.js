import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
// If using Font Awesome
import { FaRecycle, FaRedditSquare } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload(); // ✅ Ensures state resets
  };

  return (
    <nav className="navbar">
      {/* My heading and logo*/}
      <div className="navbar-logo">
        <h2>ReUseCampusHub</h2>
        <FaRedditSquare size={32} color="#fff" />
      </div>

      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/items">Items</Link></li>
        <li><Link to="/map">Map</Link></li>
        <li><Link to="/messages">Messages</Link></li>
        <li><Link to="/eco-points">EcoPoints</Link></li>
        <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;