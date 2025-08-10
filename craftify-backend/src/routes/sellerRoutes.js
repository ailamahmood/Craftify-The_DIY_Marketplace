// routes/seller.js
const express = require("express");
const router = express.Router();
const pool = require('../config/db');

// Get seller + store info by seller ID
router.get("/:id", async (req, res) => {
  const sellerId = req.params.id;

  try {
    const sellerRes = await pool.query(
      `SELECT id, username, phone_number, s_email FROM seller WHERE id = $1`,
      [sellerId]
    );
    if (sellerRes.rowCount === 0) {
      return res.status(404).json({ error: "Seller not found" });
    }
    const seller = sellerRes.rows[0];

    const storeRes = await pool.query(
      `SELECT store_id, store_name, store_description, store_logo FROM store WHERE seller_id = $1`,
      [sellerId]
    );
    const store = storeRes.rows[0] || null;

    res.json({ seller, store });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update seller + store info by seller ID
router.put("/:id", async (req, res) => {
  const sellerId = req.params.id;
  const {
    username,
    phone_number,
    store_name,
    store_description,
    store_logo,
  } = req.body;

  if (!username || username.trim() === "") {
    return res.status(400).json({ error: "Username cannot be empty" });
  }
  // phone_number validation could be here or frontend-only

  try {
    // Update seller info
    await pool.query(
      `UPDATE seller SET username = $1, phone_number = $2 WHERE id = $3`,
      [username, phone_number, sellerId]
    );

    // Check if store exists for seller
    const storeRes = await pool.query(
      `SELECT store_id FROM store WHERE seller_id = $1`,
      [sellerId]
    );

    if (storeRes.rowCount === 0) {
      // Insert store if none exists
      await pool.query(
        `INSERT INTO store (seller_id, store_name, store_description, store_logo)
         VALUES ($1, $2, $3, $4)`,
        [sellerId, store_name || "", store_description || "", store_logo || null]
      );
    } else {
      // Update existing store
      const storeId = storeRes.rows[0].store_id;
      await pool.query(
        `UPDATE store SET store_name = $1, store_description = $2, store_logo = $3 WHERE store_id = $4`,
        [store_name || "", store_description || "", store_logo || null, storeId]
      );
    }

    res.json({ message: "Seller and store info updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update seller/store info" });
  }
});

module.exports = router;
