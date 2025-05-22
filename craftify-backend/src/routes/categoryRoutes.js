// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Updated path

// GET all categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT category_id, category_name, category_image FROM public.category ORDER BY category_name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;