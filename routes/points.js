import express from 'express';
const router = express.Router();
import pool from '../db.js';

// Route to get today's points for a user
router.get('/todayPoints', async (req, res) => {
  const { name } = req.query;
  const today = new Date().toISOString().split('T')[0];

  try {
    // Get user ID from full name
    const userResult = await pool.query(
      `SELECT id FROM users WHERE LOWER(full_name) = LOWER($1)`,
      [name]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    // Count items posted today
    const itemPoints = await pool.query(
      `SELECT COUNT(*) * 2 AS points
       FROM items
       WHERE user_id = $1 AND DATE(created_at) = $2`,
      [userId, today]
    );

    // Count exchanges completed today
    const exchangePoints = await pool.query(
      `SELECT COUNT(*) * 2 AS points
       FROM exchanges
       WHERE user_id = $1 AND status = 'completed' AND DATE(completed_at) = $2`,
      [userId, today]
    );

    const totalPoints =
      parseInt(itemPoints.rows[0].points || 0) +
      parseInt(exchangePoints.rows[0].points || 0);

    res.json({ points: totalPoints });
  } catch (err) {
    console.error('Error in /todayPoints:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}); 

// Route to get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.full_name,
       COALESCE(item_points.points, 0) + COALESCE(exchange_points.points, 0) AS points
FROM users u
LEFT JOIN (
    SELECT user_id, COUNT(*) * 2 AS points
    FROM items
    GROUP BY user_id
) item_points ON u.id = item_points.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) * 2 AS points
    FROM exchanges
    WHERE status = 'completed'
    GROUP BY user_id
) exchange_points ON u.id = exchange_points.user_id
ORDER BY points DESC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error in /leaderboard:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;