

import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import pool from '../db.js';
import updatePoints from '../routes/updatePoints.js';// Ensure this path is correct

const router = express.Router();

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ GET all items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT items.*, users.full_name AS poster_name
       FROM items
       JOIN users ON items.user_id = users.id
       ORDER BY items.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching items:', err.message);
    res.status(500).json({ message: 'Server error while fetching items' });
  }
});

// ✅ GET image by item ID
router.get('/:id/image', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT image FROM items WHERE id = $1', [id]);

    if (result.rows.length > 0 && result.rows[0].image) {
      res.setHeader('Content-Type', 'image/png');
      res.send(result.rows[0].image);
    } else {
      res.status(404).send('Image not found');
    }
  } catch (err) {
    console.error('Error fetching image:', err.message);
    res.status(500).send('Server error');
  }
});

// ✅ POST new item and award Eco Points
router.post('/', upload.single('image'), async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { title, description, location, exchangeCondition, category } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;

    const result = await pool.query(
      `INSERT INTO items (user_id, title, description, location, exchange_condition, image, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [userId, title, description, location, exchangeCondition, imageBuffer, category]
    );

    const userResult = await pool.query('SELECT full_name FROM users WHERE id = $1', [userId]);
    const full_name = userResult.rows[0]?.full_name;

    if (full_name) {
      await updatePoints(full_name, 2);
    }

    res.status(201).json({ message: 'Item posted successfully', itemId: result.rows[0].id });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    console.error('Error posting item:', err.message);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
});

// ✅ GET recommendations for a user
router.get('/recommendations', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const response = await axios.get('http://localhost:5001/recommendations', {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching recommendations:', error.message);
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
});

// ✅ POST nearby items based on location
router.post('/nearby', async (req, res) => {
  const { latitude, longitude } = req.body;
  try {
    const response = await axios.post('http://localhost:5000/nearby', { latitude, longitude });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching nearby items:', error.message);
    res.status(500).json({ message: 'Failed to fetch nearby items' });
  }
});

export default router;