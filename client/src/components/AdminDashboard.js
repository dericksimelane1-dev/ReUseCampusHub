
import React, { useEffect, useState } from 'react';
import { itemListings, platformMetrics } from './DashboardData';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashBoard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
 

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token === 'admin-token') {
      
    }
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard-container">
     

      <h1>Admin Dashboard</h1>

      <section className="metrics">
        <h2>Platform Metrics</h2>
        <ul>
          <li><strong>Total Users:</strong> {platformMetrics.totalUsers}</li>
          <li><strong>Total Items Listed:</strong> {platformMetrics.totalItems}</li>
          <li><strong>Total Exchanges:</strong> {platformMetrics.totalExchanges}</li>
          <li><strong>Eco-Points Awarded:</strong> {platformMetrics.ecoPointsAwarded}</li>
        </ul>
      </section>

      <section className="listings">
        <h2>Item Listings</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Item Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {itemListings.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminDashboard;
