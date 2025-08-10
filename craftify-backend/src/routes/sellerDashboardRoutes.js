// backend/routes/sellerDashboardRoutes.js

const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// 1. Store info by sellerId
router.get("/store-info/:sellerId", async (req, res) => {
    const { sellerId } = req.params;
    try {
        const result = await pool.query(
            `SELECT store_id, store_name, store_logo, store_description 
       FROM store WHERE seller_id = $1`,
            [sellerId]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ error: "Store not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching store info:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 2. Store rating - average of all product reviews in the store
router.get("/store-rating/:storeId", async (req, res) => {
    const { storeId } = req.params;
    try {
        const result = await pool.query(
            `
      SELECT ROUND(AVG(r.rating)::numeric, 2) AS average_rating
      FROM review r
      JOIN product p ON r.product_id = p.product_id
      WHERE p.store_id = $1
      `,
            [storeId]
        );
        res.json({ average_rating: result.rows[0].average_rating || 0 });
    } catch (err) {
        console.error("Error fetching store rating:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 3. Sales summary (orders count and revenue with charity deduction)
router.get("/sales-summary/:storeId", async (req, res) => {
    const { storeId } = req.params;
    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, "0");
        const firstDayOfMonth = `${year}-${month}-01`;

        const query = `
      WITH charity_per_order AS (
        SELECT order_id, COALESCE(SUM(amount), 0) AS charity_amount
        FROM charity
        GROUP BY order_id
      )
      SELECT
        COUNT(o.order_id) AS total_sales_lifetime,
        COALESCE(SUM(o.total_amount), 0) - COALESCE(SUM(c.charity_amount), 0) AS total_revenue_lifetime,
        COUNT(CASE WHEN o.order_date >= $2 THEN o.order_id END) AS total_sales_month,
        COALESCE(SUM(CASE WHEN o.order_date >= $2 THEN o.total_amount ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN o.order_date >= $2 THEN c.charity_amount ELSE 0 END), 0) AS total_revenue_month
      FROM "order" o
LEFT JOIN charity_per_order c ON o.order_id = c.order_id
WHERE o.store_id = $1
  AND o.status = 'completed'
    `;

        const result = await pool.query(query, [storeId, firstDayOfMonth]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching sales summary:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 4. Orders summary grouped by status
router.get("/orders-summary/:storeId", async (req, res) => {
    const { storeId } = req.params;
    try {
        const result = await pool.query(
            `
      SELECT status, COUNT(*) AS count
      FROM "order"
      WHERE store_id = $1
      GROUP BY status
      ORDER BY status
      `,
            [storeId]
        );
        res.json(result.rows); // [{status: 'pending', count: 5}, ...]
    } catch (err) {
        console.error("Error fetching orders summary:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 5. Orders completed this month count
router.get("/completed-orders-month/:storeId", async (req, res) => {
    const { storeId } = req.params;
    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, "0");
        const firstDayOfMonth = `${year}-${month}-01`;

        const result = await pool.query(
            `
      SELECT COUNT(*) AS completed_orders_count
      FROM "order"
      WHERE store_id = $1
        AND status = 'completed'
        AND completed_at >= $2
      `,
            [storeId, firstDayOfMonth]
        );
        res.json({ completed_orders_count: parseInt(result.rows[0].completed_orders_count, 10) });
    } catch (err) {
        console.error("Error fetching completed orders this month:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 6. Top-selling product by quantity sold (lifetime)
router.get("/top-product/:storeId", async (req, res) => {
    const { storeId } = req.params;
    try {
        const result = await pool.query(
            `
      SELECT p.product_id, p.product_name, p.store_id, SUM(oi.quantity) AS total_quantity_sold
      FROM product p
      JOIN order_item oi ON p.product_id = oi.product_id
      JOIN "order" o ON oi.order_id = o.order_id
      WHERE p.store_id = $1
        AND o.status = 'completed'
      GROUP BY p.product_id
      ORDER BY total_quantity_sold DESC
      LIMIT 1
      `,
            [storeId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No sales data found for this store" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching top-selling product:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 7. Low stock alerts (products with stock_quantity < 10)
router.get("/low-stock/:storeId", async (req, res) => {
    const { storeId } = req.params;
    try {
        const threshold = 10; // Customize threshold as needed
        const result = await pool.query(
            `
      SELECT product_id, product_name, stock_quantity
      FROM product
      WHERE store_id = $1
        AND stock_quantity < $2
      ORDER BY stock_quantity ASC
      `,
            [storeId, threshold]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching low stock products:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 8. Sales chart data - monthly sales and revenue for past 6 months
router.get("/sales-chart/:storeId", async (req, res) => {
    const { storeId } = req.params;
    try {
        // Get past 6 months (including current month)
        // Format: 'YYYY-MM'
        // Aggregate orders by month: count and revenue (deduct charity)

        const query = `
      WITH charity_per_order AS (
        SELECT order_id, COALESCE(SUM(amount), 0) AS charity_amount
        FROM charity
        GROUP BY order_id
      ),
      orders_with_month AS (
        SELECT
          o.order_id,
          to_char(o.order_date, 'YYYY-MM') AS year_month,
          o.total_amount,
          c.charity_amount
       FROM "order" o
LEFT JOIN charity_per_order c ON o.order_id = c.order_id
WHERE o.store_id = $1
  AND o.status = 'completed'
  AND o.order_date >= (CURRENT_DATE - INTERVAL '6 months')
      )
      SELECT
        year_month,
        COUNT(order_id) AS sales_count,
        SUM(total_amount - charity_amount) AS revenue
      FROM orders_with_month
      GROUP BY year_month
      ORDER BY year_month
    `;

        const result = await pool.query(query, [storeId]);

        // Fill missing months with zeros if needed (optional)
        // For simplicity, just send raw results here

        res.json(result.rows); // [{year_month: '2025-03', sales_count: 5, revenue: 123.45}, ...]
    } catch (err) {
        console.error("Error fetching sales chart data:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
