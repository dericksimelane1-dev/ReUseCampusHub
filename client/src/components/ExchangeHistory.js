// ReuseCampushub/client/src/components/exchangeHistory.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ExchangeHistory.css';

const ExchangeHistory = () => {
  const [exchangesH, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExchanges = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/exchange-history');
        setExchanges(response.data);
      } catch (error) {
        console.error('Error fetching exchange history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExchanges();
  }, []);

  return (
    <div className="exchange-history-container">
      <h2>Exchange History</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="exchange-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Item ID</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {exchangesH.map((exchangeH) => (
              <tr key={exchangeH.id}>
                <td>{exchangeH.id}</td>
                <td>{exchangeH.status}</td>
                <td>{exchangeH.item_id}</td>
                <td>{new Date(exchangeH.updated_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExchangeHistory;