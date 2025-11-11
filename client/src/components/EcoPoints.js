import React, { useEffect, useState } from 'react';
import '../styles/EcoPoints.css';

const EcoPoints = () => {
  const [todayPoints, setTodayPoints] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser && storedUser !== "undefined") {
        setCurrentUser(JSON.parse(storedUser));
      } else {
        console.warn("EcoPoints: currentUser is missing or invalid.");
      }
    } catch (err) {
      console.error("Error parsing currentUser from localStorage:", err);
    }
  }, []);

  useEffect(() => {
    if (!currentUser || !currentUser.full_name) return;

    // Fetch today's points
    fetch(`http://localhost:5000/api/todayPoints?name=${encodeURIComponent(currentUser.full_name)}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch today's points");
        return res.json();
      })
      .then(data => {
        if (data && typeof data.points === 'number') {
          setTodayPoints(data.points);
        }
      })
      .catch(err => console.error("Error fetching today's points:", err));

    // Fetch leaderboard
    fetch('http://localhost:5000/api/leaderboard')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setLeaderboard(data);
        } else {
          console.error('Leaderboard data is not an array:', data);
        }
      })
      .catch(err => console.error('Error fetching leaderboard:', err));
  }, [currentUser]);

  return (
    <div className="eco-container">
      <h1>Eco Points</h1>
      <p className="points">Points Earned Today: {todayPoints}</p>

      <div className="leaderboard">
        <h2>Leaderboard</h2>
        {leaderboard.length === 0 ? (
          <p>No leaderboard data available.</p>
        ) : (
          <ul>
            {leaderboard.map((user, index) => (
              <li key={index}>
                #{index + 1} - {user.full_name}: {user.points} pts
                {user.points >= 100 && <span> ⭐️</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EcoPoints;