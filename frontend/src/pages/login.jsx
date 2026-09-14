import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./login.css";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


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
        "http://localhost:5000/api/students/login",
        {
          email,
          password
        }
      );

      if (response.data.success) {

        /*
          Store the logged-in student.
          We will use this later for:
          - Home
          - Chat
          - Profile
          - Timetable
        */

        localStorage.setItem(
          "nexus_student",
          JSON.stringify(response.data.student)
        );


        /*
          Remember login preference
        */

        if (rememberMe) {

          localStorage.setItem(
            "nexus_remember",
            "true"
          );

        } else {

          localStorage.removeItem(
            "nexus_remember"
          );

        }


        navigate("/");

      }

    } catch (error) {

      console.error(error);

      if (error.response?.data?.message) {

        setError(
          error.response.data.message
        );

      } else {

        setError(
          "Unable to connect to interface."
        );

      }

    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="login-page">


      {/* =================================
          BACKGROUND DECORATIONS
      ================================= */}

      <div className="login-orb orb-purple"></div>

      <div className="login-orb orb-yellow"></div>

      <div className="login-orb orb-small-purple"></div>

      <div className="login-orb orb-small-yellow"></div>


      {/* =================================
          LOGIN CARD
      ================================= */}

      <div className="login-card">


        {/* subtle glass texture */}

        <div className="glass-noise"></div>


        {/* =================================
            CARD CONTENT
        ================================= */}

        <div className="login-content">


          {/* Logo */}

          <div className="login-logo">

            <div className="login-logo-icon">
              ✦
            </div>

            <span>
              
            </span>

          </div>


          {/* Heading */}

          <div className="login-heading">

            <h1>
              Login
            </h1>

            <p>
              Welcome back, please login to your account
            </p>

          </div>


          {/* =================================
              FORM
          ================================= */}

          <form onSubmit={handleLogin}>


            {/* Email */}

            <div className="login-field">

              <label>
                Email
              </label>

              <div className="login-input">

                <span className="input-icon">
                  ✉
                </span>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                />

              </div>

            </div>


            {/* Password */}

            <div className="login-field">

              <label>
                Password
              </label>

              <div className="login-input">

                <span className="input-icon">
                  ◉
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // NORMAL EYE
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    // SLASHED EYE
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 9 4 10 8-0.4 1.4-1.2 2.6-2.2 3.7" />
                      <path d="M6.6 6.6C4.8 7.8 3.5 9.6 2 12c1 4 5 8 10 8 1.5 0 2.9-.3 4.1-.9" />
                    </svg>
                  )}
                </button>

              </div>

            </div>


            {/* Remember + Forgot */}

            <div className="login-options">


              <label className="remember-option">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked
                    )
                  }
                />

                <span className="custom-checkbox">
                  ✓
                </span>

                <span>
                  Remember me
                </span>

              </label>


              <button
                type="button"
                className="forgot-button"
                onClick={() => {
                  alert(
                    "Password reset will be added later."
                  );
                }}
              >
                Forgot Password?
              </button>

            </div>


            {/* Error */}

            {error && (

              <div className="login-error">
                {error}
              </div>

            )}


            {/* Login button */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading
                ? "Logging in..."
                : "Login"
              }

            </button>


          </form>

          {/* =================================
    ADMIN LOGIN
================================= */}

          <div className="admin-login-option">

            <span>
              Are you an administrator?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/admin-login")
              }
            >
              Admin Login →
            </button>

          </div>


          {/* =================================
              SIGN UP
          ================================= */}

          <div className="signup-text">

            <span>
              Don't have an account?
            </span>

            <button
              onClick={() =>
                navigate("/signup")
              }
            >
              Sign up
            </button>

          </div>


        </div>

      </div>

    </div>

  );
}


export default Login;