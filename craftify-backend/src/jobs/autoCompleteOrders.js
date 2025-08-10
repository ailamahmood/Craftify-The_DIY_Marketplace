const cron = require('node-cron');
const pool = require('../config/db');
const axios = require('axios');
require('dotenv').config();
const { sendOrderCompletedEmail } = require('../utils/email');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';
const POINTS_API = `${BASE_URL}/points`;


// Runs every hour at minute 0
cron.schedule('0 * * * *', async () => {
  try {
    // 1. Get orders eligible for completion
    const ordersToComplete = await pool.query(`
      SELECT order_id, customer_id, customer_email, customer_name, total_amount
      FROM "order"
      WHERE status = 'shipped'
        AND shipped_at <= NOW() - INTERVAL '2 days'
    `);

    // 2. If no orders, just log and exit
    if (ordersToComplete.rowCount === 0) {
      console.log("[CRON] No orders to auto-complete");
      return;
    }

    // 3. Update all eligible orders to completed
    const updateResult = await pool.query(`
      UPDATE "order"
      SET status = 'completed',
          completed_at = NOW()
      WHERE status = 'shipped'
        AND shipped_at <= NOW() - INTERVAL '2 days'
    `);

    console.log(`[CRON] Auto-completed ${updateResult.rowCount} shipped orders`);

    // 4. For each completed order, award points
    for (const order of ordersToComplete.rows) {
      try {
        // 1. Award points
        await axios.post(`${POINTS_API}/purchase`, { orderId: order.order_id });
        console.log(`[CRON] Awarded points for order ${order.order_id}`);

        // 2. Get order items for the email
        const itemsResult = await pool.query(`
          SELECT 
            oi.product_id,
            oi.quantity,
            oi.price_each AS price,
            oi.selected_options,
            p.name AS product_name
          FROM order_item oi
          JOIN product p ON oi.product_id = p.product_id
          WHERE oi.order_id = $1
        `, [order.order_id]);
        

        const orderItems = itemsResult.rows;


        // 3. Insert charity record
        await pool.query(`
          INSERT INTO charity (order_id, customer_id, amount, created_at)
          SELECT oi.order_id, $2, SUM(oi.price_each * oi.quantity * p.charity_percentage / 100), NOW()
          FROM order_item oi
          JOIN product p ON oi.product_id = p.product_id
          WHERE oi.order_id = $1
          GROUP BY oi.order_id
        `, [order.order_id, order.customer_id]);
        

        console.log(`[CRON] Charity recorded for order ${order.order_id}`);

        // 4. Send completion email
        await sendOrderCompletedEmail(order.customer_email, {
          order_id: order.order_id,
          customer_name: order.customer_name,
          total_amount: order.total_amount,
          items: orderItems,
        });

        console.log(`[CRON] Sent completion email for order ${order.order_id}`);

      } catch (err) {
        console.error(`[CRON] Failed processing order ${order.order_id}:`, err.message);
      }
    }

  } catch (err) {
    console.error('[CRON] Error auto-completing orders:', err);
  }
});
