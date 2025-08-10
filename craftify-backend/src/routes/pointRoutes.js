const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// --- Utility: Award points and log activity
// Note: Accept reviewId and orderId for logging
const awardPoints = async ({ customerId, points, activityType, reviewId = null, orderId = null }) => {
  await pool.query(
    `UPDATE customer SET points = points + $1 WHERE id = $2`,
    [points, customerId]
  );

  await pool.query(
    `INSERT INTO point_log (customer_id, activity_type, points_awarded, review_id, order_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [customerId, activityType, points, reviewId, orderId]
  );
};

// --- DAILY LOGIN: once per day ---
router.post("/daily-login", async (req, res) => {
  const { customerId } = req.body;

  try {
    const existing = await pool.query(
      `SELECT 1 FROM point_log
       WHERE customer_id = $1 AND activity_type = 'daily_login'
       AND DATE(timestamp) = CURRENT_DATE`,
      [customerId]
    );

    if (existing.rowCount > 0) {
      return res.status(200).json({ message: "Already awarded today" });
    }

    await awardPoints({ customerId, points: 5, activityType: "daily_login" });
    res.json({ message: "5 points awarded for daily login", pointsAwarded: 5 });

  } catch (err) {
    console.error("Daily login error:", err);
    res.status(500).json({ error: "Failed to award daily login points" });
  }
});

// --- PURCHASE: award for each completed order, no daily limit ---
router.post("/purchase", async (req, res) => {
  const { orderId } = req.body;

  try {
    const orderResult = await pool.query(
      `SELECT customer_id FROM "order"
       WHERE order_id = $1 AND completed_at IS NOT NULL`,
      [orderId]
    );

    if (orderResult.rowCount === 0) {
      return res.status(400).json({ error: "Order not found or not completed" });
    }

    const customerId = orderResult.rows[0].customer_id;

    // Prevent duplicate awarding for the same order
    const check = await pool.query(
      `SELECT 1 FROM point_log WHERE order_id = $1 AND activity_type = 'purchase'`,
      [orderId]
    );

    if (check.rowCount > 0) {
      return res.status(200).json({ message: "Points for this purchase already awarded" });
    }

    await awardPoints({ customerId, points: 50, activityType: "purchase", orderId });
    res.json({ message: "50 points awarded for purchase" });
  } catch (err) {
    console.error("Purchase points error:", err);
    res.status(500).json({ error: "Failed to award purchase points" });
  }
});

router.post("/review", async (req, res) => {
    const { reviewId } = req.body;
    console.log("📩 Incoming points request for reviewId:", reviewId);
  
    try {
      const reviewResult = await pool.query(
        `SELECT customer_id, review_text, image_url, image_url2
         FROM review WHERE review_id = $1`,
        [reviewId]
      );
  
      if (reviewResult.rowCount === 0) {
        console.log("❌ Review not found");
        return res.status(404).json({ error: "Review not found" });
      }
  
      const { customer_id, review_text, image_url, image_url2 } = reviewResult.rows[0];
      const hasText = review_text?.trim().length > 0;
      const hasImage = (image_url?.trim().length > 0) || (image_url2?.trim().length > 0);
  
      console.log("🔎 Review content check:", { hasText, hasImage });
  
      const previousLogs = await pool.query(
        `SELECT activity_type, points_awarded FROM point_log WHERE review_id = $1 AND customer_id = $2`,
        [reviewId, customer_id]
      );
  
      const previous = previousLogs.rows;
      const previousActivityTypes = previous.map(p => p.activity_type);
      const previousPointsTotal = previous.reduce((sum, p) => sum + p.points_awarded, 0);
  
      console.log("📜 Previous point log:", { previousActivityTypes, previousPointsTotal });
  
      if (previousLogs.rowCount === 0) {
        // First time points
        let points = 10;
        let activityType = "rate";
  
        if (hasText && !hasImage) {
          points = 15;
          activityType = "rate_review";
        } else if (hasImage) {
          points = 25;
          activityType = "rate_review_image";
        }
  
        console.log("🏆 Awarding new points:", { points, activityType });
  
        await awardPoints({ customerId: customer_id, points, activityType, reviewId });
        return res.json({ message: `${points} points awarded for review` });
  
      } else {
        // Upgrade logic
        if (previousActivityTypes.includes("rate_review_image")) {
          console.log("💡 Max points already awarded (25)");
          return res.status(200).json({ message: "Points for review already awarded at max level" });
        }
  
        if (hasImage && !previousActivityTypes.includes("rate_review_image")) {
          console.log("➕ Image upgrade detected");
          await awardPoints({ customerId: customer_id, points: 10, activityType: "review_image_upgrade", reviewId });
          return res.json({ message: "10 points awarded for adding image to review" });
        }
  
        if (hasText && !previousActivityTypes.includes("rate_review") && !previousActivityTypes.includes("rate_review_image")) {
          console.log("➕ Text upgrade detected");
          await awardPoints({ customerId: customer_id, points: 5, activityType: "review_text_upgrade", reviewId });
          return res.json({ message: "5 points awarded for adding review text" });
        }
  
        console.log("⚠️ No additional points awarded");
        return res.status(200).json({ message: "No points awarded for review update" });
      }
  
    } catch (err) {
      console.error("🔥 Review points error:", err);
      res.status(500).json({ error: "Failed to award review points" });
    }
  });
  

module.exports = router;
