const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db/connection");

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const result = await pool.query(
            "SELECT * FROM admins WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials."
            });
        }

        const admin = result.rows[0];

        const validPassword = await bcrypt.compare(
            password,
            admin.password
        );

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials."
            });
        }

        res.json({
            success: true,
            message: "Admin login successful.",
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email
            }
        });

    } catch (error) {
        console.error("Admin login error:", error);

        res.status(500).json({
            success: false,
            message: "Admin login failed."
        });
    }
});

module.exports = router;