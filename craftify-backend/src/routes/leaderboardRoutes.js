const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Adjust path as needed
const cron = require("node-cron");

// GET /leaderboard/current - Fetch current leaderboard
router.get("/current", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, points FROM customer
      ORDER BY points DESC
      LIMIT 50
    `);

    const now = new Date();
    const monthYear = now.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    res.json({ leaderboard: result.rows, month: monthYear });
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// 🕒 Monthly CRON job to reset points and save history
cron.schedule("0 0 1 * *", async () => {
  const now = new Date();
  const monthYear = now.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  try {
    // Save current leaderboard to history
    await pool.query(
      `
      INSERT INTO leaderboard_history (customer_id, month_year, points)
      SELECT id, $1, points FROM customer WHERE points > 0
    `,
      [monthYear]
    );

    // Reset all points to 0
    await pool.query(`UPDATE customer SET points = 0`);

    console.log(`✅ Leaderboard reset for ${monthYear}`);
  } catch (error) {
    console.error("❌ CRON error during leaderboard reset:", error);
  }
});

module.exports = router;
