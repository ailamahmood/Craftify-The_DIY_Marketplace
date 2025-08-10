require("dotenv").config();
require('./src/jobs/autoCompleteOrders');
require('./src/jobs/generateMonthlyCharitySummary');

const express = require("express");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const pool = require("./src/config/db"); // DB connection

const socketAuthMiddleware = require("./socket/middleware");
const socketHandler = require("./socket/socketHandler");

// Import routes
const userRoutes = require("./src/routes/userRoutes");
const otpRoutes = require("./src/routes/otpRoutes");
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes = require('./src/routes/productRoutes');
const wishlistRoutes = require('./src/routes/wishlistRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const leaderboardRoutes = require('./src/routes/leaderboardRoutes');
const storeRoutes = require('./src/routes/storeRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const checkoutRoutes = require('./src/routes/checkoutRoutes');
const memoryRoutes = require('./src/routes/memoryRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const pointRoutes = require("./src/routes/pointRoutes");
const charityRoutes = require("./src/routes/charityRoutes");

const sellerRoutes = require('./src/routes/sellerRoutes');
const sellerProductRoutes = require('./src/routes/sellerProductRoutes');
const manageProductRoutes = require('./src/routes/manageProductRoutes');
const sellerOrderRoutes = require('./src/routes/sellerOrderRoutes');
const sellerDashboardRoutes = require('./src/routes/sellerDashboardRoutes');

const app = express();
const server = http.createServer(app); // 👈 create HTTP server
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    }
});

// 🔐 Use Socket Auth Middleware
io.use(socketAuthMiddleware);

// 🎯 Use Socket Event Handlers
socketHandler(io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/otp", otpRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use("/api/points", pointRoutes);
app.use('/api/charity', charityRoutes);

app.use('/api/seller', sellerRoutes);
app.use('/api/sellerProduct', sellerProductRoutes);
app.use('/api/manageProduct', manageProductRoutes);
app.use('/api/sellerOrder', sellerOrderRoutes);
app.use('/api/sellerDashboard', sellerDashboardRoutes);

app.get("/", (req, res) => {
    res.send("Craftify API is running!");
});

// Listen on server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server + Socket.IO running on port ${PORT}`));
