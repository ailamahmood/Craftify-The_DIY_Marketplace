const express = require("express");
const pool = require("../config/db");
const nodemailer = require("nodemailer");

const router = express.Router();

// **Configure Email Transporter**
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,  // Use environment variables
        pass: process.env.EMAIL_PASS,
    },
});

// **Send OTP to Email**
router.post("/send-otp", async (req, res) => {
    const { email } = req.body;
    console.log("Received email:", email);


    if (!email) return res.status(400).json({ error: "Email is required!" });

    try {
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
        console.log("Generated OTP for", email, ":", otp);


        // ✅ Store OTP in the database
        await pool.query("INSERT INTO otps (email, otp, created_at) VALUES ($1, $2, NOW()) ON CONFLICT (email) DO UPDATE SET otp = $2, created_at = NOW()", [email, otp]);

        // ✅ Send email
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Your OTP Code",
            text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
        }, (err, info) => {
            if (err) {
                console.error("Error sending email:", err);
            } else {
                console.log("Email sent:", info.response);
            }
        });
        

        res.status(200).json({ message: "OTP sent successfully!" });

    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ error: "Failed to send OTP" });
    }
});

// **Verify OTP**
router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required!" });

    try {
        const result = await pool.query("SELECT * FROM otps WHERE email = $1 AND otp = $2", [email, otp]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Invalid or expired OTP!" });
        }

        res.status(200).json({ message: "OTP verified successfully!" });

    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
