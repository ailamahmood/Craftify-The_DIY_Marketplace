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


// GET all products by seller's store_id
router.get('/Q', async (req, res) => {
  const store_id = await getStoreIdFromUser(req);

  if (!store_id) {
    return res.status(401).json({ error: 'Unauthorized: Store ID not found' });
  }

  try {
    const productResult = await pool.query(`
      SELECT 
        p.product_id,
        p.product_name,
        p.description,
        p.price,
        p.stock_quantity,
        p.product_detail,
        p.age_groups,
        p.tutorial,
        p.charity_percentage,
        c.category_name,
        COALESCE(AVG(r.rating), 0)::numeric(3,2) AS avg_rating,
        COUNT(r.review_id) AS num_reviews
      FROM product p
      JOIN category c ON p.category_id = c.category_id
      LEFT JOIN review r ON r.product_id = p.product_id
      WHERE p.store_id = $1
      GROUP BY p.product_id, c.category_name
      ORDER BY p.product_name
    `, [store_id]);

    const products = productResult.rows;

    // Fetch and map media, options, and reviews (same logic as before)
    const [mediaResult, optionNameResult, optionValueResult, reviewResult] = await Promise.all([
      pool.query(`SELECT product_id, media_url, media_type, sort_order FROM product_media ORDER BY product_id, sort_order ASC`),
      pool.query(`SELECT pon.product_option_name_id, pon.product_id, pon.name FROM product_option_name pon`),
      pool.query(`SELECT pov.product_option_name_id, pov.value FROM product_option_value pov`),
      pool.query(`SELECT product_id, review_text, image_url FROM review`)
    ]);

    const mediaMap = {};
    mediaResult.rows.forEach(m => {
      if (!mediaMap[m.product_id]) mediaMap[m.product_id] = [];
      mediaMap[m.product_id].push(m);
    });

    const optionNameMap = {};
    optionNameResult.rows.forEach(on => {
      if (!optionNameMap[on.product_id]) optionNameMap[on.product_id] = [];
      optionNameMap[on.product_id].push({
        option_name_id: on.product_option_name_id,
        name: on.name,
        values: []
      });
    });

    optionValueResult.rows.forEach(ov => {
      for (const productId in optionNameMap) {
        const option = optionNameMap[productId].find(o => o.option_name_id === ov.product_option_name_id);
        if (option) option.values.push(ov.value);
      }
    });

    const reviewMap = {};
    reviewResult.rows.forEach(r => {
      if (!reviewMap[r.product_id]) reviewMap[r.product_id] = [];
      reviewMap[r.product_id].push(r);
    });

    const fullProducts = products.map(p => ({
      ...p,
      media: mediaMap[p.product_id] || [],
      options: optionNameMap[p.product_id] || [],
      reviews: reviewMap[p.product_id] || []
    }));

    res.json(fullProducts);

  } catch (err) {
    console.error('Error fetching seller products:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET product detail by productId (ensure it belongs to seller)
router.get('/:productId', async (req, res) => {
  const { productId } = req.params;
  const store_id = await getStoreIdFromUser(req);

  if (!store_id) {
    return res.status(401).json({ error: 'Unauthorized: Store ID not found' });
  }

  try {
    const productResult = await pool.query(`
      SELECT 
        p.product_id,
        p.product_name,
        p.description,
        p.price,
        p.stock_quantity,
        p.product_detail,
        p.age_groups,
        p.tutorial,
        p.charity_percentage,
        c.category_name,
        COALESCE(AVG(r.rating), 0)::numeric(3,2) AS avg_rating,
        COUNT(r.review_id) AS num_reviews
      FROM product p
      JOIN category c ON p.category_id = c.category_id
      LEFT JOIN review r ON r.product_id = p.product_id
      WHERE p.product_id = $1 AND p.store_id = $2
      GROUP BY p.product_id, c.category_name
    `, [productId, store_id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found or not owned by seller' });
    }

    const product = productResult.rows[0];

    const [mediaResult, optionNameResult, optionValueResult, reviewResult] = await Promise.all([
      pool.query(`SELECT media_url, media_type, sort_order FROM product_media WHERE product_id = $1 ORDER BY sort_order ASC`, [productId]),
      pool.query(`SELECT product_option_name_id, name FROM product_option_name WHERE product_id = $1`, [productId]),
      pool.query(`SELECT product_option_name_id, value FROM product_option_value WHERE product_option_name_id IN (
        SELECT product_option_name_id FROM product_option_name WHERE product_id = $1
      )`, [productId]),
      pool.query(`SELECT r.review_text, r.image_url, r.rating, c.username AS customer_name FROM review r JOIN customer c ON r.customer_id = c.id WHERE r.product_id = $1`, [productId])
    ]);

    const options = optionNameResult.rows.map(on => {
      const values = optionValueResult.rows.filter(ov => ov.product_option_name_id === on.product_option_name_id).map(ov => ov.value);
      return { option_name_id: on.product_option_name_id, name: on.name, values };
    });

    const media = mediaResult.rows;
    const reviews = reviewResult.rows;

    const fullProduct = {
      ...product,
      media,
      options,
      reviews
    };

    res.json(fullProduct);

  } catch (err) {
    console.error('Error fetching seller product detail:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
