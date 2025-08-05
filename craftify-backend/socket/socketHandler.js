const pool = require("../src/config/db");

const onlineUsers = new Map();

module.exports = function (io) {
    io.on("connection", (socket) => {
        const user = socket.user;
        const userId = user?.id;

        console.log("✅ New socket connection:", socket.id);
        console.log("👤 Authenticated user:", user);

        if (userId) {
            onlineUsers.set(userId, socket.id);
        }

        // ✅ Join Chat Room
        socket.on("joinChat", ({ chatId }) => {
            socket.join(chatId);
            console.log(`📥 ${user.username} joined chat ${chatId}`);
        });

        // ✅ Send Message
        socket.on("sendMessage", async (data) => {
            const { chat_id, sender_id, receiver_id, sender_type, message_text } = data;

            try {
                const result = await pool.query(
                    `INSERT INTO message (chat_id, sender_id, receiver_id, sender_type, message_text)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING *`,
                    [chat_id, sender_id, receiver_id, sender_type, message_text]
                );

                const message = result.rows[0];

                // Send to both users in room
                io.to(chat_id).emit("newMessage", message);
            } catch (err) {
                console.error("❌ Error sending message:", err);
            }
        });

         // ✅ Handle new message
         socket.on("newMessage", async ({ chat_id, sender_id, receiver_id, content, message_type }) => {
            try {
                const { rows } = await pool.query(
                    `INSERT INTO message (chat_id, sender_id, receiver_id, content, message_type)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING *`,
                    [chat_id, sender_id, receiver_id, content, message_type || "text"]
                );

                const message = rows[0];

                await pool.query(
                    `UPDATE chat SET updated_at = NOW() WHERE chat_id = $1`,
                    [chat_id]
                );

                const receiverSocketId = onlineUsers.get(receiver_id);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("messageReceived", message); // 👈 Notify receiver
                }

                socket.emit("messageSent", message); // 👈 Acknowledge sender
            } catch (err) {
                console.error("newMessage error:", err);
            }
        });

        // ✅ Typing Indicator
        socket.on("typing", ({ chat_id, sender_id, receiver_id }) => {
            const receiverSocketId = onlineUsers.get(receiver_id);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("typing", { chat_id, sender_id });
            }
        });

        // ✅ Mark Message as Read
        socket.on("mark_read", async ({ chat_id, reader_id }) => {
            try {
                await pool.query(
                    `UPDATE message SET is_read = TRUE
                     WHERE chat_id = $1 AND receiver_id = $2`,
                    [chat_id, reader_id]
                );

                const senderIds = await pool.query(
                    `SELECT DISTINCT sender_id FROM message
                     WHERE chat_id = $1 AND receiver_id = $2`,
                    [chat_id, reader_id]
                );

                senderIds.rows.forEach(({ sender_id }) => {
                    const senderSocket = onlineUsers.get(sender_id);
                    if (senderSocket) {
                        io.to(senderSocket).emit("messageRead", { chat_id, reader_id });
                    }
                });
            } catch (err) {
                console.error("mark_read error:", err);
            }
        });


        // ✅ Disconnect
        socket.on("disconnect", () => {
            console.log("❌ User disconnected:", socket.id);
            if (userId) onlineUsers.delete(userId);
        });
    });
};
