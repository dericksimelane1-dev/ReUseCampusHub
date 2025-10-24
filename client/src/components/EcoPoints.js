import React, { useEffect, useState } from 'react';
import '../styles/EcoPoints.css';

const EcoPoints = () => {
  const [points, setPoints] = useState(0);
  const [message, setMessage] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const userName = 'You'; // Replace with actual logged-in user's name if available

  // Fetch current user's points and leaderboard
  useEffect(() => {
    fetch(`http://localhost:5000/api/points?name=${userName}`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.points === 'number') {
          setPoints(data.points);
        }
      });

    fetch('http://localhost:5000/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLeaderboard(data);
        } else {
          console.error('Leaderboard data is not an array:', data);
          setLeaderboard([]);
        }
      });
  }, []);

  // Simulate actions that trigger point updates
  const handleAction = (action) => {
    let reward = 0;
    switch (action) {
      case 'message':
        reward = 1;
        break;
      case 'item posting':
        reward = 2;
        break;
      default:
        reward = 0;
    }

    const newPoints = points + reward;
    setPoints(newPoints);
    setMessage(`You earned ${reward} Eco Points for ${action}!`);

    // Update points in backend
    fetch('http://localhost:5000/api/updatePoints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: userName, points: reward })
    }).then(() => {
      // Refresh leaderboard
      fetch('http://localhost:5000/api/leaderboard')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setLeaderboard(data);
          } else {
            console.error('Leaderboard data is not an array:', data);
            setLeaderboard([]);
          }
        });
    });
  };

  return (
    <div className="eco-container">
      <h1>Eco Points</h1>
      <p className="points">Your Eco Points: {points}</p>

      <div className="actions">
        <button onClick={() => handleAction('item posting')}>Post an Item</button>
        <button onClick={() => handleAction('message')}>Send a Message</button>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="leaderboard">
        <h2>Leaderboard</h2>
        <ul>
          {leaderboard.map((user, index) => (
            <li key={index}>
              {user.name}: {user.points} pts
              {user.points >= 100 && <span> ⭐️</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EcoPoints;