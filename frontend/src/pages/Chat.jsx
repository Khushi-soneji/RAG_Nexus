import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import "./Chat.css";


function Chat() {

    const navigate = useNavigate();
    const location = useLocation();

    const messagesEndRef = useRef(null);
    const homeQuestionHandled = useRef(false);


    // =========================================
    // LOGGED-IN STUDENT
    // =========================================

    const student = JSON.parse(
        localStorage.getItem("nexus_student") || "null"
    );

    const studentId = student?.id;
    console.log("Logged-in student:", student);
    console.log("Student ID:", studentId);

    const studentName = student?.name || "Student";


    const studentInitial = studentName
        .charAt(0)
        .toUpperCase();


    // =========================================
    // STATE
    // =========================================

    const [messages, setMessages] = useState([]);

    const [input, setInput] = useState("");

    const [loading, setLoading] = useState(false);

    const [chatHistory, setChatHistory] = useState([]);

    const [showHistory, setShowHistory] = useState(false);


    // =========================================
    // LOAD CHAT HISTORY
    // =========================================

    const loadChatHistory = async () => {
        try {
            if (!studentId) return;

            const response = await axios.get(
                `http://localhost:5000/api/chat/history/${studentId}`
            );

            setChatHistory(response.data.sessions || []);

        } catch (error) {
            console.error("Failed to load chat history:", error);
        }
    };
    useEffect(() => {
        loadChatHistory();
    }, [studentId]);
    // =========================================
    // SCROLL TO LATEST MESSAGE
    // =========================================

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages, loading]);


    // =========================================
    // NEW CHAT
    // =========================================

    const handleNewChat = async () => {

        try {

            if (!studentId) {
                return;
            }

            const response = await axios.post(
                "http://localhost:5000/api/chat/session",
                {
                    student_id: studentId
                }
            );

            const newSessionId =
                response.data.session.id;

            localStorage.setItem(
                "nexus_chat_session",
                newSessionId
            );

            setMessages([]);

            setInput("");

            setShowHistory(false);

            loadChatHistory();

        } catch (error) {

            console.error(
                "New chat error:",
                error
            );

        }

    };

    // =========================================
    // DELETE CHAT
    // =========================================

    const handleDeleteChat = async (sessionId) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this chat?"
        );

        if (!confirmed) {
            return;
        }

        try {

            await axios.delete(
                `http://localhost:5000/api/chat/sessions/${sessionId}`
            );

            const currentSession =
                localStorage.getItem("nexus_chat_session");

            if (String(currentSession) === String(sessionId)) {

                localStorage.removeItem(
                    "nexus_chat_session"
                );

                setMessages([]);

            }

            await loadChatHistory();

        } catch (error) {

            console.error(
                "Failed to delete chat:",
                error
            );

            alert(
                "Could not delete this chat. Please try again."
            );

        }
    };


    // =========================================
    // OPEN OLD CHAT
    // =========================================

    const handleOpenChat = async (sessionId) => {

        try {

            console.log("Opening chat session:", sessionId);

            const response = await axios.get(
                `http://localhost:5000/api/chat/sessions/${sessionId}/messages`
            );

            console.log(
                "Messages received:",
                response.data.messages
            );

            const oldMessages =
                response.data.messages || [];


            // Convert database messages
            // into the format used by Chat.jsx

            const formattedMessages =
                oldMessages.map((message, index) => {

                    return {
                        id: message.id || `${sessionId}-${index}`,

                        sender:
                            message.sender === "user"
                                ? "user"
                                : "nexus",

                        text:
                            message.message ||
                            message.content ||
                            message.text ||
                            ""
                    };

                });


            // Store currently opened session

            localStorage.setItem(
                "nexus_chat_session",
                String(sessionId)
            );


            // Display old messages

            setMessages(formattedMessages);


            // Clear input

            setInput("");


            // Close history sidebar

            setShowHistory(false);


        } catch (error) {

            console.error(
                "Failed to open old chat:",
                error
            );

        }

    };

    // =========================================
    // HANDLE QUESTION FROM HOME
    // =========================================

    useEffect(() => {

        const homeQuestion = location.state?.question;

        if (homeQuestion && !homeQuestionHandled.current) {

            homeQuestionHandled.current = true;

            sendQuestion(homeQuestion);

            window.history.replaceState(
                {},
                document.title
            );
        }

    }, []);


    // =========================================
    // SEND QUESTION
    // =========================================

    const sendQuestion = async (questionText) => {

        const cleanQuestion = questionText?.trim();

        if (!cleanQuestion) {
            return;
        }


        // Add user message

        const userMessage = {
            id: Date.now(),
            sender: "user",
            text: cleanQuestion
        };


        setMessages((previous) => [
            ...previous,
            userMessage
        ]);


        setInput("");

        setLoading(true);


        try {

            if (!studentId) {

                throw new Error(
                    "Student session not found."
                );

            }


            // Create chat session if needed

            let sessionId =
                localStorage.getItem(
                    "nexus_chat_session"
                );


            if (!sessionId) {

                const sessionResponse =
                    await axios.post(
                        "http://localhost:5000/api/chat/session",
                        {
                            student_id: studentId
                        }
                    );


                sessionId =
                    sessionResponse.data.session.id;


                localStorage.setItem(
                    "nexus_chat_session",
                    sessionId
                );

            }

            console.log("Chat request data:", {
                question: cleanQuestion,
                session_id: sessionId,
                student_id: studentId
            });

            // Ask

            const response = await axios.post(
                "http://localhost:5000/api/chat/ask",
                {
                    question: cleanQuestion,
                    session_id: Number(sessionId),
                    student_id: studentId
                }
            );


            const answer =
                response.data.answer ||
                "I couldn't find an answer to that.";


            // Add response

            const nexusMessage = {
                id: Date.now() + 1,
                sender: "nexus",
                text: answer
            };


            setMessages((previous) => [
                ...previous,
                nexusMessage
            ]);


        } catch (error) {

            console.error(
                "Chat error:",
                error
            );


            const errorMessage = {
                id: Date.now() + 1,
                sender: "nexus",
                text:
                    "Sorry, I couldn't process your question right now. Please make sure the backend is running."
            };


            setMessages((previous) => [
                ...previous,
                errorMessage
            ]);


        } finally {

            setLoading(false);

        }

    };


    // =========================================
    // FORM SUBMIT
    // =========================================

    const handleSubmit = (e) => {

        e.preventDefault();

        sendQuestion(input);

    };


    // =========================================
    // SUGGESTED QUESTIONS
    // =========================================

    const suggestions = [
        "What's my next lecture?",
        "Which labs are free?",
        "Where is Room 507?",
        "When does the semester start?"
    ];


    // =========================================
    // CLICK SUGGESTION
    // =========================================

    const handleSuggestion = (question) => {

        sendQuestion(question);

    };


    // =========================================
    // FORMAT MESSAGE
    // =========================================

    const renderMessage = (message) => {

        const text = message.text || "";


        // Detect source in AI answer

        const sourceMatch =
            text.match(
                /Source:\s*(.+)$/i
            );


        let mainText = text;

        let source = null;


        if (sourceMatch) {

            source = sourceMatch[1].trim();

            mainText = text
                .replace(
                    /Source:\s*(.+)$/i,
                    ""
                )
                .trim();

        }


        return (
            <div
                className={`chat-message-row ${message.sender}`}
                key={message.id}
            >

                {message.sender === "nexus" && (

                    <div className="message-avatar">
                        ✦
                    </div>

                )}


                <div className="chat-message-content">


                    {message.sender === "nexus" && (

                        <span className="message-name">
                            AI
                        </span>

                    )}


                    <div className="chat-bubble">

                        <p>
                            {mainText}
                        </p>


                        {source && (

                            <div className="message-source">

                                <span className="source-label">
                                    📄 Source
                                </span>

                                <strong className="source-name">
                                    {source}
                                </strong>

                            </div>

                        )}

                    </div>

                </div>


            </div>
        );

    };


    return (

        <div className="chat-page">


            {/* =====================================
                BACKGROUND DECORATIONS
            ===================================== */}

            <div className="chat-orb chat-orb-purple"></div>

            <div className="chat-orb chat-orb-blue"></div>

            <div className="chat-orb chat-orb-yellow"></div>



            {/* =====================================
                HEADER
            ===================================== */}

            <header className="chat-header">


                {/* LEFT */}

                <div className="chat-header-left">

                    <button
                        className="chat-back-button"
                        onClick={() => navigate("/")}
                        title="Back to Home"
                    >

                        <svg viewBox="0 0 24 24">

                            <path d="M15 18l-6-6 6-6" />

                        </svg>

                    </button>


                    <div className="chat-brand-icon">
                        ✦
                    </div>


                    <div className="chat-brand-text">

                        <strong>
                            AI
                        </strong>

                        <span>
                            Campus Assistant
                        </span>

                    </div>

                </div>

                {/* HISTORY */}

                <button
                    className="history-button"
                    onClick={() => setShowHistory(true)}
                >
                    <span>History</span>
                </button>


                {/* RIGHT PROFILE */}

                <button
                    className="chat-profile-button"
                    onClick={() => navigate("/profile")}
                >

                    <div className="chat-profile-info">

                        <strong>
                            {studentName}
                        </strong>

                        <span>
                            Student
                        </span>

                    </div>


                    <div className="chat-profile-avatar">

                        {studentInitial}

                    </div>

                </button>


            </header>



            {/* =====================================
                CHAT AREA
            ===================================== */}

            <main className="chat-main">


                {/* =================================
                    EMPTY STATE
                ================================= */}

                {messages.length === 0 && !loading && (

                    <section className="chat-empty-state">


                        <div className="chat-welcome-icon">
                            ✦
                        </div>


                        <span className="chat-welcome-label">
                            AI
                        </span>


                        <h1>
                            How can I help you today?
                        </h1>


                        <p>
                            Ask me about your timetable,
                            rooms, labs, academic dates
                            or college documents.
                        </p>


                        <div className="suggestion-grid">

                            {suggestions.map(
                                (suggestion, index) => (

                                    <button
                                        key={index}
                                        className="suggestion-card"
                                        onClick={() =>
                                            handleSuggestion(
                                                suggestion
                                            )
                                        }
                                    >

                                        <span>
                                            {suggestion}
                                        </span>

                                        <span className="suggestion-arrow">
                                            ↗
                                        </span>

                                    </button>

                                )
                            )}

                        </div>


                    </section>

                )}



                {/* =================================
                    MESSAGES
                ================================= */}

                {messages.length > 0 && (

                    <section className="messages-container">

                        {messages.map(
                            (message) =>
                                renderMessage(message)
                        )}


                        {/* Typing indicator */}

                        {loading && (

                            <div className="chat-message-row">

                                <div className="message-avatar">
                                    ✦
                                </div>


                                <div className="chat-message-content">

                                    <span className="message-name">
                                        
                                    </span>


                                    <div className="typing-bubble">

                                        <span></span>
                                        <span></span>
                                        <span></span>

                                    </div>

                                </div>

                            </div>

                        )}


                        <div
                            ref={messagesEndRef}
                        />

                    </section>

                )}


            </main>



            {/* =====================================
                INPUT AREA
            ===================================== */}

            <div className="chat-input-section">


                <form
                    className="chat-input-container"
                    onSubmit={handleSubmit}
                >


                    <div className="chat-input-symbol">
                        ✦
                    </div>


                    <input
                        type="text"
                        placeholder="Ask anything..."
                        value={input}
                        onChange={(e) =>
                            setInput(e.target.value)
                        }
                        disabled={loading}
                    />


                    <button
                        type="submit"
                        className="chat-send-button"
                        disabled={
                            !input.trim() ||
                            loading
                        }
                    >

                        <svg viewBox="0 0 24 24">

                            <path d="M4 4l16 8-16 8 3-8-3-8Z" />

                            <path d="M7 12h9" />

                        </svg>

                    </button>


                </form>


                <p className="chat-input-hint">

                    This uses your college knowledge base
                    to provide relevant answers.

                </p>


            </div>

            {/* =====================================
    CHAT HISTORY SIDEBAR
===================================== */}

            {showHistory && (
                <div
                    className="history-overlay"
                    onClick={() => setShowHistory(false)}
                >

                    <aside
                        className="history-sidebar"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="history-sidebar-header">

                            <div>
                                <span>YOUR CHATS</span>
                                <h2>Chat History</h2>
                            </div>

                            <button
                                className="history-close-button"
                                onClick={() => setShowHistory(false)}
                            >
                                ×
                            </button>

                        </div>


                        <button
                            className="new-chat-button"
                            onClick={handleNewChat}
                        >
                            <span>＋</span>
                            New Chat
                        </button>


                        <div className="history-list">

                            {chatHistory.length === 0 ? (

                                <div className="no-history">

                                    <div className="no-history-icon">
                                        ✦
                                    </div>

                                    <p>No previous chats yet.</p>

                                    <span>
                                        Start a conversation with anything.
                                    </span>

                                </div>

                            ) : (

                                chatHistory.map((chat) => (

                                    <div
                                        key={chat.id}
                                        className="history-item"
                                        onClick={() => handleOpenChat(chat.id)}
                                    >

                                        <div className="history-item-icon">
                                            ✦
                                        </div>

                                        <div className="history-item-content">

                                            <strong>
                                                {chat.title || "New Chat"}
                                            </strong>

                                            <span>
                                                {new Date(
                                                    chat.created_at
                                                ).toLocaleDateString()}
                                            </span>

                                        </div>

                                        <button
                                            className="history-delete-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteChat(chat.id);
                                            }}
                                            title="Delete chat"
                                        >
                                            🗑
                                        </button>

                                    </div>

                                ))

                            )}

                        </div>

                    </aside>

                </div>
            )}

            {/* =====================================
                MOBILE BOTTOM NAV
            ===================================== */}

            <nav className="chat-mobile-nav">


                <button
                    onClick={() => navigate("/")}
                >

                    <svg viewBox="0 0 24 24">

                        <path d="M3 10.5L12 3l9 7.5" />

                        <path d="M5 9.5V21h14V9.5" />

                    </svg>

                    <span>
                        Home
                    </span>

                </button>


                <button className="active">

                    <svg viewBox="0 0 24 24">

                        <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5c-1.4 0-2.7-.4-3.8-1L4 19l1.3-3.5A7.4 7.4 0 0 1 4.5 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" />

                    </svg>

                    <span>
                        Chat
                    </span>

                </button>


                <button
                    onClick={() =>
                        navigate("/profile")
                    }
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


export default Chat;