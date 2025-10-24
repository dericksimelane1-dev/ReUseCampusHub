
import React from 'react';
import '../styles/ExchangeHistory.css';

const ExchangeHistory = () => {
  const history = [
    { id: 301, item: 'Bookshelf', fromUser: 'Alice', toUser: 'Bob', date: '2025-09-15' },
    { id: 302, item: 'Coffee Table', fromUser: 'Charlie', toUser: 'Dana', date: '2025-09-20' },
    { id: 303, item: 'Microwave Oven', fromUser: 'Eve', toUser: 'Frank', date: '2025-10-01' },
  ];

  return (
    <div className="exchange-history-container">
      <h2>Exchange History</h2>
      <table className="history-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Item</th>
            <th>From</th>
            <th>To</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {history.map(record => (
            <tr key={record.id}>
              <td>{record.id}</td>
              <td>{record.item}</td>
              <td>{record.fromUser}</td>
              <td>{record.toUser}</td>
              <td>{record.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExchangeHistory;
