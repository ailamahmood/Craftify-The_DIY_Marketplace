const express = require('express');
const pool = require('../config/db'); // adjust your db connection
const router = express.Router();

// Create or get existing chat
router.post('/', async (req, res) => {
    const { customer_id, seller_id } = req.body;
    console.log("Received body:", req.body);  // ✅ Debugging line

    try {
        const existingChat = await pool.query(
            `SELECT * FROM chat WHERE customer_id = $1 AND seller_id = $2`,
            [customer_id, seller_id]
        );

        if (existingChat.rows.length > 0) {
            return res.status(200).json(existingChat.rows[0]);
        }

        const newChat = await pool.query(
            `INSERT INTO chat (customer_id, seller_id)
         VALUES ($1, $2)
         RETURNING *`,
            [customer_id, seller_id]
        );

        res.status(201).json(newChat.rows[0]);
    } catch (err) {
        console.error('Error creating/getting chat', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /chat/messages
router.post('/messages', async (req, res) => {
    const { chat_id, sender_id, receiver_id, content, message_type } = req.body;
  
    try {
      const { rows } = await pool.query(
        `INSERT INTO message (chat_id, sender_id, receiver_id, content, message_type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [chat_id, sender_id, receiver_id, content, message_type || 'text']
      );
  
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error('Error saving message', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    const type = (req.query.type || '').toLowerCase();
  
    try {
      let result;
  
      if (type === 'customer') {
        result = await pool.query(
          `SELECT 
              c.*, 
              m.content AS latest_message,
              m.message_type AS latest_message_type,
              m.created_at AS latest_message_time,
              st.store_name, 
              st.store_logo,
              (
                SELECT COUNT(*) 
                FROM message 
                WHERE chat_id = c.chat_id 
                  AND receiver_id = $1 
                  AND is_read = FALSE
              ) AS unread_count
          FROM chat c
          JOIN store st ON c.seller_id = st.seller_id
          LEFT JOIN LATERAL (
            SELECT content, created_at, message_type
            FROM message
            WHERE chat_id = c.chat_id
            ORDER BY created_at DESC
            LIMIT 1
          ) m ON true
          WHERE c.customer_id = $1
          ORDER BY m.created_at DESC NULLS LAST`,
          [userId]
        );
      } else if (type === 'seller') {
        result = await pool.query(
          `SELECT 
              c.*, 
              m.content AS latest_message,
              m.message_type AS latest_message_type,
              m.created_at AS latest_message_time,
              cu.username AS customer_name,
              (
                SELECT COUNT(*) 
                FROM message 
                WHERE chat_id = c.chat_id 
                  AND receiver_id = $1 
                  AND is_read = FALSE
              ) AS unread_count
          FROM chat c
          JOIN customer cu ON c.customer_id = cu.id
          LEFT JOIN LATERAL (
            SELECT content, created_at, message_type
            FROM message
            WHERE chat_id = c.chat_id
            ORDER BY created_at DESC
            LIMIT 1
          ) m ON true
          WHERE c.seller_id = $1
          ORDER BY m.created_at DESC NULLS LAST`,
          [userId]
        );
      } else {
        return res.status(400).json({ error: 'Invalid type. Must be customer or seller.' });
      }
  
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching chats:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

// Get all messages in a chat
router.get('/messages/:chatId', async (req, res) => {
    const { chatId } = req.params;

    try {
        const { rows } = await pool.query(
            `SELECT * FROM message
         WHERE chat_id = $1
         ORDER BY created_at ASC`,
            [chatId]
        );

        res.status(200).json(rows);
    } catch (err) {
        console.error('Error fetching messages', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Mark messages as read
router.patch('/messages/read', async (req, res) => {
    const { chat_id, receiver_id } = req.body;

    try {
        await pool.query(
            `UPDATE message
         SET is_read = true
         WHERE chat_id = $1 AND receiver_id = $2 AND is_read = false`,
            [chat_id, receiver_id]
        );

        res.status(200).json({ message: 'Messages marked as read' });
    } catch (err) {
        console.error('Error updating read status', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;