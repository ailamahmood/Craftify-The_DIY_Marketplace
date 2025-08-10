const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// ✅ GET all orders of a customer (sorted latest first)
router.get('/:customerId', async (req, res) => {
    const { customerId } = req.params;
  
    try {
      const { rows } = await pool.query(
        `SELECT 
            o.order_id,
            o.order_date,
            o.status,
            o.total_amount,
            o.shipping_address,
            o.phone_number,
            o.customer_email,
            s.store_name,
            COALESCE(SUM(
                CASE 
                    WHEN p.charity_percentage > 0 THEN 
                        (oi.subtotal * p.charity_percentage / 100)
                    ELSE 0 
                END
            ), 0) AS charity_amount
        FROM "order" o
        JOIN store s ON o.store_id = s.store_id
        JOIN order_item oi ON o.order_id = oi.order_id
        JOIN product p ON oi.product_id = p.product_id
        WHERE o.customer_id = $1
        GROUP BY o.order_id, s.store_name
        ORDER BY o.order_date DESC`,
        [customerId]
      );
  
      res.json(rows);
    } catch (err) {
      console.error('Error fetching orders:', err.message);
      res.status(500).json({ error: err.message });
    }
  });
  

router.get('/items/:orderId/:customerId', async (req, res) => {
    const { orderId, customerId } = req.params;

    try {
        const { rows } = await pool.query(
            `SELECT 
                oi.order_item_id,
                oi.quantity,
                oi.price_each,
                oi.subtotal,
                oi.selected_options,
                p.product_id,
                p.product_name,
                p.charity_percentage,
                pm.media_url AS cover_image_url,
                o.status,
                EXISTS (
                    SELECT 1
                    FROM review r
                    WHERE r.customer_id = $2 AND r.product_id = p.product_id
                ) AS has_review
            FROM order_item oi
            JOIN product p ON oi.product_id = p.product_id
            LEFT JOIN product_media pm ON p.product_id = pm.product_id AND pm.sort_order = 1
            JOIN "order" o ON oi.order_id = o.order_id
            WHERE oi.order_id = $1`,
            [orderId, customerId]
        );

        res.json(rows);
    } catch (err) {
        console.error('Error fetching order items with reviews:', err.message);
        res.status(500).json({ error: err.message });
    }
});

  
router.get('/completed-items/:customerId', async (req, res) => {
    const { customerId } = req.params;

    try {
        const { rows } = await pool.query(
            `SELECT 
                o.order_id,
                o.order_date,
                oi.order_item_id,
                oi.product_id,
                p.product_name,
                pm.media_url AS cover_image_url,
                -- Check if review exists for this customer-product pair
                EXISTS (
                    SELECT 1 
                    FROM review r 
                    WHERE r.customer_id = $1 AND r.product_id = p.product_id
                ) AS has_review
            FROM "order" o
            JOIN order_item oi ON o.order_id = oi.order_id
            JOIN product p ON oi.product_id = p.product_id
            LEFT JOIN product_media pm ON p.product_id = pm.product_id AND pm.sort_order = 1
            WHERE o.customer_id = $1 AND o.status = 'completed'
            ORDER BY o.order_date DESC`,
            [customerId]
        );

        res.json(rows);
    } catch (err) {
        console.error('Error fetching completed items:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
