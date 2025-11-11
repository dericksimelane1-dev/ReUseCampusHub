// ecoPointsController.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // PostgreSQL connection

router.post('/updatePoints', async (req, res) => {
  const { userId, action } = req.body;
  let reward = 0;

  switch (action) {
    case 'item_posting':
      reward = 2;
      break;
    case 'exchange':
      reward = 2;
      break;
    default:
      reward = 0;
  }

  try {
    await pool.query(`
      INSERT INTO eco_points (user_id, total_points)
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET total_points = eco_points.total_points + $2, last_updated = CURRENT_TIMESTAMP
    `, [userId, reward]);

    res.json({ success: true, pointsEarned: reward });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update points' });
  }
});

module.exports = router;