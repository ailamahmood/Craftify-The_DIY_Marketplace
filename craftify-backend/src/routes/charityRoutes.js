const express = require('express');
const pool = require('../config/db'); // adjust your db connection
const router = express.Router();

router.get('/month/:year/:month', async (req, res) => {
    const { year, month } = req.params;
  
    try {
      const { rows } = await pool.query(
        `SELECT 
           c.amount,
           o.order_id,
           o.order_date,
           s.store_name
         FROM charity c
         JOIN "order" o ON c.order_id = o.order_id
         JOIN store s ON o.store_id = s.store_id
         WHERE EXTRACT(YEAR FROM c.created_at) = $1
           AND EXTRACT(MONTH FROM c.created_at) = $2
         ORDER BY c.created_at DESC`,
        [year, month]
      );
  
      res.json(rows);
    } catch (err) {
      console.error('Error fetching monthly charity:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/charity-organizations', async (req, res) => {
    try {
      const { rows } = await pool.query(`SELECT * FROM charity_organization ORDER BY created_at DESC`);
      res.json(rows);
    } catch (err) {
      console.error('Error fetching charity organizations:', err.message);
      res.status(500).json({ error: 'Failed to fetch charity organization data' });
    }
  });

  module.exports = router;
  