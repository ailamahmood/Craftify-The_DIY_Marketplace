const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all products (with optional category and age group filters)
router.get('/', async (req, res) => {
  const { category_id, age_group } = req.query;

  let query = `
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
  `;

  const queryParams = [];
  const conditions = [];

  if (category_id) {
    conditions.push(`p.category_id = $${queryParams.length + 1}`);
    queryParams.push(category_id);
  }

  if (age_group) {
    const ages = Array.isArray(age_group) ? age_group : [age_group];
    if (ages.length === 1) {
      conditions.push(`p.age_groups @> $${queryParams.length + 1}::text[]`);
      queryParams.push(ages);
    } else {
      const orClauses = ages.map((_, idx) => {
        const paramIndex = queryParams.length + idx + 1;
        return `p.age_groups @> $${paramIndex}::text[]`;
      });
      conditions.push(`(${orClauses.join(' OR ')})`);
      ages.forEach(age => queryParams.push([age]));
    }
  }

  if (conditions.length) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += `
    GROUP BY p.product_id, c.category_name
    ORDER BY p.product_name
  `;

  console.log('Final Query:', query);
  console.log('Query Parameters:', queryParams);

  try {
    const productResult = await pool.query(query, queryParams);
    console.log('Products:', productResult.rows);

    const products = productResult.rows;

    const mediaResult = await pool.query(`
      SELECT product_id, media_url, media_type, sort_order
      FROM product_media
      ORDER BY product_id, sort_order ASC
    `);
    console.log('Media:', mediaResult.rows);

    const optionNameResult = await pool.query(`
      SELECT pon.product_option_name_id, pon.product_id, pon.name
      FROM product_option_name pon
    `);
    console.log('Option Names:', optionNameResult.rows);

    const optionValueResult = await pool.query(`
      SELECT pov.product_option_name_id, pov.value
      FROM product_option_value pov
    `);
    console.log('Option Values:', optionValueResult.rows);

    const reviewResult = await pool.query(`
      SELECT product_id, review_text, image_url
      FROM review
    `);
    console.log('Reviews:', reviewResult.rows);

    const mediaMap = {};
    mediaResult.rows.forEach(m => {
      if (!mediaMap[m.product_id]) mediaMap[m.product_id] = [];
      mediaMap[m.product_id].push({
        media_url: m.media_url,
        media_type: m.media_type,
        sort_order: m.sort_order
      });
    });
    console.log('Media Map:', mediaMap);

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
    console.log('Option Name Map:', optionNameMap);

    const reviewMap = {};
    reviewResult.rows.forEach(r => {
      if (!reviewMap[r.product_id]) reviewMap[r.product_id] = [];
      reviewMap[r.product_id].push({
        review_text: r.review_text,
        image_url: r.image_url
      });
    });
    console.log('Review Map:', reviewMap);

    const fullProducts = products.map(p => ({
      ...p,
      media: mediaMap[p.product_id] || [],
      options: optionNameMap[p.product_id] || [],
      reviews: reviewMap[p.product_id] || []
    }));

    console.log('Full Products:', fullProducts);
    res.json(fullProducts);

  } catch (err) {
    console.error('Error fetching full product details:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET product detail by productId
router.get('/:productId', async (req, res) => {
  const { productId } = req.params;
  console.log('Fetching product with ID:', productId);

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
      WHERE p.product_id = $1
      GROUP BY p.product_id, c.category_name
    `, [productId]);

    if (productResult.rows.length === 0) {
      console.log('Product not found.');
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];
console.log('Product:', product);
console.log(`Average Rating: ${product.avg_rating}, Number of Ratings: ${product.num_reviews}`);


    const mediaResult = await pool.query(`
      SELECT media_url, media_type, sort_order
      FROM product_media
      WHERE product_id = $1
      ORDER BY sort_order ASC
    `, [productId]);
    console.log('Media:', mediaResult.rows);

    const optionNameResult = await pool.query(`
      SELECT product_option_name_id, name
      FROM product_option_name
      WHERE product_id = $1
    `, [productId]);
    console.log('Option Names:', optionNameResult.rows);

    const optionValueResult = await pool.query(`
      SELECT product_option_name_id, value
      FROM product_option_value
      WHERE product_option_name_id IN (
        SELECT product_option_name_id
        FROM product_option_name
        WHERE product_id = $1
      )
    `, [productId]);
    console.log('Option Values:', optionValueResult.rows);

    const reviewResult = await pool.query(`
      SELECT 
        r.review_text, 
        r.image_url, 
        r.rating,
        c.username AS customer_name
      FROM review r
      JOIN customer c ON r.customer_id = c.id
      WHERE r.product_id = $1
    `, [productId]);
    console.log('Reviews:', reviewResult.rows);

    const media = mediaResult.rows.map(m => ({
      media_url: m.media_url,
      media_type: m.media_type,
      sort_order: m.sort_order
    }));

    const options = optionNameResult.rows.map(on => {
      const values = optionValueResult.rows
        .filter(ov => ov.product_option_name_id === on.product_option_name_id)
        .map(ov => ov.value);
      return {
        option_name_id: on.product_option_name_id,
        name: on.name,
        values
      };
    });

    const reviews = reviewResult.rows.map(r => ({
      review_text: r.review_text,
      image_url: r.image_url,
      rating: r.rating,
      customer_name: r.customer_name
    }));

    const fullProduct = {
      ...product,
      media,
      options,
      reviews
    };

    console.log('Full Product:', fullProduct);
    res.json(fullProduct);

  } catch (err) {
    console.error('Error fetching product detail:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
