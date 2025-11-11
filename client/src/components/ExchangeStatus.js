import React, { useEffect, useState } from 'react';

const ExchangeStatus = ({ itemId, currentUserId, senderId, receiverId }) => {
  const [status, setStatus] = useState('pending');
  const [initiatorId, setInitiatorId] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/exchange/status/${itemId}`);
        const data = await res.json();
        setStatus(data.status);
      } catch (err) {
        console.error('Error fetching status:', err);
      }
    };
    fetchStatus();
  }, [itemId]);

  const updateStatus = async (newStatus) => {
    try {
      await fetch('http://localhost:5000/api/exchange/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, status: newStatus }),
      });
      setStatus(newStatus);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  

  return (
    <div className="exchange-status">
      <h4>Exchange Status: {status}</h4>
      {status === 'pending' && currentUserId === senderId && (
        <button onClick={() => updateStatus('exchange')}>Request Exchange</button>
      )}
      {status === 'exchange' && currentUserId === receiverId && (
        <>
          <button onClick={() => updateStatus('approved')}>Approve</button>
          <button onClick={() => updateStatus('rejected')}>Reject</button>
        </>
      )}
      {status === 'approved' && (
        <button onClick={() => updateStatus('completed')}>Mark as Completed</button>
      )}
      {status === 'completed' && <p>✅ Exchange Completed</p>}
    </div>
  );
};

export default ExchangeStatus;
