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
    const result = await pool.query(
      'SELECT id, full_name, email, phone_number, location, status FROM users ORDER BY email'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Block user
router.put('/:email/block', async (req, res) => {
  const { email } = req.params;
   console.log("Blocking user with email:", email); // Debug log
  try {
    await pool.query('UPDATE users SET status = $1 WHERE email = $2', ['blocked', email]);
    res.status(200).json({ message: `User ${email} blocked successfully.` });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Unblock user
router.put('/:email/unblock', async (req, res) => {
  const { email } = req.params;
  try {
    await pool.query('UPDATE users SET status = $1 WHERE email = $2', ['active', email]);
    res.status(200).json({ message: `User ${email} unblocked successfully.` });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete user
router.delete('/:email', async (req, res) => {
  const { email } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
    res.status(200).json({ message: `User ${email} deleted successfully.` });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;