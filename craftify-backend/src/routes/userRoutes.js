const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../config/db");

const router = express.Router();

// **🔹 Sign-Up After OTP Verification**
router.post("/SignUp", async (req, res) => {
    console.log("🔹 Received SignUp Request:", req.body);

    const { username, email, password, role, otp } = req.body;

    if (!username || !email || !password || !role || !otp) {
        console.log("❌ Missing fields in request");
        return res.status(400).json({ error: "All fields are required!" });
    }

    try {
        // ✅ Check if OTP is valid
        const otpCheck = await pool.query("SELECT * FROM otps WHERE email = $1 AND otp = $2", [email, otp]);
        console.log("🔹 OTP Check Result:", otpCheck.rows);

        if (otpCheck.rows.length === 0) {
            console.log("❌ Invalid or expired OTP!");
            return res.status(400).json({ error: "Invalid OTP or expired!" });
        }

        // ✅ Check if email is already registered
        const emailCheckQuery = role.toLowerCase() === "customer"
            ? "SELECT * FROM customer WHERE c_email = $1"
            : "SELECT * FROM seller WHERE s_email = $1";

        const existingUser = await pool.query(emailCheckQuery, [email]);
        console.log("🔹 Existing User Check:", existingUser.rows);

        if (existingUser.rows.length > 0) {
            console.log("❌ Email already registered!");
            return res.status(400).json({ error: "Email already registered!" });
        }

        // ✅ Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("🔹 Hashed Password Generated");

        let query;
        if (role.toLowerCase() === "customer") {
            query = "INSERT INTO customer (username, c_email, password) VALUES ($1, $2, $3) RETURNING id, username, c_email";
        } else if (role.toLowerCase() === "seller") {
            query = "INSERT INTO seller (username, s_email, password) VALUES ($1, $2, $3) RETURNING id, username, s_email";
        } else {
            console.log("❌ Invalid role provided");
            return res.status(400).json({ error: "Invalid role!" });
        }

        // ✅ Insert user into the database
        const result = await pool.query(query, [username, email, hashedPassword]);
        console.log("✅ User Registered:", result.rows[0]);

        // ✅ Remove OTP after successful registration
        await pool.query("DELETE FROM otps WHERE email = $1", [email]);
        console.log("🔹 OTP Removed for:", email);

        res.status(201).json({ message: "User registered successfully!", user: result.rows[0] });

    } catch (error) {
        console.error("❌ Error registering user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// **🔹 Sign-In Route**
router.post("/SignIn", async (req, res) => {
    console.log("🔹 Received SignIn Request:", req.body);

    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        console.log("❌ Missing login fields");
        return res.status(400).json({ error: "Email, password, and role are required!" });
    }

    try {
        let query, column;

        // Ensure email is lowercase before querying
        const normalizedEmail = email.toLowerCase();

        if (role.toLowerCase() === "customer") {
            query = "SELECT * FROM customer WHERE LOWER(c_email) = $1";
            column = "c_email";
        } else if (role.toLowerCase() === "seller") {
            query = "SELECT * FROM seller WHERE LOWER(s_email) = $1";
            column = "s_email";
        } else {
            console.log("❌ Invalid role provided");
            return res.status(400).json({ error: "Invalid role!" });
        }

        // ✅ Fetch user from database, ensuring email comparison is case-insensitive
        const result = await pool.query(query, [normalizedEmail]);
        console.log("🔹 User Lookup Result:", result.rows);

        if (result.rows.length === 0) {
            console.log("❌ User not found!");
            return res.status(401).json({ error: "Invalid email or password!" });
        }

        const user = result.rows[0];

        // ✅ Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.log("❌ Password mismatch!");
            return res.status(401).json({ error: "Invalid email or password!" });
        }

        console.log("✅ Login Successful:", user.username);
        res.status(200).json({
            message: "Login successful!",
            user: { id: user.id, username: user.username, email: user[column], role },
        });

    } catch (error) {
        console.error("❌ Error logging in user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// 🔹 Update Password after OTP Verification (Forgot Password flow)
router.post("/update-password", async (req, res) => {
    console.log("🔹 Received Password Reset Request:", req.body);

    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        console.log("❌ Missing email or password");
        return res.status(400).json({ error: "Email and new password are required!" });
    }

    try {
        // Check if email exists in customer or seller table
        const customerCheck = await pool.query("SELECT * FROM customer WHERE LOWER(c_email) = $1", [email.toLowerCase()]);
        const sellerCheck = await pool.query("SELECT * FROM seller WHERE LOWER(s_email) = $1", [email.toLowerCase()]);

        if (customerCheck.rows.length === 0 && sellerCheck.rows.length === 0) {
            console.log("❌ Email not found in either table");
            return res.status(404).json({ error: "Email not registered!" });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        if (customerCheck.rows.length > 0) {
            await pool.query("UPDATE customer SET password = $1 WHERE LOWER(c_email) = $2", [hashedPassword, email.toLowerCase()]);
            console.log("✅ Password updated for customer");
        } else {
            await pool.query("UPDATE seller SET password = $1 WHERE LOWER(s_email) = $2", [hashedPassword, email.toLowerCase()]);
            console.log("✅ Password updated for seller");
        }

        // Optional: Delete OTP from the table after successful reset
        await pool.query("DELETE FROM otps WHERE email = $1", [email]);

        res.status(200).json({ message: "Password updated successfully!" });

    } catch (error) {
        console.error("❌ Error updating password:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;
