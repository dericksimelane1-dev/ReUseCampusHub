
import React from 'react';
import '../styles/ModerateItemsExchange.css';

const ModerateItemsExchange = () => {
  const items = [
    { id: 201, name: 'Old Bicycle', flaggedBy: 'User321', reason: 'Suspicious image' },
    { id: 202, name: 'Used Laptop', flaggedBy: 'User654', reason: 'Inaccurate description' },
    { id: 203, name: 'Furniture Set', flaggedBy: 'User987', reason: 'Possible scam' },
  ];

  const handleApprove = (id) => {
    alert(`Approved item ${id}`);
  };

  const handleReject = (id) => {
    alert(`Rejected item ${id}`);
  };

  const handleViewDetails = (id) => {
    alert(`Viewing details for item ${id}`);
  };

  return (
    <div className="moderate-items-container">
      <h2>Moderate Exchange Items</h2>
      <table className="items-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Flagged By</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.flaggedBy}</td>
              <td>{item.reason}</td>
              <td>
                <button onClick={() => handleViewDetails(item.id)}>View</button>
                <button onClick={() => handleApprove(item.id)}>Approve</button>
                <button onClick={() => handleReject(item.id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ModerateItemsExchange;
