import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashBoard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({});
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token !== 'admin-token') {
      navigate('/unauthorized');
      return;
    }

    fetch('http://localhost:5000/api/admin/dashboard')
      .then(res => res.json())
      .then(data => {
        setMetrics(data.metrics);
        setListings(data.listings);
      })
      .catch(err => console.error('Error fetching dashboard data:', err));
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>

      <section className="metrics">
        <h2>Platform Metrics</h2>
        <ul>
          <li><strong>Total Users:</strong> {metrics.totalUsers}</li>
          <li><strong>Total Items Listed:</strong> {metrics.totalItems}</li>
          <li><strong>Total Exchanges:</strong> {metrics.totalExchanges}</li>
        
        </ul>
      </section>

      <section className="listings">
        <h2>Item Listings</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Item Name</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {listings.map(item => (
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