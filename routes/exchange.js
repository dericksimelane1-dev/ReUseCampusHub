import express from 'express';
import pool from '../db.js'; // Ensure your db.js also uses ESM exports

const router = express.Router();

// GET current exchange status

// GET current exchange status (auto-create if missing)
router.get('/status/:itemId', async (req, res) => {
  const { itemId } = req.params;

  try {
    const result = await pool.query(
      'SELECT status FROM exchanges WHERE item_id = $1',
      [itemId]
    );

    if (result.rows.length === 0) {
      // Auto-create exchange record with default status 'pending'
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


// POST update exchange status
router.post('/status', async (req, res) => {
  const { itemId, userId, status } = req.body;

  try {
    const existing = await pool.query(
      'SELECT * FROM exchanges WHERE item_id = $1',
      [itemId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Exchange not found' });
    }

    await pool.query(
      'UPDATE exchanges SET status = $1, updated_at = NOW() WHERE item_id = $2',
      [status, itemId]
    );
    

    res.json({ message: 'Exchange status updated', status });
  } catch (err) {
    console.error('Error updating exchange status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;