import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SignUp.css";

function SignUp() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        course: "",
        semester: "",
        division: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        setError("");
        setSuccess("");
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.course ||
            !formData.semester ||
            !formData.division
        ) {
            setError("Please fill in all fields.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:5000/api/students/signup",
                {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    course: formData.course,
                    semester: Number(formData.semester),
                    division: formData.division
                }
            );

            if (response.data.success) {
                setSuccess("Account created successfully!");

                setTimeout(() => {
                    navigate("/login");
                }, 1200);
            }

        } catch (error) {
            console.error(error);

            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError(
                    "Unable to create account. Please try again."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">

            {/* Background decorative shapes */}
            <div className="signup-orb signup-orb-purple"></div>
            <div className="signup-orb signup-orb-yellow"></div>
            <div className="signup-orb signup-orb-small-purple"></div>
            <div className="signup-orb signup-orb-small-yellow"></div>


            {/* Signup Card */}
            <div className="signup-card">

                {/* Logo */}
                <div className="signup-logo">

                    <div className="signup-logo-icon">
                        ✦
                    </div>

                </div>


                {/* Heading */}
                <div className="signup-heading">

                    <h1>Create Account</h1>

                    <p>
                        Join and get personalized college assistance
                    </p>

                </div>


                {/* Signup Form */}
                <form
                    className="signup-form"
                    onSubmit={handleSignup}
                >

                    {/* Full Name */}
                    <div className="signup-field">

                        <label>Full Name</label>

                        <div className="signup-input-wrapper">

                            <span>◯</span>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                            />

                        </div>

                    </div>


                    {/* Email */}
                    <div className="signup-field">

                        <label>Email</label>

                        <div className="signup-input-wrapper">

                            <span>✉</span>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                            />

                        </div>

                    </div>


                    {/* Password */}
                    <div className="signup-field">

                        <label>Password</label>

                        <div className="signup-input-wrapper">

                            <span>◉</span>

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {showPassword ? "◉" : "◌"}
                            </button>

                        </div>

                    </div>


                    {/* Course */}
                    <div className="signup-field">

                        <label>Course</label>

                        <div className="signup-input-wrapper">

                            <span>▣</span>

                            <input
                                type="text"
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                placeholder="e.g. B.Tech Computer Science"
                            />

                        </div>

                    </div>


                    {/* Semester + Division */}
                    <div className="signup-row">

                        {/* Semester */}
                        <div className="signup-field">

                            <label>Semester</label>

                            <div className="signup-input-wrapper select-wrapper">

                                <span>▤</span>

                                <select
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option value="1">
                                        Semester 1
                                    </option>

                                    <option value="3">
                                        Semester 3
                                    </option>

                                    <option value="5">
                                        Semester 5
                                    </option>

                                    <option value="7">
                                        Semester 7
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* Division */}
                        <div className="signup-field">

                            <label>Division</label>

                            <div className="signup-input-wrapper select-wrapper">

                                <span>◇</span>

                                <select
                                    name="division"
                                    value={formData.division}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option value="A">
                                        Division A
                                    </option>

                                    <option value="B">
                                        Division B
                                    </option>

                                    <option value="C">
                                        Division C
                                    </option>

                                </select>

                            </div>

                        </div>

                    </div>


                    {/* Error */}
                    {error && (
                        <div className="signup-message error-message">
                            {error}
                        </div>
                    )}


                    {/* Success */}
                    {success && (
                        <div className="signup-message success-message">
                            {success}
                        </div>
                    )}


                    {/* Create Account Button */}
                    <button
                        type="submit"
                        className="signup-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Creating account..."
                            : "Create Account"}

                    </button>

                </form>


                {/* Login */}
                <div className="login-text">

                    <span>
                        Already have an account?
                    </span>

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </button>

                </div>

            </div>

        </div>
    );
}

export default SignUp;