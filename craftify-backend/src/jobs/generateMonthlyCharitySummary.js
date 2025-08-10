const cron = require('node-cron');
const pool = require('../config/db');

// Runs at 00:10 AM on the 1st day of every month
cron.schedule('10 0 1 * *', async () => {
  try {
    const result = await pool.query(`
      INSERT INTO charity_summary (month, year, total_amount)
      SELECT 
        EXTRACT(MONTH FROM o.created_at)::INT AS month,
        EXTRACT(YEAR FROM o.created_at)::INT AS year,
        SUM(oi.price * oi.quantity * p.charity_percentage / 100) AS total_amount
      FROM "order" o
      JOIN order_item oi ON o.order_id = oi.order_id
      JOIN product p ON oi.product_id = p.product_id
      WHERE o.status = 'completed'
        AND o.created_at >= date_trunc('month', CURRENT_DATE - interval '1 month')
        AND o.created_at < date_trunc('month', CURRENT_DATE)
      GROUP BY month, year
      ON CONFLICT (month, year) DO UPDATE 
      SET total_amount = EXCLUDED.total_amount
    `);

    console.log('Monthly charity summary updated.');
  } catch (error) {
    console.error('Error updating charity summary:', error.message);
  }
});
