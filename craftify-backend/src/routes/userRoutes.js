const jwt = require("jsonwebtoken");
require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../config/db");

const router = express.Router();

// 🔹 Sign-Up After OTP Verification
router.post("/SignUp", async (req, res) => {
    const { username, email, password, role, otp } = req.body;

    if (!username || !email || !password || !role || !otp) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    try {
        const otpCheck = await pool.query("SELECT * FROM otps WHERE email = $1 AND otp = $2", [email, otp]);

        if (otpCheck.rows.length === 0) {
            return res.status(400).json({ error: "Invalid OTP or expired!" });
        }

        const emailCheckQuery = role.toLowerCase() === "customer"
            ? "SELECT * FROM customer WHERE c_email = $1"
            : "SELECT * FROM seller WHERE s_email = $1";

        const existingUser = await pool.query(emailCheckQuery, [email]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "Email already registered!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let query;
        if (role.toLowerCase() === "customer") {
            query = "INSERT INTO customer (username, c_email, password) VALUES ($1, $2, $3) RETURNING id, username, c_email";
        } else if (role.toLowerCase() === "seller") {
            query = "INSERT INTO seller (username, s_email, password) VALUES ($1, $2, $3) RETURNING id, username, s_email";
        } else {
            return res.status(400).json({ error: "Invalid role!" });
        }

        const result = await pool.query(query, [username, email, hashedPassword]);

        await pool.query("DELETE FROM otps WHERE email = $1", [email]);

        res.status(201).json({ message: "User registered successfully!", user: result.rows[0] });

    } catch (error) {
        console.error("❌ Error registering user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🔹 Sign-In Route
router.post("/SignIn", async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ error: "Email, password, and role are required!" });
    }

    try {
        let query, column;
        const normalizedEmail = email.toLowerCase();

        if (role.toLowerCase() === "customer") {
            query = "SELECT * FROM customer WHERE LOWER(c_email) = $1";
            column = "c_email";
        } else if (role.toLowerCase() === "seller") {
            query = "SELECT * FROM seller WHERE LOWER(s_email) = $1";
            column = "s_email";
        } else {
            return res.status(400).json({ error: "Invalid role!" });
        }

        const result = await pool.query(query, [normalizedEmail]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password!" });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid email or password!" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user[column],
                role: role.toLowerCase()
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        console.log(`✅ Login successful for ${user.username} (${user[column]})`);
        console.log(`🔐 JWT Token: ${token}`);

        res.status(200).json({
            message: "Login successful!",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user[column],
                role
            },
        });

    } catch (error) {
        console.error("❌ Error logging in user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🔹 Update Password after OTP Verification (Forgot Password flow)
router.post("/update-password", async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ error: "Email and new password are required!" });
    }

    try {
        const customerCheck = await pool.query("SELECT * FROM customer WHERE LOWER(c_email) = $1", [email.toLowerCase()]);
        const sellerCheck = await pool.query("SELECT * FROM seller WHERE LOWER(s_email) = $1", [email.toLowerCase()]);

        if (customerCheck.rows.length === 0 && sellerCheck.rows.length === 0) {
            return res.status(404).json({ error: "Email not registered!" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        if (customerCheck.rows.length > 0) {
            await pool.query("UPDATE customer SET password = $1 WHERE LOWER(c_email) = $2", [hashedPassword, email.toLowerCase()]);
        } else {
            await pool.query("UPDATE seller SET password = $1 WHERE LOWER(s_email) = $2", [hashedPassword, email.toLowerCase()]);
        }

        await pool.query("DELETE FROM otps WHERE email = $1", [email]);

        res.status(200).json({ message: "Password updated successfully!" });

    } catch (error) {
        console.error("❌ Error updating password:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
 