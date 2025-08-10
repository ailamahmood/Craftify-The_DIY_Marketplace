const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/verifyToken'); 
router.use(verifyToken);

async function getStoreIdFromUser(req) {
  // Check if user is logged in and is a seller
  const user = req.user;

  if (!user || user.role !== 'seller') {
    return null; // Not authorized
  }

  // If store_id already exists in token, use it
  if (user.store_id) {
    return user.store_id;
  }

  try {
    // Fetch store_id from DB using seller id
    const result = await pool.query(
      'SELECT store_id FROM store WHERE seller_id = $1',
      [user.id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].store_id;

  } catch (err) {
    console.error('Error fetching store_id:', err);
    return null;
  }
}

// GET all orders for seller (with customer details)
router.get('/all', async (req, res) => {
    const store_id = await getStoreIdFromUser(req);
    if (!store_id) return res.status(401).json({ error: 'Unauthorized' });
  
    try {
      const result = await pool.query(`
        SELECT 
          o.order_id,
          o.order_date,
          o.status,
          o.total_amount,
          o.shipping_address,
          o.phone_number,
          o.customer_email,
          c.username AS customer_username
        FROM "order" o
        JOIN customer c ON o.customer_id = c.id
        WHERE o.store_id = $1
        ORDER BY o.order_date DESC
      `, [store_id]);
  
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching all orders:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });  

  router.get('/active', async (req, res) => {
    const store_id = await getStoreIdFromUser(req);
    if (!store_id) return res.status(401).json({ error: 'Unauthorized' });
  
    try {
      const result = await pool.query(`
        SELECT 
          o.order_id,
          o.order_date,
          o.status,
          o.total_amount,
          o.shipping_address,
          o.phone_number,
          o.customer_email,
          c.username AS customer_username
        FROM "order" o
        JOIN customer c ON o.customer_id = c.id
        WHERE o.store_id = $1
        AND o.status IN ('pending', 'accepted', 'shipped')
        ORDER BY o.order_date DESC
      `, [store_id]);
  
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching active orders:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

  // GET all order items in an order (no user check)
router.get('/items/:orderId', async (req, res) => {
  const { orderId } = req.params;

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
              pm.media_url AS cover_image_url,
              o.status
          FROM order_item oi
          JOIN product p ON oi.product_id = p.product_id
          LEFT JOIN product_media pm ON p.product_id = pm.product_id AND pm.sort_order = 1
          JOIN "order" o ON oi.order_id = o.order_id
          WHERE oi.order_id = $1`,
          [orderId]
      );

      res.json(rows);
  } catch (err) {
      console.error('Error fetching order items:', err.message);
      res.status(500).json({ error: err.message });
  }
});


  router.patch('/:orderId/accept', async (req, res) => {
    const { orderId } = req.params;
    const store_id = await getStoreIdFromUser(req);
    if (!store_id) return res.status(401).json({ error: 'Unauthorized' });
  
    try {
      await pool.query(`
        UPDATE "order"
        SET status = 'accepted'
        WHERE order_id = $1 AND store_id = $2
      `, [orderId, store_id]);
  
      res.json({ message: 'Order accepted' });
    } catch (err) {
      console.error('Error accepting order:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.patch('/:orderId/reject', async (req, res) => {
    const { orderId } = req.params;
    const store_id = await getStoreIdFromUser(req);
    if (!store_id) return res.status(401).json({ error: 'Unauthorized' });
  
    try {
      await pool.query(`
        UPDATE "order"
        SET status = 'rejected'
        WHERE order_id = $1 AND store_id = $2
      `, [orderId, store_id]);
  
      res.json({ message: 'Order rejected' });
    } catch (err) {
      console.error('Error rejecting order:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.patch('/:orderId/ship', async (req, res) => {
    const { orderId } = req.params;
    const store_id = await getStoreIdFromUser(req);
    if (!store_id) return res.status(401).json({ error: 'Unauthorized' });
  
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
  
      // 1. Update order status
      await client.query(`
        UPDATE "order"
        SET status = 'shipped', shipped_at = NOW()
        WHERE order_id = $1 AND store_id = $2
      `, [orderId, store_id]);
  
      // 2. Fetch order items
      const orderItemsResult = await client.query(`
        SELECT product_id, quantity FROM order_item WHERE order_id = $1
      `, [orderId]);
  
      // 3. Decrease stock
      for (const item of orderItemsResult.rows) {
        await client.query(`
          UPDATE product
          SET stock_quantity = stock_quantity - $1
          WHERE product_id = $2
        `, [item.quantity, item.product_id]);
      }
  
      await client.query('COMMIT');
      res.json({ message: 'Order marked as shipped and stock updated' });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error marking order as shipped:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      client.release();
    }
  });

  module.exports = router;
