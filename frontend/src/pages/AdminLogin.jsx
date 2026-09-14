import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./AdminLogin.css";

function AdminLogin() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {

        event.preventDefault();

        setError("");

        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);

        try {

            const response = await axios.post(
                "http://localhost:5000/api/admin/login",
                {
                    email,
                    password
                }
            );

            if (response.data.success) {

                localStorage.setItem(
                    "nexus_admin",
                    JSON.stringify(response.data.admin)
                );

                navigate("/admin");
            }

        } catch (error) {

            console.error("Admin login error:", error);

            setError(
                error.response?.data?.message ||
                "Invalid admin credentials."
            );

        } finally {

            setLoading(false);

        }
    };

    return (

        <div className="admin-login-page">

            <div className="admin-login-card">

                <div className="admin-login-icon">
                    ✦
                </div>

                <span className="admin-login-label">
                    ADMIN
                </span>

                <h1>
                    Welcome back
                </h1>

                <p>
                    Sign in to manage the knowledge base.
                </p>

                <form onSubmit={handleLogin}>

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        placeholder="admin@gmail.com"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />

                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />

                    {error && (
                        <div className="admin-login-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign in as Admin"}
                    </button>

                </form>

                <button
                    className="admin-login-back"
                    onClick={() => navigate("/")}
                >
                    ← Back 
                </button>

            </div>

        </div>

    );
}

export default AdminLogin;