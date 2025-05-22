// routes/wishlistRouter.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // your db connection

// Add to wishlist
router.post('/add', async (req, res) => {
  const { customer_id, product_id } = req.body;
  console.log('Add to wishlist:', req.body); // Log request body for debugging
  try {
    await pool.query(
      `INSERT INTO wishlist (customer_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [customer_id, product_id]
    );
    res.status(201).json({ message: 'Product added to wishlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove from wishlist
router.delete('/remove', async (req, res) => {
  const { customer_id, product_id } = req.body;
  try {
    await pool.query(
      `DELETE FROM wishlist WHERE customer_id = $1 AND product_id = $2`,
      [customer_id, product_id]
    );
    res.status(200).json({ message: 'Product removed from wishlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all wishlist items for customer
router.get('/:customer_id', async (req, res) => {
  const { customer_id } = req.params;
  try {
    const wishlistItems = await pool.query(
      `SELECT w.*, p.product_name, p.price, 
              COALESCE(AVG(r.rating), 0) as rating, 
              ARRAY_AGG(DISTINCT pm.media_url) as media_urls
       FROM wishlist w
       JOIN product p ON w.product_id = p.product_id
       LEFT JOIN product_media pm ON p.product_id = pm.product_id
       LEFT JOIN review r ON p.product_id = r.product_id
       WHERE w.customer_id = $1
       GROUP BY w.wishlist_id, p.product_name, p.price, p.product_id`,
      [customer_id]
    );

   

    // 👉 Always return 200 with an array
    res.status(200).json(wishlistItems.rows);

  } catch (error) {
    console.error(error); // Log any errors
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;
