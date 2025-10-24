import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/conversations/:userId
router.get('/conversations/:userId', async (req, res) => {
  console.log('✅ Route hit: /api/conversations/' + req.params.userId);

  try {
    const userId = req.params.userId;

    const result = await pool.query(`
      SELECT DISTINCT ON (m.item_id, other_user.id)
        m.item_id,
        other_user.id AS other_user_id,
        other_user.full_name AS other_user_name,
        i.title AS item_title
      FROM messages m
      JOIN items i ON m.item_id = i.id
      JOIN users AS other_user ON 
        other_user.id = CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id 
          ELSE m.sender_id 
        END
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      ORDER BY m.item_id, other_user.id, m.timestamp DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching conversations:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;