// backend/routes/storeRoutes.js

const express = require("express");
const router = express.Router();
const pool = require('../config/db'); // PostgreSQL pool connection

// GET: Check if seller has a store
router.get("/seller/:sellerId", async (req, res) => {
    const { sellerId } = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM store WHERE seller_id = $1",
            [sellerId]
        );

        if (result.rows.length === 0) {
            return res.status(200).json({ exists: false });
        }

        return res.status(200).json({ exists: true, store: result.rows[0] });
    } catch (error) {
        console.error("Error fetching store by seller ID:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST: Create a new store
router.post("/create", async (req, res) => {
    const { seller_id, store_name, store_logo, store_description } = req.body;

    if (!seller_id || !store_name) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const insertQuery = `
            INSERT INTO store (seller_id, store_name, store_logo, store_description)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;

        const result = await pool.query(insertQuery, [
            seller_id,
            store_name,
            store_logo || null,
            store_description || null,
        ]);

        return res.status(201).json({ message: "Store created successfully", store: result.rows[0] });
    } catch (error) {
        console.error("Error creating store:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET store details by storeId
router.get('/store-details/:storeId', async (req, res) => {
    const { storeId } = req.params;
    try {
      const result = await pool.query(
        'SELECT seller_id, store_name, store_logo, store_description FROM store WHERE store_id = $1',
        [storeId]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Store not found' });
      }
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching store details:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

module.exports = router;
