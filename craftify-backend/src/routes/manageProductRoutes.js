const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/verifyToken');
router.use(verifyToken);

async function getStoreIdFromUser(req) {
  const user = req.user;
  if (!user || user.role !== 'seller') return null;
  if (user.store_id) return user.store_id;

  try {
    const result = await pool.query('SELECT store_id FROM store WHERE seller_id = $1', [user.id]);
    if (result.rows.length === 0) return null;
    return result.rows[0].store_id;
  } catch (err) {
    console.error('Error fetching store_id:', err);
    return null;
  }
}

// ADD a new product
router.post('/add', async (req, res) => {
  const store_id = await getStoreIdFromUser(req);
  if (!store_id) return res.status(401).json({ error: 'Unauthorized' });

  const {
    category_id,
    product_name,
    description,
    price,
    stock_quantity,
    product_detail,
    age_groups,
    tutorial,
    charity_percentage,
    media = [],
    options = []
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Normalize age_groups to array (if it's a comma-separated string, convert it)
const ageGroupsArray = Array.isArray(age_groups)
? age_groups
: typeof age_groups === 'string'
? age_groups.split(',').map(s => s.trim())
: [];

// Then in your query, pass ageGroupsArray:
const productRes = await client.query(`
INSERT INTO product (
  store_id, category_id, product_name, description, price,
  stock_quantity, product_detail, age_groups, tutorial, charity_percentage
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING product_id`,
[store_id, category_id, product_name, description, price, stock_quantity, product_detail, ageGroupsArray, tutorial, charity_percentage || 0]
);


    const product_id = productRes.rows[0].product_id;

    for (const m of media) {
      await client.query(`
        INSERT INTO product_media (product_id, media_url, media_type, sort_order)
        VALUES ($1, $2, $3, $4)`,
        [product_id, m.media_url, m.media_type, m.sort_order || 0]
      );
    }

    for (const opt of options) {
      const optionNameRes = await client.query(`
        INSERT INTO product_option_name (product_id, name)
        VALUES ($1, $2)
        RETURNING product_option_name_id`,
        [product_id, opt.name]
      );
      const option_name_id = optionNameRes.rows[0].product_option_name_id;
      for (const val of opt.values) {
        await client.query(`
          INSERT INTO product_option_value (product_option_name_id, value)
          VALUES ($1, $2)`,
          [option_name_id, val]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Product added successfully', product_id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});
 
// EDIT an existing product
router.put('/edit/:productId', async (req, res) => {
  const { productId } = req.params;
  const store_id = await getStoreIdFromUser(req);
  if (!store_id) return res.status(401).json({ error: 'Unauthorized' });

  const {
    category_id,
    product_name,
    description,
    price,
    stock_quantity,
    product_detail,
    age_groups,
    tutorial,
    charity_percentage,
    media,
    options
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Validate ownership
    const result = await client.query(
      'SELECT * FROM product WHERE product_id = $1 AND store_id = $2',
      [productId, store_id]
    );
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    // Build dynamic SET query for fields that are present
    const updateFields = [];
    const values = [];
    let index = 1;

    if (category_id !== undefined) {
      updateFields.push(`category_id = $${index++}`);
      values.push(category_id);
    }
    if (product_name !== undefined) {
      updateFields.push(`product_name = $${index++}`);
      values.push(product_name);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${index++}`);
      values.push(description);
    }
    if (price !== undefined) {
      updateFields.push(`price = $${index++}`);
      values.push(price);
    }
    if (stock_quantity !== undefined) {
      updateFields.push(`stock_quantity = $${index++}`);
      values.push(stock_quantity);
    }
    if (product_detail !== undefined) {
      updateFields.push(`product_detail = $${index++}`);
      values.push(product_detail);
    }
    if (age_groups !== undefined) {
      updateFields.push(`age_groups = $${index++}`);
      values.push(age_groups);
    }
    if (tutorial !== undefined) {
      updateFields.push(`tutorial = $${index++}`);
      values.push(tutorial);
    }
    if (charity_percentage !== undefined) {
      updateFields.push(`charity_percentage = $${index++}`);
      values.push(charity_percentage);
    }

    if (updateFields.length > 0) {
      const updateQuery = `
        UPDATE product
        SET ${updateFields.join(', ')}
        WHERE product_id = $${index}`;
      values.push(productId);
      await client.query(updateQuery, values);
    }

    // If media is provided, update it
    if (Array.isArray(media)) {
      await client.query('DELETE FROM product_media WHERE product_id = $1', [productId]);
      for (const m of media) {
        await client.query(`
          INSERT INTO product_media (product_id, media_url, media_type, sort_order)
          VALUES ($1, $2, $3, $4)`,
          [productId, m.media_url, m.media_type, m.sort_order || 0]
        );
      }
    }

    // If options are provided, update them
    if (Array.isArray(options)) {
      await client.query(`
        DELETE FROM product_option_value
        WHERE product_option_name_id IN (
          SELECT product_option_name_id FROM product_option_name WHERE product_id = $1
        )`,
        [productId]
      );
      await client.query('DELETE FROM product_option_name WHERE product_id = $1', [productId]);

      for (const opt of options) {
        const optionNameRes = await client.query(`
          INSERT INTO product_option_name (product_id, name)
          VALUES ($1, $2)
          RETURNING product_option_name_id`,
          [productId, opt.name]
        );
        const option_name_id = optionNameRes.rows[0].product_option_name_id;

        for (const val of opt.values) {
          await client.query(`
            INSERT INTO product_option_value (product_option_name_id, value)
            VALUES ($1, $2)`,
            [option_name_id, val]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Product updated successfully' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error editing product:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

module.exports = router;
