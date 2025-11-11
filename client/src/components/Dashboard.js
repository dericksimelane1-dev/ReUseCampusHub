import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // Ensure this file exists or adjust styling accordingly

const Dashboard = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>ReuseCampus Hub</h1>
        <p className="tagline">Empowering Sustainability Through Student Exchange</p>
      </header>

      <section className="intro-section">
        <p>
          Welcome to your campus sustainability hub! ReuseCampus helps students exchange, donate reusable items like textbooks, electronics, clothing, and furniture. Save money, reduce waste, and earn eco-points while making a difference.
        </p>
      </section>

      <section className="features-section">
        <h2>Key Features</h2>
        <ul>
          <li>📍 <strong>Geolocation</strong> for nearby exchanges</li>
          <li>🎯 <strong>AI-powered recommendations</strong> based on your interests</li>
          <li>💬 <strong>In-app messaging</strong> for smooth communication</li>
          <li>🏆 <strong>Eco-points rewards</strong> to incentivize participation</li>
        </ul>
      </section>

      <section className="navigation-buttons">
        <h2>Explore the Platform</h2>
        <button onClick={() => handleNavigation('/items')}>Browse Items</button>
        <button onClick={() => handleNavigation('/map')}>Map View</button>
        <button onClick={() => handleNavigation('/messaging')}>Messaging</button>
        <button onClick={() => handleNavigation('/eco-points')}>Eco Points</button>
      </section>

      

      <footer className="dashboard-footer">
        <p>ReuseCampus © {new Date().getFullYear()} | Building a Greener Future Together</p>
      </footer>
    </div>
  );
};

export default Dashboard;