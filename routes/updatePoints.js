import pool from '../db.js';

export default async function updatePoints(full_name, points) {
  if (!full_name || typeof points !== 'number') {
    throw new Error('Invalid input');
  }

  const client = await pool.connect();

  try {
    const userResult = await client.query(
      'SELECT * FROM users WHERE full_name = $1',
      [full_name]
    );

    if (userResult.rows.length > 0) {
      await client.query(
        'UPDATE users SET points = points + $1 WHERE full_name = $2',
        [points, full_name]
      );
    } else {
      await client.query(
        'INSERT INTO users (full_name, points) VALUES ($1, $2)',
        [full_name, points]
      );
    }

    const updatedUser = await client.query(
      'SELECT * FROM users WHERE full_name = $1',
      [full_name]
    );

    return updatedUser.rows[0];
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}