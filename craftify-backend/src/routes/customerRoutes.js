const express = require("express");
const router = express.Router();
const pool = require('../config/db');

// GET customer by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM customer WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE customer info
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { username, phone_number, address } = req.body;

  try {
    const result = await pool.query(
      `UPDATE customer 
       SET username = $1, phone_number = $2, address = $3 
       WHERE id = $4 
       RETURNING *`,
      [username, phone_number, address, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
