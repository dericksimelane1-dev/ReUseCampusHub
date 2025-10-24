import express from 'express';
import pool from '../db.js';

const router = express.Router();

// POST /api/messages
router.post('/messages', async (req, res) => {
  const { senderId, receiverId, itemId, content } = req.body;

  try {
    await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, item_id, content) VALUES ($1, $2, $3, $4)',
      [senderId, receiverId, itemId, content]
    );
    res.status(201).json({ message: 'Message sent' });
  } catch (err) {
    console.error('Error sending message:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/messages/:itemId/:userId/:otherUserId
router.get('/messages/:itemId/:userId/:otherUserId', async (req, res) => {
  const { itemId, userId, otherUserId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE item_id = $1 AND (
         (sender_id = $2 AND receiver_id = $3) OR 
         (sender_id = $3 AND receiver_id = $2)
       )
       ORDER BY timestamp ASC`,
      [itemId, userId, otherUserId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching messages:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;