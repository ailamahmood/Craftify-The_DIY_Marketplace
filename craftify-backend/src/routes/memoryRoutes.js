const express = require('express');
const pool = require('../config/db'); // your PostgreSQL pool
const router = express.Router();

router.get('/completed-items/:customerId', async (req, res) => {
    const { customerId } = req.params;

    try {
        const { rows } = await pool.query(
            `SELECT 
                oi.order_item_id,
                oi.product_id,
                p.product_name,
                pm.media_url as cover_image_url,  -- product's main media
                m.memory_id,
                m.general_note
            FROM order_item oi
            JOIN "order" o ON o.order_id = oi.order_id
            JOIN product p ON p.product_id = oi.product_id
            LEFT JOIN product_media pm ON p.product_id = pm.product_id AND pm.sort_order = 1
            LEFT JOIN memory m ON m.order_item_id = oi.order_item_id
                                AND m.customer_id = o.customer_id
            WHERE o.status = 'completed' AND o.customer_id = $1
            ORDER BY o.order_date DESC`,
            [customerId]
        );

        res.json(rows);
    } catch (err) {
        console.error('Error fetching completed items:', err.message);
        res.status(500).json({ error: err.message });
    }
});


// ✅ GET all memory entries by customer
router.get('/:customerId', async (req, res) => {
    const { customerId } = req.params;
    try {
        const { rows } = await pool.query(
            `SELECT 
                m.memory_id,
                m.order_item_id,
                p.product_name,
                p.product_id,
                m.general_note,
                m.created_at,
                m.updated_at,
                (SELECT image_url FROM memory_image mi WHERE mi.memory_id = m.memory_id LIMIT 1) as cover_image_url
            FROM memory m
            JOIN order_item oi ON m.order_item_id = oi.order_item_id
            JOIN product p ON oi.product_id = p.product_id
            WHERE m.customer_id = $1
            ORDER BY m.updated_at DESC`,
            [customerId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET one memory entry with images
router.get('/entry/:memoryId', async (req, res) => {
    const { memoryId } = req.params;
    try {
        const memoryQuery = await pool.query(
            `SELECT * FROM memory WHERE memory_id = $1`,
            [memoryId]
        );

        if (memoryQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Memory not found' });
        }

        const imagesQuery = await pool.query(
            `SELECT * FROM memory_image WHERE memory_id = $1 ORDER BY uploaded_at ASC`,
            [memoryId]
        );

        res.json({
            ...memoryQuery.rows[0],
            images: imagesQuery.rows,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ POST create or update memory (note only)
router.post('/', async (req, res) => {
    const { customer_id, order_item_id, product_id, general_note } = req.body;

    if (!customer_id || !order_item_id || !product_id) {
        return res.status(400).json({ error: "customer_id, order_item_id, and product_id are required" });
    }

    try {
        const existing = await pool.query(
            `SELECT * FROM memory WHERE order_item_id = $1 AND customer_id = $2`,
            [order_item_id, customer_id]
        );

        if (existing.rows.length > 0) {
            // Update existing memory entry
            const updated = await pool.query(
                `UPDATE memory 
                 SET general_note = $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE memory_id = $2 
                 RETURNING *`,
                [general_note, existing.rows[0].memory_id]
            );
            return res.json(updated.rows[0]);
        }

        // Insert new memory entry with product_id
        const { rows } = await pool.query(
            `INSERT INTO memory (customer_id, order_item_id, product_id, general_note)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [customer_id, order_item_id, product_id, general_note]
        );

        res.json(rows[0]);
    } catch (err) {
        console.error("Memory creation error:", err.message);
        res.status(500).json({ error: err.message });
    }
});


// ✅ POST add image to memory
router.post('/:memoryId/image', async (req, res) => {
    const { memoryId } = req.params;
    const { image_url, image_note } = req.body;

    try {
        const { rows } = await pool.query(
            `INSERT INTO memory_image (memory_id, image_url, image_note)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [memoryId, image_url, image_note || null]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ PUT update image note
router.put('/image/:memoryImageId', async (req, res) => {
    const { memoryImageId } = req.params;
    const { image_note } = req.body;

    try {
        const { rows } = await pool.query(
            `UPDATE memory_image 
             SET image_note = $1, uploaded_at = CURRENT_TIMESTAMP 
             WHERE memory_image_id = $2
             RETURNING *`,
            [image_note || null, memoryImageId]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ DELETE a memory image
router.delete('/image/:memoryImageId', async (req, res) => {
    const { memoryImageId } = req.params;

    try {
        await pool.query(`DELETE FROM memory_image WHERE memory_image_id = $1`, [memoryImageId]);
        res.json({ message: 'Image deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ DELETE entire memory entry (and its images due to CASCADE)
router.delete('/:memoryId', async (req, res) => {
    const { memoryId } = req.params;

    try {
        await pool.query(`DELETE FROM memory WHERE memory_id = $1`, [memoryId]);
        res.json({ message: 'Memory deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
