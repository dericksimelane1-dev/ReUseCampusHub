import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  console.log('📡 /api/admin/dashboard route hit');

  try {
    const usersRes = await pool.query('SELECT COUNT(*) FROM users');
    const itemsRes = await pool.query('SELECT COUNT(*) FROM items');
    const exchangesRes = await pool.query('SELECT COUNT(*) FROM exchanges');
    const listingsRes = await pool.query(
      'SELECT Title AS name, Category AS status, poster_name FROM items ORDER BY id DESC LIMIT 50'
    );

    const metrics = {
      totalUsers: parseInt(usersRes.rows[0].count),
      totalItems: parseInt(itemsRes.rows[0].count),
      totalExchanges: parseInt(exchangesRes.rows[0].count)
    };

    res.json({
      metrics,
      listings: listingsRes.rows
    });
  } catch (error) {
    console.error('❌ Error in /dashboard route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;