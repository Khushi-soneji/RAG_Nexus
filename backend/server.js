const express = require("express");
const cors = require("cors");
const timetableRoutes = require("./routes/timetableRoutes");
const locationRoutes = require("./routes/locationRoutes");
const labRoutes = require("./routes/labRoutes");
const ragRoutes = require("./routes/ragRoutes");
const chatRoutes = require("./routes/chatRoutes");
const studentRoutes = require("./routes/studentRoutes");
const pool = require("./db/connection");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/timetable", timetableRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/labs", labRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/students", studentRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Nexus backend is running!"
    });
});


app.get("/api/test-db", async (req, res) => {

    try {

        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "PostgreSQL connected successfully!",
            time: result.rows[0].now
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});


const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Nexus backend running on http://localhost:${PORT}`);
});