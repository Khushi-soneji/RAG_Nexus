-- =========================================
-- NEXUS DATABASE SCHEMA
-- Database: nexus_db
-- =========================================

-- =========================================
-- 1. USERS
-- =========================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    course VARCHAR(100),
    semester INT,
    division VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- 2. TIMETABLE
-- =========================================

CREATE TABLE timetable (
    id SERIAL PRIMARY KEY,
    semester INT NOT NULL,
    division VARCHAR(20),
    day VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject VARCHAR(150),
    faculty VARCHAR(150),
    room VARCHAR(50),
    class_type VARCHAR(30),
    subject_code VARCHAR(30)
);


-- =========================================
-- 3. LOCATIONS
-- =========================================

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    building VARCHAR(100),
    floor INT,
    room VARCHAR(50),
    type VARCHAR(50),
    department VARCHAR(100),
    name VARCHAR(150)
);


-- =========================================
-- 4. CHAT SESSIONS
-- =========================================

CREATE TABLE chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INT,
    title VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- 5. MESSAGES
-- =========================================

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    session_id INT REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);