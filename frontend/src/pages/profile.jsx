import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./profile.css";

function Profile() {
    const navigate = useNavigate();

    const [student, setStudent] = useState(
        JSON.parse(
            localStorage.getItem("nexus_student") || "null"
        )
    );

    // const [notifications, setNotifications] = useState(
    //     localStorage.getItem("nexus_notifications") !== "off"
    // );

    const [chatHistory, setChatHistory] = useState(
        localStorage.getItem("nexus_chat_history") !== "off"
    );

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!student?.id) {
                    return;
                }

                const response = await axios.get(
                    `http://localhost:5000/api/students/${student.id}`
                );

                if (response.data.success) {
                    setStudent(response.data.student);

                    localStorage.setItem(
                        "nexus_student",
                        JSON.stringify(response.data.student)
                    );
                }
            } catch (error) {
                console.error(
                    "Unable to fetch profile:",
                    error
                );
            }
        };

        fetchProfile();
    }, []);

    const studentName = student?.name || "Student";

    const studentInitial = studentName
        .charAt(0)
        .toUpperCase();

    // const handleNotifications = () => {
    //     const newValue = !notifications;

    //     setNotifications(newValue);

    //     localStorage.setItem(
    //         "nexus_notifications",
    //         newValue ? "on" : "off"
    //     );
    // };

    const handleChatHistory = () => {
        const newValue = !chatHistory;

        setChatHistory(newValue);

        localStorage.setItem(
            "nexus_chat_history",
            newValue ? "on" : "off"
        );
    };

    const handleLogout = () => {
        localStorage.removeItem("nexus_student");
        localStorage.removeItem("nexus_chat_session");

        navigate("/login");
    };

    return (
        <div className="profile-page">

            {/* Background decorations */}
            <div className="profile-orb profile-orb-purple"></div>
            <div className="profile-orb profile-orb-blue"></div>
            <div className="profile-orb profile-orb-yellow"></div>

            {/* Header */}
            <header className="profile-header">

                <div className="profile-header-left">

                    <button
                        className="profile-back-button"
                        onClick={() => navigate("/")}
                        title="Back to Home"
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>

                    <div className="profile-header-title">
                        <strong>Profile</strong>
                        <span>Student account</span>
                    </div>

                </div>

                <div className="profile-header-logo">
                    <div className="profile-logo-icon">
                        ✦
                    </div>

                </div>

            </header>

            <main className="profile-main">

                {/* Student Identity */}
                <section className="profile-identity">

                    <div className="profile-avatar-large">
                        {studentInitial}
                    </div>

                    <div className="profile-identity-text">

                        <span className="profile-label">
                            STUDENT PROFILE
                        </span>

                        <h1>
                            {studentName}
                        </h1>

                        <p>
                            {student?.course ||
                                "B.Tech Computer Science and Engineering"}
                        </p>

                        <div className="profile-status">
                            <span className="status-dot"></span>
                            <span>Active Student</span>
                        </div>

                    </div>

                </section>

                {/* Personalization Card */}
                <section className="profile-card">

                    <div className="profile-card-left">

                        <div className="profile-icon">
                            ✦
                        </div>

                        <div>
                            <span>
                                YOUR PROFILE
                            </span>

                            <h2>
                                Personalized for you
                            </h2>

                            <p>
                                This uses your academic details
                                to give you more relevant timetable
                                and campus answers.
                            </p>
                        </div>

                    </div>

                    <div className="profile-details">

                        <div className="profile-detail-pill">
                            <span>SEMESTER</span>
                            <strong>
                                {student?.semester || "—"}
                            </strong>
                        </div>

                        <div className="profile-detail-pill">
                            <span>DIVISION</span>
                            <strong>
                                {student?.division || "—"}
                            </strong>
                        </div>

                    </div>

                </section>

                {/* Academic Information */}
                <section className="profile-section">

                    <div className="profile-section-heading">
                        <div>
                            <h2>
                                Academic Information
                            </h2>

                            <p>
                                Your current academic details
                            </p>
                        </div>
                    </div>

                    <div className="academic-grid">

                        <div className="academic-item academic-item-wide">

                            <span>COURSE</span>

                            <strong>
                                {student?.course ||
                                    "B.Tech Computer Science and Engineering"}
                            </strong>

                        </div>

                        <div className="academic-item">

                            <span>SEMESTER</span>

                            <strong>
                                {student?.semester || "—"}
                            </strong>

                        </div>

                        <div className="academic-item">

                            <span>DIVISION</span>

                            <strong>
                                {student?.division || "—"}
                            </strong>

                        </div>

                        <div className="academic-item">

                            <span>STUDENT ID</span>

                            <strong>
                                {student?.id || "—"}
                            </strong>

                        </div>

                    </div>

                </section>

                {/* Account */}
                <section className="profile-section">

                    <div className="profile-section-heading">

                        <div>
                            <h2>Account</h2>

                            <p>
                                Your account information
                            </p>
                        </div>

                    </div>

                    <div className="account-card">

                        <div className="account-icon">
                            ✉
                        </div>

                        <div className="account-content">

                            <span>
                                EMAIL ADDRESS
                            </span>

                            <strong>
                                {student?.email ||
                                    "No email available"}
                            </strong>

                        </div>

                        <div className="account-badge">
                            Account
                        </div>

                    </div>

                </section>

                {/* Preferences */}
                <section className="profile-section">

                    <div className="profile-section-heading">

                        <div>
                            <h2>Preferences</h2>

                            <p>
                                Customize your experience
                            </p>
                        </div>

                    </div>

                    <div className="preferences-card">

                        {/* Notifications
                        <div className="preference-item">

                            <div className="preference-left">

                                <div className="preference-icon purple">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                                        <path d="M10 21h4" />
                                    </svg>
                                </div>

                                <div className="preference-text">

                                    <strong>
                                        Notifications
                                    </strong>

                                    <span>
                                        Receive updates and reminders
                                    </span>

                                </div>

                            </div>

                            <button
                                className={`toggle ${
                                    notifications
                                        ? "active"
                                        : ""
                                }`}
                                onClick={
                                    handleNotifications
                                }
                                aria-label="Toggle notifications"
                            >
                                <span></span>
                            </button>

                        </div> */}

                        {/* Chat History */}
                        <div className="preference-item">

                            <div className="preference-left">

                                <div className="preference-icon blue">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5c-1.4 0-2.7-.4-3.8-1L4 19l1.3-3.5A7.4 7.4 0 0 1 4.5 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" />
                                    </svg>
                                </div>

                                <div className="preference-text">

                                    <strong>
                                        Chat History
                                    </strong>

                                    <span>
                                        Save your conversations
                                    </span>

                                </div>

                            </div>

                            <button
                                className={`toggle ${
                                    chatHistory
                                        ? "active"
                                        : ""
                                }`}
                                onClick={
                                    handleChatHistory
                                }
                                aria-label="Toggle chat history"
                            >
                                <span></span>
                            </button>

                        </div>

                    </div>

                </section>

                {/* Logout */}
                <section className="logout-section">

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
                            <path d="M14 8l4 4-4 4" />
                            <path d="M9 12h9" />
                        </svg>

                        <span>Log Out</span>
                    </button>

                </section>

            </main>

            {/* Mobile Navigation */}
            <nav className="profile-mobile-nav">

                <button
                    onClick={() => navigate("/")}
                >
                    <svg viewBox="0 0 24 24">
                        <path d="M3 10.5L12 3l9 7.5" />
                        <path d="M5 9.5V21h14V9.5" />
                    </svg>

                    <span>Home</span>
                </button>

                <button
                    onClick={() => navigate("/chat")}
                >
                    <svg viewBox="0 0 24 24">
                        <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5c-1.4 0-2.7-.4-3.8-1L4 19l1.3-3.5A7.4 7.4 0 0 1 4.5 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" />
                    </svg>

                    <span>Chat</span>
                </button>

                <button className="active">
                    <svg viewBox="0 0 24 24">
                        <circle
                            cx="12"
                            cy="8"
                            r="3.5"
                        />

                        <path d="M5 20c.8-3.3 3.1-5 7-5s6.2 1.7 7 5" />
                    </svg>

                    <span>Profile</span>
                </button>

            </nav>

        </div>
    );
}

export default Profile;