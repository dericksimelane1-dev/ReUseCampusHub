import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js'; // Make sure db.js is also converted to ESM


const router = express.Router();

router.post('/reset-password', async (req, res) => {
  console.log('Password reset attempt with token:', req.body.token);
  const { token, password } = req.body;

  if (!token || !password || password.length < 8) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    const result = await pool.query(
      'SELECT email, expires_at FROM password_resets WHERE token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const { email, expires_at } = result.rows[0];

    if (new Date() > new Date(expires_at)) {
      return res.status(400).json({ message: 'Token has expired' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query('BEGIN');
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
    await pool.query('DELETE FROM password_resets WHERE token = $1', [token]);
    await pool.query('COMMIT');

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Password reset error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;