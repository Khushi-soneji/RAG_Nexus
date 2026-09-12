const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();

const pool = require("../db/connection");


// ===============================
// SIGNUP
// ===============================

router.post("/signup", async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            course,
            semester,
            division
        } = req.body;


        // Check required fields
        if (
            !name ||
            !email ||
            !password ||
            !course ||
            !semester ||
            !division
        ) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });

        }


        // Check whether email already exists
        const existingStudent = await pool.query(
            `
            SELECT id
            FROM students
            WHERE LOWER(email) = LOWER($1)
            `,
            [email]
        );


        if (existingStudent.rows.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });

        }


        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // Insert student
        const result = await pool.query(
            `
            INSERT INTO students
            (
                name,
                email,
                password,
                course,
                semester,
                division
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                id,
                name,
                email,
                course,
                semester,
                division,
                created_at
            `,
            [
                name,
                email,
                hashedPassword,
                course,
                semester,
                division
            ]
        );


        res.status(201).json({
            success: true,
            message: "Student registered successfully",
            student: result.rows[0]
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to register student"
        });

    }

});

// ===============================
// LOGIN
// ===============================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // Check required fields
        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });

        }


        // Find student by email
        const result = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                password,
                course,
                semester,
                division
            FROM students
            WHERE LOWER(email) = LOWER($1)
            `,
            [email]
        );


        if (result.rows.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }


        const student = result.rows[0];


        // Compare password with bcrypt hash
        const passwordMatch = await bcrypt.compare(
            password,
            student.password
        );


        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }


        // Login successful
        res.json({
            success: true,
            message: "Login successful",
            student: {
                id: student.id,
                name: student.name,
                email: student.email,
                course: student.course,
                semester: student.semester,
                division: student.division
            }
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Login failed"
        });

    }

});

// ===============================
// GET STUDENT PROFILE
// ===============================

router.get("/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                course,
                semester,
                division,
                created_at
            FROM students
            WHERE id = $1
            `,
            [id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Student not found"
            });

        }


        res.json({
            success: true,
            student: result.rows[0]
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch student profile"
        });

    }

});


module.exports = router;