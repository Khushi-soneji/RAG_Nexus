const express = require("express");
const router = express.Router();

const pool = require("../db/connection");


router.get("/", async (req, res) => {

    try {

        const {
            floor,
            room,
            type,
            department
        } = req.query;

        let query = `
            SELECT
                id,
                building,
                floor,
                room,
                type,
                department,
                name
            FROM locations
            WHERE 1=1
        `;

        const values = [];
        let parameterNumber = 1;


        if (floor) {
            query += 'AND floor = $${parameterNumber}';
            values.push(floor);
            parameterNumber++;
        }


        if (room) {
            query += 'AND LOWER(room) = LOWER($${parameterNumber})';
            values.push(room);
            parameterNumber++;
        }


        if (type) {
            query += 'AND LOWER(type) = LOWER($${parameterNumber})';
            values.push(type);
            parameterNumber++;
        }


        if (department) {
            query += ' AND LOWER(department) = LOWER($${parameterNumber})';
            values.push(department);
            parameterNumber++;
        }


        query += ' ORDER BY floor, room';


        const result = await pool.query(query, values);


        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch locations"
        });
    }
});


module.exports = router;