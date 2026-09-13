const express = require("express");
const router = express.Router();

const pool = require("../db/connection");
const axios = require("axios");

async function handleLabAvailability(question) {

    const lowerQuestion = question.toLowerCase();

    // Check whether this is a lab availability question
    const labKeywords = [
        "lab",
        "labs",
        "laboratory"
    ];

    const availabilityKeywords = [
        "free",
        "available",
        "occupied"
    ];

    const isLabQuestion = labKeywords.some(
        keyword => lowerQuestion.includes(keyword)
    );

    const isAvailabilityQuestion = availabilityKeywords.some(
        keyword => lowerQuestion.includes(keyword)
    );

    if (!isLabQuestion || !isAvailabilityQuestion) {
        return null;
    }

    // Detect day
    const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
    ];

    let day = null;

    for (const currentDay of days) {

        if (lowerQuestion.includes(currentDay)) {
            day = currentDay;
            break;
        }
    }

    // If no day is mentioned, use today's day
    if (!day) {

        const today = new Date();

        const dayNames = [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday"
        ];

        day = dayNames[today.getDay()];
    }

    // Detect time such as 12:30, 2:00, 14:15
    const timeMatch = lowerQuestion.match(
        /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/
    );

    if (!timeMatch) {
        return "Please provide a time to check lab availability, for example: Which labs are free at 4 PM?";
    }

    let hour = parseInt(timeMatch[1]);

    const minute = timeMatch[2]
        ? parseInt(timeMatch[2])
        : 0;

    const period = timeMatch[3];

    if (period === "pm" && hour < 12) {
        hour += 12;
    }

    if (period === "am" && hour === 12) {
        hour = 0;
    }

    const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

    // Sunday is an institute holiday
    // Sunday is an institute holiday
    if (day === "sunday") {
        return `The institute is closed on Sunday. No labs are available.`;
    }

    // Check academic-calendar holidays
    const holidayResult = await pool.query(
        `
    SELECT holiday_name
    FROM holidays
    WHERE CURRENT_DATE BETWEEN holiday_date AND end_date
    LIMIT 1
    `
    );

    if (holidayResult.rows.length > 0) {

        const holidayName = holidayResult.rows[0].holiday_name;

        return `The institute is closed on ${holidayName}. No labs are available.`;
    }

    // Get all labs
    const labsResult = await pool.query(`
        SELECT
            room,
            floor,
            name
        FROM locations
        WHERE LOWER(type) = LOWER('Lab')
        ORDER BY floor, room
    `);

    // Get occupied labs
    const occupiedResult = await pool.query(
        `
        SELECT DISTINCT room
        FROM timetable
        WHERE LOWER(day) = LOWER($1)
          AND start_time <= $2::time
          AND end_time > $2::time
          AND LOWER(class_type) = LOWER('Lab')
        `,
        [day, time]
    );

    const occupiedRooms = occupiedResult.rows.map(
        row => String(row.room)
    );

    const availableLabs = labsResult.rows.filter(
        lab => !occupiedRooms.includes(
            String(lab.room).replace("Lab ", "")
        )
    );

    let answer = `Lab availability for ${day} at ${time}:\n\n`;

    if (lowerQuestion.includes("occupied")) {

        if (occupiedRooms.length === 0) {
            answer += "No labs are occupied at this time.";
        } else {
            answer += "Occupied labs:\n";

            occupiedRooms.forEach(room => {
                answer += `- Lab ${room}\n`;
            });
        }

        return answer;
    }

    if (availableLabs.length === 0) {

        return answer + "No labs are available at this time.";
    }

    answer += "Available labs:\n";

    availableLabs.forEach(lab => {
        answer += `- ${lab.name} (Floor ${lab.floor})\n`;
    });

    return answer;
}

async function handleRoomQuestion(question) {

    const lowerQuestion = question.toLowerCase();

    // Find a room number in the question
    const roomMatch = lowerQuestion.match(
        /\b(?:room|classroom|lab)\s*(\d+)\b/
    );

    if (!roomMatch) {
        return null;
    }

    const roomNumber = roomMatch[1];

    const result = await pool.query(
        `
        SELECT
            room,
            name,
            type,
            floor,
            building
        FROM locations
        WHERE room = $1
        `,
        [roomNumber]
    );

    if (result.rows.length === 0) {
        return `I could not find room ${roomNumber} in the college location database.`;
    }

    const location = result.rows[0];

    let answer = `Room ${location.room} is located in:\n\n`;

    if (location.name) {
        answer += `Name: ${location.name}\n`;
    }

    if (location.type) {
        answer += `Type: ${location.type}\n`;
    }

    if (location.floor) {
        answer += `Floor: ${location.floor}\n`;
    }

    if (location.building) {
        answer += `Building: ${location.building}\n`;
    }

    return answer;
}

async function handleNextLecture(studentId) {

    // Get student's semester and division
    const studentResult = await pool.query(
        `
        SELECT semester, division
        FROM students
        WHERE id = $1
        `,
        [studentId]
    );

    if (studentResult.rows.length === 0) {
        return "I could not find the student's profile.";
    }

    const studentSemester = studentResult.rows[0].semester;
    const studentDivision = studentResult.rows[0].division;

    // Days used in the timetable
    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    const today = new Date();
    const todayIndex = today.getDay();

    // Check today first
    let searchDays = [];

    for (let i = 0; i < 7; i++) {

        const dayIndex = (todayIndex + i) % 7;

        // Only Monday-Friday have classes
        if (dayIndex >= 1 && dayIndex <= 5) {

            searchDays.push({
                name: days[dayIndex],
                isToday: i === 0
            });

        }
    }

    // Check each working day
    for (const searchDay of searchDays) {

        let timeCondition = "";

        if (searchDay.isToday) {
            timeCondition = "AND start_time > CURRENT_TIME";
        }

        const result = await pool.query(
            `
            SELECT
                day,
                start_time,
                end_time,
                subject_code,
                subject,
                faculty,
                room,
                batch,
                class_type
            FROM timetable
            WHERE semester = $1
            AND division = $2
            AND LOWER(day) = LOWER($3)
            ${timeCondition}
            ORDER BY start_time
            LIMIT 1
            `,
            [
                studentSemester,
                studentDivision,
                searchDay.name
            ]
        );

        if (result.rows.length > 0) {

            const lecture = result.rows[0];

            let answer;

            if (searchDay.isToday) {
                answer = "Your next lecture is:\n\n";
            } else {
                answer = `Your next lecture is on ${searchDay.name}:\n\n`;
            }

            answer += `Subject: ${lecture.subject}\n`;
            answer += `Time: ${lecture.start_time} - ${lecture.end_time}\n`;

            if (lecture.subject_code) {
                answer += `Code: ${lecture.subject_code}\n`;
            }

            if (lecture.faculty) {
                answer += `Faculty: ${lecture.faculty}\n`;
            }

            if (lecture.room) {
                answer += `Room: ${lecture.room}\n`;
            }

            if (lecture.batch) {
                answer += `Batch: ${lecture.batch}\n`;
            }

            return answer;
        }
    }

    return "I could not find any upcoming lectures in your timetable.";
}

async function handleTimetableQuestion(question, studentId) {

    const lowerQuestion = question.toLowerCase();

    const timetableKeywords = [
        "timetable",
        "lecture",
        "class",
        "schedule",
        "next lecture",
        "next class",
        "subject",
        "faculty"
    ];

    const isTimetableQuestion = timetableKeywords.some(
        keyword => lowerQuestion.includes(keyword)
    );

    if (!isTimetableQuestion) {
        return null;
    }

    // Detect semester
    let semester = null;

    const semesterMatch = lowerQuestion.match(
        /semester\s*(1|3|5|7)/
    );

    if (semesterMatch) {
        semester = parseInt(semesterMatch[1]);
    }

    // Detect division
    let division = null;

    const divisionMatch = lowerQuestion.match(
        /division\s*([abc])/
    );

    if (divisionMatch) {
        division = divisionMatch[1].toUpperCase();
    }

    // Detect day
    const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday"
    ];

    let day = null;

    for (const currentDay of days) {
        if (lowerQuestion.includes(currentDay)) {
            day = currentDay;
            break;
        }
    }

    // Get student's semester and division
    const studentResult = await pool.query(
        `
    SELECT semester, division
    FROM students
    WHERE id = $1
    `,
        [studentId]
    );

    if (studentResult.rows.length === 0) {
        return "I could not find the student's profile.";
    }

    const studentSemester = studentResult.rows[0].semester;
    const studentDivision = studentResult.rows[0].division;

    // Build SQL query dynamically
    let query = `
        SELECT
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

    } else {

        query += ` AND semester = $${parameterNumber}`;
        values.push(studentSemester);
        parameterNumber++;

    }


    if (division) {

        query += ` AND division = $${parameterNumber}`;
        values.push(division);
        parameterNumber++;

    } else {

        query += ` AND division = $${parameterNumber}`;
        values.push(studentDivision);
        parameterNumber++;

    }

    if (day) {
        query += ` AND LOWER(day) = LOWER($${parameterNumber})`;
        values.push(day);
        parameterNumber++;
    }

    query += `
        ORDER BY
            semester,
            division,
            day,
            start_time
        LIMIT 50
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
        return "I could not find matching timetable information in the college database.";
    }

    let answer = "Here is the timetable information:\n\n";

    result.rows.forEach((row, index) => {

        answer += `${index + 1}. ${row.day} ${row.start_time} - ${row.end_time}\n`;

        answer += `Subject: ${row.subject || "N/A"}\n`;

        if (row.subject_code) {
            answer += `Code: ${row.subject_code}\n`;
        }

        if (row.faculty) {
            answer += `Faculty: ${row.faculty}\n`;
        }

        if (row.room) {
            answer += `Room: ${row.room}\n`;
        }

        if (row.batch) {
            answer += `Batch: ${row.batch}\n`;
        }

        if (row.division) {
            answer += `Division: ${row.division}\n`;
        }

        answer += "\n";
    });

    return answer;
}

// Add a message to a chat
router.post("/messages", async (req, res) => {
    try {
        const {
            session_id,
            sender,
            message
        } = req.body;

        if (!session_id || !sender || !message) {
            return res.status(400).json({
                success: false,
                message: "session_id, sender and message are required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO messages
            (session_id, sender, message)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [session_id, sender, message]
        );

        res.json({
            success: true,
            message: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to save message"
        });
    }
});


// Get all messages of a chat
router.get("/sessions/:session_id/messages", async (req, res) => {
    try {
        const { session_id } = req.params;

        const result = await pool.query(
            `
            SELECT *
            FROM messages
            WHERE session_id = $1
            ORDER BY created_at ASC
            `,
            [session_id]
        );

        res.json({
            success: true,
            count: result.rows.length,
            messages: result.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch messages"
        });
    }
});

// =========================================
// DELETE CHAT SESSION
// =========================================

router.delete("/sessions/:session_id", async (req, res) => {
    const client = await pool.connect();

    try {
        const { session_id } = req.params;

        await client.query("BEGIN");

        // Delete messages belonging to this chat
        await client.query(
            `
            DELETE FROM messages
            WHERE session_id = $1
            `,
            [session_id]
        );

        // Delete the chat session
        const result = await client.query(
            `
            DELETE FROM chat_sessions
            WHERE id = $1
            RETURNING id
            `,
            [session_id]
        );

        await client.query("COMMIT");

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Chat session not found"
            });
        }

        res.json({
            success: true,
            message: "Chat deleted successfully"
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error("Delete chat error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete chat"
        });

    } finally {
        client.release();
    }
});

// Create a new chat session
router.post("/session", async (req, res) => {
    try {
        const { title, student_id } = req.body;

        if (!student_id) {
            return res.status(400).json({
                success: false,
                message: "student_id is required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO chat_sessions (user_id, title)
            VALUES ($1, $2)
            RETURNING *
            `,
            [student_id, title || "New Chat"]
        );

        res.json({
            success: true,
            session: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create chat session"
        });
    }
});

// Get chat history for a specific student
router.get("/history/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;

        const result = await pool.query(
            `
            SELECT
                id,
                user_id,
                title,
                created_at
            FROM chat_sessions
            WHERE user_id = $1
            ORDER BY created_at DESC
            `,
            [studentId]
        );

        res.json({
            success: true,
            count: result.rows.length,
            sessions: result.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch chat history"
        });
    }
});

// Ask Nexus a question
router.post("/ask", async (req, res) => {

    try {

        const { question, session_id, student_id } = req.body;

        if (!question || !session_id || !student_id) {
            return res.status(400).json({
                success: false,
                message: "question, session_id and student_id are required"
            });
        }

        const nextLectureKeywords = [
            "next lecture",
            "next class",
            "upcoming lecture",
            "upcoming class"
        ];

        const isNextLectureQuestion = nextLectureKeywords.some(
            keyword => question.toLowerCase().includes(keyword)
        );

        // Try to answer using timetable data first
        const labAnswer = await handleLabAvailability(question);

        const roomAnswer = await handleRoomQuestion(question);

        /* =========================================
        HANDLE SIMPLE CONVERSATION
        ========================================= */

        const lowerQuestion = question.trim().toLowerCase();

        const greetings = [
            "hi",
            "hii",
            "hiii",
            "hello",
            "hey",
            "heyy",
            "good morning",
            "good afternoon",
            "good evening"
        ];

        const isGreeting = greetings.includes(lowerQuestion);

        let answer = null;


        /* =========================================
        GREETING
        ========================================= */

        if (isGreeting) {

            answer = "Hi! 👋 I'm Nexus. How can I help you today?";

        }


        /* =========================================
        CAMPUS / TIMETABLE QUESTIONS
        ========================================= */

        if (!answer) {

            const labAnswer = await handleLabAvailability(question);

            const roomAnswer = await handleRoomQuestion(question);

            let timetableAnswer;

            if (labAnswer) {

                timetableAnswer = labAnswer;

            } else if (roomAnswer) {

                timetableAnswer = roomAnswer;

            } else if (isNextLectureQuestion) {

                timetableAnswer = await handleNextLecture(student_id);

            } else {

                timetableAnswer = await handleTimetableQuestion(
                    question,
                    student_id
                );

            }

            if (timetableAnswer) {

                answer = timetableAnswer;

            }

        }


        /* =========================================
        RAG FALLBACK
        ========================================= */

        if (!answer) {

            const ragResponse = await axios.post(
                "http://localhost:8000/ask",
                {
                    question: question
                }
            );

            answer = ragResponse.data.answer;

        }

        // Save user's question
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

        // Save Nexus's answer
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