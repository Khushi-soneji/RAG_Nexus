import { useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useNavigate
} from "react-router-dom";

import Chat from "./pages/Chat";
import Login from "./pages/login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/profile";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";


import "./App.css";


function Home() {

    const navigate = useNavigate();

    const [question, setQuestion] = useState("");


    // Get logged-in student
    const student = JSON.parse(
        localStorage.getItem("nexus_student") || "null"
    );

    const studentName = student?.name || "Student";


    // Quick questions
    const quickQuestions = [
        {
            icon: "◷",
            title: "What's my next lecture?",
            description: "Check your upcoming class",
            style: "purple"
        },
        {
            icon: "⌘",
            title: "Which labs are free?",
            description: "Find available labs",
            style: "blue"
        },
        {
            icon: "⌖",
            title: "Where is Room 507?",
            description: "Find a classroom or lab",
            style: "pink"
        },
        {
            icon: "▣",
            title: "When does the semester start?",
            description: "Check academic dates",
            style: "yellow"
        }
    ];


    // Open Chat from quick question
    const handleQuickQuestion = (questionText) => {

        navigate("/chat", {
            state: {
                question: questionText
            }
        });

    };


    // Open Chat from input
    const handleAsk = (e) => {

        e.preventDefault();

        if (!question.trim()) {

            navigate("/chat");

            return;
        }

        navigate("/chat", {
            state: {
                question: question.trim()
            }
        });

    };


    return (

        <div className="home-page">


            {/* =================================
                BACKGROUND DECORATIONS
            ================================= */}

            <div className="home-orb home-orb-purple"></div>

            <div className="home-orb home-orb-blue"></div>

            <div className="home-orb home-orb-yellow"></div>

            <div className="home-orb home-orb-pink"></div>



            {/* =================================
                TOP HEADER
            ================================= */}

            <header className="home-header">


                {/* Logo */}

                <div className="home-logo">

                    <div className="home-logo-icon">
                        ✦
                    </div>

                </div>



                {/* Right Side */}

                <div className="home-header-right">


                    {/* Notification */}

                    <button
                        className="notification-button"
                        title="Notifications"
                    >

                        <svg viewBox="0 0 24 24">

                            <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />

                            <path d="M10 21h4" />

                        </svg>

                    </button>



                    {/* Profile */}

                    <button
                        className="home-profile-button"
                        onClick={() => navigate("/profile")}
                    >

                        <div className="home-avatar">

                            {studentName
                                .charAt(0)
                                .toUpperCase()}

                        </div>


                        <div className="home-profile-text">

                            <strong>
                                {studentName}
                            </strong>

                            <span>
                                Student
                            </span>

                        </div>

                    </button>

                </div>

            </header>



            {/* =================================
                MAIN CONTENT
            ================================= */}

            <main className="home-main">


                {/* =================================
                    WELCOME
                ================================= */}

                <section className="home-welcome">


                    <span className="home-eyebrow">
                        YOUR CAMPUS ASSISTANT
                    </span>


                    <h1>

                        Good morning, {studentName}

                        <span className="welcome-wave">
                            👋
                        </span>

                    </h1>


                    <p>
                        What can I help you with?
                    </p>


                </section>



                {/* =================================
                    AI INTRO CARD
                ================================= */}

                <section className="ai-card">


                    <div className="ai-card-left">


                        <div className="ai-icon">
                            ✦
                        </div>


                        <div>

                            <h2>
                                Ask anything
                            </h2>


                            <p>
                                Your AI assistant for college information,
                                timetables, rooms, labs and academic dates.
                            </p>

                        </div>


                    </div>


                    <div className="ai-decoration">

                        <span>✦</span>

                        <span>✧</span>

                        <span>✦</span>

                    </div>


                </section>



                {/* =================================
                    QUICK QUESTIONS
                ================================= */}

                <section className="quick-section">


                    <div className="quick-heading">

                        <h2>
                            Quick questions
                        </h2>

                        <p>
                            Start with something students ask often
                        </p>

                    </div>



                    <div className="quick-grid">


                        {quickQuestions.map(
                            (item, index) => (

                                <button
                                    key={index}
                                    className={`quick-card ${item.style}`}
                                    onClick={() =>
                                        handleQuickQuestion(
                                            item.title
                                        )
                                    }
                                >


                                    <div className="quick-card-top">


                                        <div className="quick-icon">
                                            {item.icon}
                                        </div>


                                        <span className="quick-arrow">
                                            ↗
                                        </span>


                                    </div>



                                    <div className="quick-card-text">

                                        <h3>
                                            {item.title}
                                        </h3>

                                        <p>
                                            {item.description}
                                        </p>

                                    </div>


                                </button>

                            )
                        )}

                    </div>


                </section>



                {/* =================================
                    ASK INPUT
                ================================= */}

                <section className="ask-section">


                    <form
                        className="ask-container"
                        onSubmit={handleAsk}
                    >


                        <div className="ask-symbol">
                            ✦
                        </div>


                        <input
                            type="text"
                            placeholder="Ask anything..."
                            value={question}
                            onChange={(e) =>
                                setQuestion(e.target.value)
                            }
                        />


                        <button
                            type="submit"
                            className="ask-button"
                        >

                            <svg viewBox="0 0 24 24">

                                <path d="M4 4l16 8-16 8 3-8-3-8Z" />

                                <path d="M7 12h9" />

                            </svg>

                        </button>


                    </form>


                    <p className="ask-hint">
                        Ask about your timetable, rooms, labs or college documents
                    </p>


                </section>



                {/* =================================
                    ACADEMIC PROFILE STRIP
                ================================= */}

                <section className="student-strip">


                    <div className="student-strip-icon">
                        ◇
                    </div>


                    <div className="student-strip-content">


                        <span>
                            YOUR ACADEMIC PROFILE
                        </span>


                        <strong>

                            {student?.course ||
                                "B.Tech Computer Science and Engineering"}

                        </strong>


                        <p>

                            Semester {student?.semester || "—"}

                            {" · "}

                            Division {student?.division || "—"}

                        </p>


                    </div>


                    <button
                        onClick={() =>
                            navigate("/profile")
                        }
                    >
                        View profile →
                    </button>


                </section>


            </main>



            {/* =================================
                MOBILE NAVIGATION
            ================================= */}

            <nav className="mobile-nav">


                <button
                    className="mobile-nav-item active"
                >

                    <svg viewBox="0 0 24 24">

                        <path d="M3 10.5L12 3l9 7.5" />

                        <path d="M5 9.5V21h14V9.5" />

                    </svg>

                    <span>
                        Home
                    </span>

                </button>



                <button
                    className="mobile-nav-item"
                    onClick={() => navigate("/chat")}
                >

                    <svg viewBox="0 0 24 24">

                        <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5c-1.4 0-2.7-.4-3.8-1L4 19l1.3-3.5A7.4 7.4 0 0 1 4.5 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" />

                    </svg>

                    <span>
                        Chat
                    </span>

                </button>



                <button
                    className="mobile-nav-item"
                    onClick={() => navigate("/profile")}
                >

                    <svg viewBox="0 0 24 24">

                        <circle
                            cx="12"
                            cy="8"
                            r="3.5"
                        />

                        <path d="M5 20c.8-3.3 3.1-5 7-5s6.2 1.7 7 5" />

                    </svg>

                    <span>
                        Profile
                    </span>

                </button>


            </nav>


        </div>

    );

}



function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/chat"
                    element={<Chat />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/signup"
                    element={<SignUp />}
                />

                <Route
                    path="/profile"
                    element={<Profile />}
                />

                <Route
                    path="/admin"
                    element={
                        <AdminProtectedRoute>
                            <Admin />
                        </AdminProtectedRoute>
                    }
                />

                <Route
                    path="/admin-login"
                    element={<AdminLogin />}
                />

            </Routes>

        </BrowserRouter>

    );

}

function AdminProtectedRoute({ children }) {

    const admin = localStorage.getItem("nexus_admin");

    if (!admin) {
        return <Navigate to="/admin-login" replace />;
    }

    return children;
}

export default App;