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

  if (charity_percentage != null) {
    const cp = Number(charity_percentage);
    if (isNaN(cp) || cp < 0 || cp >= 100) {
      return res.status(400).json({ error: 'Charity percentage must be between 0 and 99.99' });
    }
  }

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
 
// PUT /api/products/edit/:id
router.put("/edit/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      description,
      price,
      stock_quantity,
      product_detail,
      tutorial,
      charity_percentage,
      options,
    } = req.body;

    const productId = req.params.id;
    const storeId = await getStoreIdFromUser(req); // Your existing store auth check
    if (!storeId) {
      await client.query("ROLLBACK");
      return res.status(401).json({ error: "Unauthorized" });
    }

    // ✅ Charity percentage validation
    if (charity_percentage != null) {
      const cp = Number(charity_percentage);
      if (isNaN(cp) || cp < 0 || cp >= 100) {
        return res.status(400).json({ error: 'Charity percentage must be between 0 and 99.99' });
      }
    }

    // Update product main fields
    await client.query(
      `UPDATE product
       SET 
          description = COALESCE($1, description),
          price = COALESCE($2, price),
          stock_quantity = COALESCE($3, stock_quantity),
          product_detail = COALESCE($4, product_detail),
          tutorial = COALESCE($5, tutorial),
          charity_percentage = COALESCE($6, charity_percentage)
       WHERE product_id = $7 AND store_id = $8`,
      [
        description,
        price,
        stock_quantity,
        product_detail,
        tutorial,
        charity_percentage,
        productId,
        storeId,
      ]
    );

    // Handle customization options
    if (Array.isArray(options)) {
      for (const option of options) {
        // --- DELETE entire option ---
        if (option.deleted && option.id) {
          await client.query(
            `DELETE FROM product_option_name WHERE product_option_name_id = $1 AND product_id = $2`,
            [option.id, productId]
          );
          continue; // Skip to next option
        }

        let optionId = option.id;

        // --- NEW OPTION ---
        if (!optionId && !option.deleted) {
          const result = await client.query(
            `INSERT INTO product_option_name (product_id, name)
             VALUES ($1, $2)
             RETURNING product_option_name_id`,
            [productId, option.name]
          );
          optionId = result.rows[0].product_option_name_id;
        }

        // --- UPDATE OPTION NAME ---
        if (optionId && option.name && !option.deleted) {
          await client.query(
            `UPDATE product_option_name
             SET name = $1
             WHERE product_option_name_id = $2 AND product_id = $3`,
            [option.name, optionId, productId]
          );
        }

        // --- HANDLE OPTION VALUES ---
        if (Array.isArray(option.values)) {
          // 1) Fetch existing option value IDs from DB for this option
          const existingValuesRes = await client.query(
            `SELECT product_option_value_id FROM product_option_value WHERE product_option_name_id = $1`,
            [optionId]
          );
          const existingValueIds = existingValuesRes.rows.map(
            (r) => r.product_option_value_id
          );

          // 2) Gather IDs of incoming values NOT marked deleted
          const incomingValueIds = option.values
            .filter((v) => !v.deleted && v.id)
            .map((v) => v.id);

          // 3) Delete stale values in DB that are NOT in incoming values
          const valuesToDelete = existingValueIds.filter(
            (id) => !incomingValueIds.includes(id)
          );
          for (const valId of valuesToDelete) {
            await client.query(
              `DELETE FROM product_option_value WHERE product_option_value_id = $1`,
              [valId]
            );
          }

          // 4) Insert new / update existing values from incoming data
          for (const val of option.values) {
            if (val.deleted && val.id) {
              // Already deleted above via stale check, safe to skip
              continue;
            }

            if (!val.id && !val.deleted) {
              // New value insert
              await client.query(
                `INSERT INTO product_option_value (product_option_name_id, value)
                 VALUES ($1, $2)`,
                [optionId, val.value]
              );
            }

            if (val.id && val.value && !val.deleted) {
              // Update existing value
              await client.query(
                `UPDATE product_option_value
                 SET value = $1
                 WHERE product_option_value_id = $2`,
                [val.value, val.id]
              );
            }
          }
        }
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Product updated successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});


// DELETE /api/products/delete/:id
router.delete('/delete/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const productId = req.params.id;
    const storeId = await getStoreIdFromUser(req);
    if (!storeId) {
      await client.query('ROLLBACK');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Confirm product belongs to this seller's store
    const productRes = await client.query(
      `SELECT product_id FROM product WHERE product_id = $1 AND store_id = $2`,
      [productId, storeId]
    );

    if (productRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    // Delete related media first (if you want cascading, make sure DB supports it or delete manually)
    await client.query(
      `DELETE FROM product_media WHERE product_id = $1`,
      [productId]
    );

    // Delete option values
    await client.query(
      `DELETE FROM product_option_value WHERE product_option_name_id IN 
       (SELECT product_option_name_id FROM product_option_name WHERE product_id = $1)`,
      [productId]
    );

    // Delete option names
    await client.query(
      `DELETE FROM product_option_name WHERE product_id = $1`,
      [productId]
    );

    // Finally delete the product
    await client.query(
      `DELETE FROM product WHERE product_id = $1 AND store_id = $2`,
      [productId, storeId]
    );

    await client.query('COMMIT');
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});


module.exports = router;
