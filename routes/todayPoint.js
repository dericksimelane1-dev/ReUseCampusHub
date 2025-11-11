router.get('/todayPoints', async (req, res) => {
  const { name } = req.query;

  try {
    const userResult = await pool.query(
      `SELECT id FROM users WHERE LOWER(full_name) = LOWER($1)`,
      [name]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    // Use a full-day range to avoid timezone issues
    const itemPoints = await pool.query(
      `SELECT COUNT(*) * 2 AS points
       FROM items
       WHERE user_id = $1
         AND created_at >= CURRENT_DATE
         AND created_at < CURRENT_DATE + INTERVAL '1 day'`,
      [userId]
    );

    const exchangePoints = await pool.query(
      `SELECT COUNT(*) * 2 AS points
       FROM exchanges
       WHERE user_id = $1
         AND status = 'completed'
         AND completed_at >= CURRENT_DATE
         AND completed_at < CURRENT_DATE + INTERVAL '1 day'`,
      [userId]
    );

    const totalPoints =
      parseInt(itemPoints.rows[0].points || 0) +
      parseInt(exchangePoints.rows[0].points || 0);

    res.json({ points: totalPoints });
  } catch (err) {
    console.error('Error in /todayPoints:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});