// cartRoutes.js
const express = require('express');
const pool = require('../config/db'); // adjust your db connection
const router = express.Router();

// GET cart items by customer_id
router.get('/:customerId', async (req, res) => {
    const { customerId } = req.params;
    try {
        const { rows } = await pool.query(
            `SELECT 
  c.cart_item_id,
  c.product_id,
  p.product_name,
  p.price,
  p.description,
  p.charity_percentage,
  pm.media_url,
  c.quantity,
  c.selected_options
FROM cart c
JOIN product p ON c.product_id = p.product_id
LEFT JOIN product_media pm ON p.product_id = pm.product_id AND pm.sort_order = 1
WHERE c.customer_id = $1;`,
            [customerId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } 
});


// POST add item to cart
// POST add item to cart (merge if duplicate)
router.post('/add', async (req, res) => {
    const { customer_id, product_id, quantity = 1, selected_options } = req.body;

    try {
        // Step 1: Check if same product with same options already exists
        const existingItem = await pool.query(
            `SELECT * FROM cart 
             WHERE customer_id = $1 
               AND product_id = $2 
               AND selected_options::jsonb = $3::jsonb`,
            [customer_id, product_id, selected_options]
        );

        if (existingItem.rows.length > 0) {
            // Step 2: Update quantity instead
            const existingId = existingItem.rows[0].cart_item_id;
            const newQuantity = existingItem.rows[0].quantity + quantity;

            const updatedItem = await pool.query(
                `UPDATE cart 
                 SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE cart_item_id = $2 
                 RETURNING *`,
                [newQuantity, existingId]
            );

            return res.json(updatedItem.rows[0]);
        }

        // Step 3: Otherwise, insert new item
        const { rows } = await pool.query(
            `INSERT INTO cart (customer_id, product_id, quantity, selected_options)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [customer_id, product_id, quantity, selected_options]
        );

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// PATCH update quantity
router.patch('/update', async (req, res) => {
    const { cart_item_id, quantity } = req.body;
    try {
        const { rows } = await pool.query(
            `UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE cart_item_id = $2 RETURNING *`,
            [quantity, cart_item_id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE remove item
router.delete('/delete/:cartItemId', async (req, res) => {
    const { cartItemId } = req.params;
    try {
        await pool.query('DELETE FROM cart WHERE cart_item_id = $1', [cartItemId]);
        res.json({ message: 'Item removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

