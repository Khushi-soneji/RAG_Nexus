import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./Chat.css";

function Chat() {

    const navigate = useNavigate();

    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);

    // Automatically scroll to the latest message
    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages, loading]);


    // Send question to Nexus
    const sendQuestion = async (text = question) => {

        if (!text.trim() || loading) {
            return;
        }

        const userQuestion = text.trim();

        // Add user message
        setMessages((previousMessages) => [
            ...previousMessages,
            {
                sender: "user",
                message: userQuestion
            }
        ]);

        setQuestion("");
        setLoading(true);

        try {

            const response = await axios.post(
                "http://localhost:5000/api/chat/ask",
                {
                    question: userQuestion,

                    // Temporary test values
                    // These will later come from login
                    session_id: 1,
                    student_id: 2
                }
            );

            // Add Nexus response
            setMessages((previousMessages) => [
                ...previousMessages,
                {
                    sender: "assistant",
                    message: response.data.answer
                }
            ]);

        } catch (error) {

            console.error(error);

            setMessages((previousMessages) => [
                ...previousMessages,
                {
                    sender: "assistant",
                    message:
                        "Sorry, I couldn't connect to Nexus right now."
                }
            ]);

        } finally {

            setLoading(false);

        }
    };


    // Quick suggestion
    const askQuickQuestion = (text) => {

        if (loading) {
            return;
        }

        sendQuestion(text);

    };


    // Enter key
    const handleKeyDown = (event) => {

        if (event.key === "Enter") {
            sendQuestion();
        }

    };


    // Start new chat
    const startNewChat = () => {

        setMessages([]);
        setQuestion("");

    };


    return (

        <div className="chat-page">

            {/* ================= HEADER ================= */}

            <header className="chat-header">

                <div
                    className="nexus-brand"
                    onClick={() => navigate("/")}
                >

                    <div className="brand-icon">
                        ✦
                    </div>

                    <span>Nexus</span>

                </div>


                <div className="chat-status">

                    <strong>Nexus</strong>

                    <span>
                        · Ready to help
                    </span>

                </div>


                <button
                    className="new-chat-button"
                    onClick={startNewChat}
                    title="New chat"
                >
                    +
                </button>

            </header>


            {/* ================= MAIN ================= */}

            <main className="chat-main">

                {/* EMPTY CHAT */}

                {messages.length === 0 && (

                    <div className="chat-empty">

                        <div className="hero-ai-icon">
                            ✦
                        </div>

                        <h1>
                            Hi, I'm Nexus
                        </h1>

                        <p>
                            Ask me about your classes, rooms, labs,
                            academic calendar
                            <br className="desktop-break" />
                            or college information.
                        </p>


                        {/* ================= SUGGESTIONS ================= */}

                        <div className="suggestion-grid">

                            <button
                                className="suggestion-card"
                                onClick={() =>
                                    askQuickQuestion("What's my next lecture?")
                                }
                            >

                                <div className="suggestion-icon purple">
                                    📅
                                </div>

                                <div>
                                    <strong>
                                        What's my next lecture?
                                    </strong>

                                    <span>
                                        Check your upcoming class
                                    </span>
                                </div>

                            </button>


                            <button
                                className="suggestion-card"
                                onClick={() =>
                                    askQuickQuestion("Where is room 507?")
                                }
                            >

                                <div className="suggestion-icon pink">
                                    📍
                                </div>

                                <div>
                                    <strong>
                                        Where is room 507?
                                    </strong>

                                    <span>
                                        Find a classroom or lab
                                    </span>
                                </div>

                            </button>


                            <button
                                className="suggestion-card"
                                onClick={() =>
                                    askQuickQuestion(
                                        "Which labs are free at 14:15 on Tuesday?"
                                    )
                                }
                            >

                                <div className="suggestion-icon green">
                                    🧪
                                </div>

                                <div>
                                    <strong>
                                        Which labs are free?
                                    </strong>

                                    <span>
                                        Check lab availability
                                    </span>
                                </div>

                            </button>


                            <button
                                className="suggestion-card"
                                onClick={() =>
                                    askQuickQuestion(
                                        "When does the semester start?"
                                    )
                                }
                            >

                                <div className="suggestion-icon blue">
                                    📚
                                </div>

                                <div>
                                    <strong>
                                        When does the semester start?
                                    </strong>

                                    <span>
                                        Ask about academic information
                                    </span>
                                </div>

                            </button>

                        </div>

                    </div>

                )}


                {/* ================= MESSAGES ================= */}

                {messages.length > 0 && (

                    <div className="messages">

                        {messages.map((item, index) => (

                            <div
                                key={index}
                                className={`message-row ${item.sender}`}
                            >

                                {item.sender === "assistant" && (

                                    <div className="assistant-avatar">
                                        ✦
                                    </div>

                                )}

                                <div className="message-content">

                                    <div className="message-bubble">
                                        {item.message}
                                    </div>

                                </div>

                            </div>

                        ))}


                        {/* Typing indicator */}

                        {loading && (

                            <div className="message-row assistant">

                                <div className="assistant-avatar">
                                    ✦
                                </div>

                                <div className="message-bubble typing">

                                    <span></span>
                                    <span></span>
                                    <span></span>

                                </div>

                            </div>

                        )}


                        <div ref={messagesEndRef}></div>

                    </div>

                )}

            </main>


            {/* ================= INPUT ================= */}

            <div className="chat-input-area">

                <div className="chat-input">

                    <span className="input-sparkle">
                        ✦
                    </span>

                    <input
                        type="text"
                        value={question}
                        onChange={(event) =>
                            setQuestion(event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Nexus anything..."
                        disabled={loading}
                    />

                    <button
                        onClick={() => sendQuestion()}
                        disabled={
                            loading ||
                            !question.trim()
                        }
                    >
                        →
                    </button>

                </div>

            </div>


            {/* ================= NAVIGATION ================= */}

            <nav className="bottom-nav">

                <div
                    onClick={() => navigate("/")}
                >

                    <span>⌂</span>

                    <small>
                        Home
                    </small>

                </div>


                <div className="active">

                    <span>●</span>

                    <small>
                        Chat
                    </small>

                </div>


                <div
                    onClick={() => navigate("/chat")}
                >

                    <span>▣</span>

                    <small>
                        Schedule
                    </small>

                </div>


                <div
                    onClick={() => navigate("/profile")}
                >

                    <span>◉</span>

                    <small>
                        Profile
                    </small>

                </div>

            </nav>

        </div>

    );
}

export default Chat;