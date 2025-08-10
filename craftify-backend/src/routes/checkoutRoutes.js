// routes/checkoutRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { sendOrderPlacedEmail } = require('../utils/email');


router.post('/checkout', async (req, res) => {
    const client = await pool.connect();
    try {
        const { customer_id, customer_name, shipping_address, phone_number, customer_email } = req.body;

        if (!customer_id || !shipping_address || !phone_number || !customer_email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // 1. Fetch all cart items for the customer, including product details & selected_options
        const cartResult = await client.query(
            `SELECT c.cart_item_id, c.product_id, c.quantity, c.selected_options,
       p.price, p.product_name, p.store_id
FROM cart c
JOIN product p ON c.product_id = p.product_id
WHERE c.customer_id = $1
`,
            [customer_id]
        );

        const cartItems = cartResult.rows;

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // 2. Group items by store_id
        const groupedByStore = {};
        for (let item of cartItems) {
            if (!groupedByStore[item.store_id]) {
                groupedByStore[item.store_id] = [];
            }
            groupedByStore[item.store_id].push(item);
        }

        // 3. Create orders & order_items per store
        const createdOrders = [];

        await client.query('BEGIN');

        for (const [store_id, items] of Object.entries(groupedByStore)) {
            const total_amount = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

            const orderInsert = await client.query(
                `INSERT INTO "order" 
          (customer_id, store_id, customer_name, customer_email, shipping_address, phone_number, total_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING order_id`,
                [customer_id, store_id, customer_name, customer_email, shipping_address, phone_number, total_amount]
            );

            const order_id = orderInsert.rows[0].order_id;

            // Insert order items with selected_options as JSON (if you want to store customization)
            for (const item of items) {
                const subtotal = parseFloat(item.price) * item.quantity;
                // In order_item insert query, add selected_options
                await client.query(
                    `INSERT INTO order_item 
      (order_id, product_id, quantity, price_each, subtotal, selected_options)
     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [order_id, item.product_id, item.quantity, item.price, subtotal, item.selected_options]
                );

                // Optionally: store selected_options somewhere if your schema supports it.
            }

            createdOrders.push({ store_id, order_id });

            try {
                await sendOrderPlacedEmail(customer_email, {
                    order_id,
                    customer_name,
                    total_amount,
                    items,
                });
            } catch (emailError) {
                console.error(`Failed to send order email for order ${order_id}:`, emailError.message);
            }

        }

        // 4. Clear the cart for this customer
        await client.query('DELETE FROM cart WHERE customer_id = $1', [customer_id]);

        await client.query('COMMIT');

        res.status(201).json({ message: 'Orders placed successfully', orders: createdOrders });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Checkout error:', err);
        res.status(500).json({ error: 'Something went wrong during checkout' });
    } finally {
        client.release();
    }
});

module.exports = router;
