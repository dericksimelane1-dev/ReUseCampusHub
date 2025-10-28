import express from 'express';
const router = express.Router();
import pool from '../db.js';
import { v4 as uuidv4 } from 'uuid';

// Save exchange response (Yes/No)
router.post('/response', async (req, res) => {
  const { itemId, requesterId, response } = req.body;
   res.send('Exchange route working!');

  const status = response === 'yes' ? 'requested' : 'declined';

  try {
    const existing = await pool.query('SELECT * FROM exchanges WHERE item_id = $1', [itemId]);

    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE exchanges SET requester_id = $1, status = $2 WHERE item_id = $3',
        [requesterId, status, itemId]
      );
    } else {
      await pool.query(
        'INSERT INTO exchanges (id, item_id, requester_id, status, exchanged_at) VALUES ($1, $2, $3, $4, $5)',
        [uuidv4(), itemId, requesterId, status, null]
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Error saving exchange response:', err);
    res.status(500).send('Server error');
  }
});

export default router;