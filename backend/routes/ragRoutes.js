const express = require("express");
const axios = require("axios");

const router = express.Router();

const pool = require("../db/connection");


router.post("/ask", async (req, res) => {

    try {

        const { question, session_id } = req.body;


        // Check required fields
        if (!question || !session_id) {

            return res.status(400).json({
                success: false,
                message: "question and session_id are required"
            });

        }


        // 1. Send question to Python RAG service

        const ragResponse = await axios.post(
            "http://localhost:8000/ask",
            {
                question: question
            }
        );


        const answer = ragResponse.data.answer;


        // 2. Save user's question

        await pool.query(
            `
            INSERT INTO messages
            (session_id, sender, message)
            VALUES ($1, $2, $3)
            `,
            [
                session_id,
                "user",
                question
            ]
        );


        // 3. Save Nexus's answer

        await pool.query(
            `
            INSERT INTO messages
            (session_id, sender, message)
            VALUES ($1, $2, $3)
            `,
            [
                session_id,
                "assistant",
                answer
            ]
        );


        // 4. Return answer

        res.json({

            success: true,

            session_id: session_id,

            question: question,

            answer: answer

        });


    } catch (error) {

        console.error(error.message);

        res.status(500).json({

            success: false,

            message: "Failed to process question"

        });

    }

});


module.exports = router;