const express = require("express");
const router = express.Router();

const pool = require("../db/connection");

router.get("/", async (req, res) => {

    try {

        const {
            semester,
            division,
            day,
            room,
            subject
        } = req.query;

        let query = `
            SELECT
            pid,
            semester,
            division,
            batch,
            day,
            start_time,
            end_time,
            subject_code,
            subject,
            faculty,
            room,
            class_type
        FROM timetable
            WHERE 1=1
        `;

        const values = [];
        let parameterNumber = 1;

        if (semester) {
            query += ` AND semester = $${parameterNumber}`;
            values.push(semester);
            parameterNumber++;
        }

        if (division) {
            query += ` AND division = $${parameterNumber}`;
            values.push(division);
            parameterNumber++;
        }

        if (day) {
            query += ` AND LOWER(day) = LOWER($${parameterNumber})`;
            values.push(day);
            parameterNumber++;
        }

        if (room) {
            query += ` AND room = $${parameterNumber}`;
            values.push(room);
            parameterNumber++;
        }

        if (subject) {
            query += ` AND LOWER(subject) LIKE LOWER($${parameterNumber})`;
            values.push(`%${subject}%`);
            parameterNumber++;
        }

        query += `
            ORDER BY
                semester,
                division,
                day,
                start_time
        `;

        const result = await pool.query(query, values);

        res.json({
            success: true,
            count: result.rows.length,
            filters: {
                semester: semester || null,
                division: division || null,
                day: day || null,
                room: room || null,
                subject: subject || null
            },
            data: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch timetable"
        });
    }
});

module.exports = router;