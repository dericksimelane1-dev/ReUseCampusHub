import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.post('/predictEngagement', async (req, res) => {
  const { userId, itemsPosted, exchangesMade } = req.body;

  // Dynamically import python-shell
  const { PythonShell } = await import('python-shell');

  const options = {
    mode: 'text',
    pythonOptions: ['-u'],
    scriptPath: './python',
    args: [itemsPosted, exchangesMade]
  };

  PythonShell.run('predict.py', options, async (err, results) => {
    if (err) {
      console.error('Python error:', err);
      return res.status(500).json({ error: err.message });
    }

    const predictedPoints = parseFloat(results[0]);

    try {
      await pool.query(`
        INSERT INTO eco_points (user_id, predicted_points)
        VALUES ($1, $2)
        ON CONFLICT (user_id)
        DO UPDATE SET predicted_points = $2, last_updated = CURRENT_TIMESTAMP
      `, [userId, Math.round(predictedPoints)]);

      res.json({ predictedPoints });
    } catch (dbErr) {
      console.error('Database error:', dbErr);
      res.status(500).json({ error: 'Database update failed', details: dbErr.message });
    }
  });
});

export default router;