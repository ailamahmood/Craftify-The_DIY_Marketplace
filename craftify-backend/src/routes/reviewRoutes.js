const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST /reviews
router.post('/', async (req, res) => {
    const { customer_id, product_id, rating, review_text, image_url, image_url2 } = req.body;
  
    try {
      const { rows } = await pool.query(
        `INSERT INTO review (
          customer_id,
          product_id,
          rating,
          review_text,
          image_url,
          image_url2
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [customer_id, product_id, rating, review_text, image_url, image_url2]
      );
  
      res.status(201).json({ message: 'Review submitted successfully', review: rows[0],
        review_id: rows[0].review_id });
    } catch (err) {
      console.error('Error adding review:', err.message);
      if (err.constraint === 'unique_customer_product_review') {
        res.status(409).json({ error: 'Review already exists for this product by this customer' });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  });

  // GET /reviews/product/:productId
router.get('/product/:productId', async (req, res) => {
    const { productId } = req.params;
  
    try {
      const { rows } = await pool.query(
        `SELECT 
          r.review_id,
          r.customer_id,
          c.username AS customer_name,
          r.rating,
          r.review_text,
          r.image_url,
          r.image_url2
        FROM review r
        JOIN customer c ON r.customer_id = c.id
        WHERE r.product_id = $1`,
        [productId]
      );
  
      res.json(rows);
    } catch (err) {
      console.error('Error fetching product reviews:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /reviews/:customerId/:productId
router.get('/:customerId/:productId', async (req, res) => {
    const { customerId, productId } = req.params;
  
    try {
      const { rows } = await pool.query(
        `SELECT * FROM review 
         WHERE customer_id = $1 AND product_id = $2`,
        [customerId, productId]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'No review found' });
      }
  
      res.json(rows[0]);
    } catch (err) {
      console.error('Error fetching review:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // PUT /reviews/:reviewId
router.put('/:reviewId', async (req, res) => {
    const { reviewId } = req.params;
    const { rating, review_text, image_url, image_url2 } = req.body;
  
    try {
      const { rows } = await pool.query(
        `UPDATE review
         SET rating = $1,
             review_text = $2,
             image_url = $3,
             image_url2 = $4
         WHERE review_id = $5
         RETURNING *`,
        [rating, review_text, image_url, image_url2, reviewId]
      );
  
      res.json({ message: 'Review updated', review: rows[0] });
    } catch (err) {
      console.error('Error updating review:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /reviews/:reviewId
router.delete('/:reviewId', async (req, res) => {
    const { reviewId } = req.params;
  
    try {
      const { rowCount } = await pool.query(
        `DELETE FROM review WHERE review_id = $1`,
        [reviewId]
      );
  
      if (rowCount === 0) {
        return res.status(404).json({ message: 'Review not found' });
      }
  
      res.json({ message: 'Review deleted successfully' });
    } catch (err) {
      console.error('Error deleting review:', err.message);
      res.status(500).json({ error: err.message });
    }
  });
  
  
module.exports = router;