

/**
 * @module routes/items
 *
 * Express Router providing CRUD-like endpoints and integrations for "items".
 *
 * Middleware and utilities used:
 * - multer (memoryStorage) for parsing multipart/form-data image uploads (file field: "image").
 * - jsonwebtoken for verifying Bearer JWTs on protected endpoints.
 * - axios for proxying requests to external recommendation/nearby services.
 * - PostgreSQL connection pool (imported from ../db.js) for all DB interactions.
 * - updatePoints(fullName, points) is invoked after a successful item POST to award Eco Points.
 *
 * Exports:
 * - default: Express.Router instance with the following routes mounted.
 *
 * Routes:
 * 1. GET /
 *    - Description: Fetch a list of items joined with the posting user's full name.
 *    - Response: 200 JSON array of items (all item fields plus poster_name).
 *    - Errors: 500 on DB/server error.
 *
 * 2. GET /items
 *    - Description: Fetch items with their exchange status.
 *    - Query: Uses LEFT JOIN on exchanges and filters rows where items.active = true OR exchanges.status = 'completed'.
 *    - Response: 200 JSON array of items and exchange status.
 *    - Errors: 500 on DB/server error.
 *
 * 3. GET /  (duplicate route handlers exist in file)
 *    - Note: The file contains additional GET '/' handlers intended to return:
 *      a) /api/items -> SELECT id, title, location FROM items WHERE location IS NOT NULL
 *      b) /api/users -> SELECT id, username, location FROM users WHERE location IS NOT NULL
 *    - These duplicate root handlers may conflict at runtime. Each returns 200 JSON array on success and 500 on error.
 *
 * 4. GET /:id/image
 *    - Description: Retrieve the image blob for an item by its id.
 *    - Response: 200 image/png binary stream when image exists.
 *    - Errors:
 *      - 404 if no image is found for the given id.
 *      - 500 on DB/server error.
 *
 * 5. POST /
 *    - Description: Create a new item. Protected endpoint — requires `Authorization: Bearer <token>`.
 *    - Request:
 *      - Content-Type: multipart/form-data
 *      - Fields: title, description, location, exchangeCondition, category
 *      - File: image (optional) — available in req.file.buffer and stored in DB as binary.
 *    - Behavior:
 *      - Verifies JWT (uses process.env.JWT_SECRET). Extracts user id from token payload.
 *      - Inserts new item row into `items` table and returns the new item id.
 *      - Looks up the poster's full_name and calls updatePoints(full_name, 2) to award points.
 *    - Response:
 *      - 201 JSON { message: 'Item posted successfully', itemId }
 *    - Errors:
 *      - 401 if no token provided or if token is expired (TokenExpiredError).
 *      - 403 for invalid or malformed token.
 *      - 500 for DB/server errors.
 *
 * 6. GET /recommendations
 *    - Description: Fetch personalized recommendations for the authenticated user by proxying to an external recommendation service.
 *    - Authentication: Requires `Authorization: Bearer <token>` header which is forwarded to the external service.
 *    - Proxy Target: http://localhost:5001/recommendations
 *    - Response: 200 JSON from external service.
 *    - Errors: 401 when token missing; 500 when proxied request fails.
 *
 * 7. POST /nearby
 *    - Description: Request nearby items based on provided coordinates by proxying to an external geo service.
 *    - Request body: { latitude: number, longitude: number }
 *    - Proxy Target: http://localhost:5000/nearby
 *    - Response: 200 JSON from external service.
 *    - Errors: 500 when proxied request fails.
 *
 * Side effects and important notes:
 * - The router writes image binary data directly into the `items.image` column.
 * - updatePoints(full_name, 2) is called after item insertion — ensure this function is idempotent and resilient to failures.
 * - Several duplicate route definitions for the same path ('/') are present in the source. This may cause unexpected behavior; consolidate routes to unique paths to avoid conflicts.
 * - JWT verification errors are handled explicitly for token expiration; other verification errors return 403.
 *
 * Types (informal):
 * @typedef {Object} Item
 * @property {number} id
 * @property {number} user_id
 * @property {string} title
 * @property {string} description
 * @property {string|null} location
 * @property {string|null} exchange_condition
 * @property {Buffer|null} image
 * @property {string|null} category
 * @property {boolean} active
 * @property {string} created_at
 *
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {string} full_name
 * @property {string|null} location
 */
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

//  GET all items
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
// routes/items.js
router.get('/items', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT items.*, exchanges.status 
      FROM items
      LEFT JOIN exchanges ON items.id = exchanges.item_id
      WHERE items.active = true OR exchanges.status = 'completed'
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching items:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET /api/items

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, title, location FROM items WHERE location IS NOT NULL');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, location FROM users WHERE location IS NOT NULL');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//  GET image by item ID
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

//  POST new item and award Eco Points
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

//  GET recommendations for a user
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

//  POST nearby items based on location
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