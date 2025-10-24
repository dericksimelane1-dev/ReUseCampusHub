const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'reuseCampus',
  password: '(Dm)36921',
  port: 5432
});

app.get('/api/metrics', async (req, res) => {
  try {
    const users = await pool.query('SELECT COUNT(*) FROM users');
    const items = await pool.query('SELECT COUNT(*) FROM items');
    const exchanges = await pool.query('SELECT COUNT(*) FROM exchanges');
    res.json({
      total_users: users.rows[0].count,
      total_items: items.rows[0].count,
      total_exchanges: exchanges.rows[0].count
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(5001, () => console.log('Admin server running on port 5001'));