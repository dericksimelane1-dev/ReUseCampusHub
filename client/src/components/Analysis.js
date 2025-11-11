import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  ResponsiveContainer
} from 'recharts';
import '../styles/Analysis.css';

const Analysis = () => {
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

  const chartData = [
    { name: 'Total Users', value: metrics.totalUsers || 0 },
    { name: 'Total Items', value: metrics.totalItems || 0 },
    { name: 'Total Exchanges', value: metrics.totalExchanges || 0 }
  ];

  return (
    <div className="dashboard-container">
      <h1>Analysis</h1>

      {/* Metrics List */}
      <section className="metrics">
        <h2>Platform Metrics</h2>
        <ul>
          <li><strong>Total Users:</strong> {metrics.totalUsers}</li>
          <li><strong>Total Items Listed:</strong> {metrics.totalItems}</li>
          <li><strong>Total Exchanges:</strong> {metrics.totalExchanges}</li>
        </ul>
      </section>

      {/* Charts Side by Side */}
      <section className="charts-container" style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* Responsive Bar Chart */}
        <div style={{ flex: 1, minWidth: '300px', height: '300px' }}>
          <h2>Metrics Overview (Bar)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Responsive Line Chart */}
        <div style={{ flex: 1, minWidth: '300px', height: '300px' }}>
          <h2>Metrics Trend (Line)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#FF5733" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default Analysis;