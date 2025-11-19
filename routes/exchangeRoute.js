import express from 'express';
import pool from '../db.js';

const router = express.Router();

// POST update exchange status and sync item status
router.post('/status', async (req, res) => {
  const { itemId, status } = req.body;

  if (!itemId || !status) {
    return res.status(400).json({ error: 'itemId and status are required' });
  }

  try {
    await pool.query('BEGIN');

    // Update exchange status (or create if missing)
    const exchangeUpdate = await pool.query(
      'UPDATE exchanges SET status = $1, updated_at = NOW() WHERE item_id = $2 RETURNING id',
      [status, itemId]
    );

    if (exchangeUpdate.rowCount === 0) {
      // Auto-create exchange if not found
      await pool.query(
        'INSERT INTO exchanges (item_id, status, updated_at) VALUES ($1, $2, NOW())',
        [itemId, status]
      );
    }

    // If completed, update item status
    if (status === 'completed') {
      const itemUpdate = await pool.query(
        'UPDATE items SET status = $1 WHERE id = $2 RETURNING id, status',
        ['not available', itemId]
      );
      console.log('Item updated:', itemUpdate.rows);
    }

    await pool.query('COMMIT');
    res.json({ message: 'Exchange status updated successfully', status });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error updating exchange status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;