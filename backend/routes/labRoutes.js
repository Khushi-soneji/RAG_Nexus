const express = require("express");
const router = express.Router();

const pool = require("../db/connection");


router.get("/available", async (req, res) => {

    try {

        const { day, time } = req.query;

        if (!day || !time) {
            return res.status(400).json({
                success: false,
                message: "Day and time are required"
            });
        }


        const labsResult = await pool.query(`
            SELECT
                room,
                floor,
                name
            FROM locations
            WHERE LOWER(type) = LOWER('Lab')
            ORDER BY floor, room
        `);


        const occupiedResult = await pool.query(`
            SELECT DISTINCT room
            FROM timetable
            WHERE LOWER(day) = LOWER($1)
              AND start_time <= $2::time
              AND end_time > $2::time
              AND LOWER(class_type) = LOWER('Lab')
        `, [day, time]);


        const occupiedRooms = occupiedResult.rows.map(
            row => `Lab ${row.room}`
        );


        const availableLabs = labsResult.rows.filter(
            lab =>
                !occupiedRooms.some(
                    occupiedRoom =>
                        occupiedRoom.toLowerCase() === lab.room.toLowerCase()
                )
        );


        res.json({
            success: true,
            day: day,
            time: time,
            availability_type: "Timetable-based",
            occupied_labs: occupiedRooms,
            available_labs: availableLabs
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to check lab availability"
        });
    }
});


module.exports = router;