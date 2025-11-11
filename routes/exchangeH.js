// reuseCampus/routes/exchangeH.js
import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const router = express.Router();

// PostgreSQL pool setup
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'reusecampus',
  password: '(Dm)36921',
  port: 5432,
});

// GET /api/exchange-history
router.get('/', async (req, res) => {
  console.log('Fetching exchange history...');
  try {
    const result = await pool.query(
      'SELECT id, status, item_id, updated_at FROM exchanges ORDER BY updated_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching exchange history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;