import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // Optional, remove if the file doesn't exist

const Dashboard = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome to Your Dashboard</h1>
      <p>Here you can manage your account, view items, and track your eco-points.</p>

      <div className="dashboard-buttons">
        <button onClick={() => handleNavigation('/items')}>View Items</button>
        <button onClick={() => handleNavigation('/map')}>Map View</button>
        <button onClick={() => handleNavigation('/messaging')}>Messaging</button>
        <button onClick={() => handleNavigation('/eco-points')}>Eco Points</button>
      </div>

      <div className="dashboard-stats">
        <h2>Your Stats</h2>
        <ul>
          <li>Items Recycled: 25</li>
          <li>Eco Points Earned: 1200</li>
          <li>Messages Sent: 8</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;