import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET current exchange status (auto-create if missing)
router.get('/status/:itemId', async (req, res) => {
  const { itemId } = req.params;

  try {
    const result = await pool.query(
      'SELECT status FROM exchanges WHERE item_id = $1',
      [itemId]
    );

    if (result.rows.length === 0) {
      await pool.query(
        'INSERT INTO exchanges (item_id, status, updated_at) VALUES ($1, $2, NOW())',
        [itemId, 'pending']
      );
      return res.status(201).json({ status: 'pending' });
    }

    res.json({ status: result.rows[0].status });
  } catch (err) {
    console.error('Error fetching or creating exchange status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST update exchange status and sync item status
router.post('/status', async (req, res) => {
  const { itemId, status } = req.body;

  try {
    await pool.query('BEGIN');

    const existing = await pool.query('SELECT * FROM exchanges WHERE item_id = $1', [itemId]);

    if (existing.rows.length === 0) {
      // Auto-create exchange record
      await pool.query(
        'INSERT INTO exchanges (item_id, status, updated_at) VALUES ($1, $2, NOW())',
        [itemId, status]
      );
    } else {
      // Update existing exchange
      await pool.query(
        'UPDATE exchanges SET status = $1, updated_at = NOW() WHERE item_id = $2',
        [status, itemId]
      );
    }

    // If completed, update item status
    if (status === 'completed') {
      await pool.query('UPDATE items SET status = $1 WHERE id = $2', ['not available', itemId]);
    }

    await pool.query('COMMIT');
    res.json({ message: 'Exchange status updated', status });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error updating exchange status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;