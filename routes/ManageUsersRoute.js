// routes/ManageUsersRoute.js
import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const router = express.Router();

const pool = new Pool({
  user: 'reusecampus',
  host: 'localhost',
  database: 'reusecampus',
  password: '(Dm)36921',
  port: 5432,
});

// GET all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Block user
router.put('/:id/block', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE users SET status = $1 WHERE id = $2', ['blocked', id]);
    res.status(200).json({ message: `User ${id} blocked successfully.` });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Unblock user
router.put('/:id/unblock', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE users SET status = $1 WHERE id = $2', ['active', id]);
    res.status(200).json({ message: `User ${id} unblocked successfully.` });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.status(200).json({ message: `User ${id} deleted successfully.` });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;