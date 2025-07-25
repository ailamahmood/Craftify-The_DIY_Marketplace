require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./src/config/db"); // Import the database connection

const userRoutes = require("./src/routes/userRoutes"); // Import routes
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


const sellerProductRoutes = require('./src/routes/sellerProductRoutes');
const manageProductRoutes = require('./src/routes/manageProductRoutes');

const app = express();
app.use(cors());
app.use(express.json()); // Enable JSON parsing

app.use("/api/users", userRoutes); // Register user routes
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

app.use('/api/sellerProduct', sellerProductRoutes);
app.use('/api/manageProduct', manageProductRoutes);



app.get("/", (req, res) => {
    res.send("Craftify API is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
