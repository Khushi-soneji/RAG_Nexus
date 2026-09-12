import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import Chat from "./pages/Chat";

import "./App.css";


/* =========================================
   HOME PAGE
========================================= */

function Home() {

  const navigate = useNavigate();

  return (
    <div className="app">

      {/* TOP BAR */}

      <header className="topbar">

        <div className="logo">
          ✦ Nexus
        </div>

        <div className="top-actions">

          <button>
            🔔
          </button>

          <button
            onClick={() => navigate("/profile")}
          >
            👤
          </button>

        </div>

      </header>


      {/* DASHBOARD */}

      <main className="dashboard">

        <section className="welcome">

          <p className="small-text">
            WELCOME BACK 👋
          </p>

          <h1>
            Your campus,
            <br />
            one conversation away.
          </h1>

          <p className="subtitle">
            Ask Nexus about your classes, rooms, labs and college information.
          </p>

        </section>


        {/* ASK NEXUS */}

        <section className="search-box">

          <div className="ai-label">

            <span className="status-dot"></span>

            Nexus AI is ready

          </div>


          <div className="search-input-wrapper">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Ask Nexus anything about your campus..."
              onFocus={() => navigate("/chat")}
            />

            <button
              className="ask-button"
              onClick={() => navigate("/chat")}
            >
              →
            </button>

          </div>

        </section>


        {/* QUICK ACCESS */}

        <section>

          <h2>
            Quick Access
          </h2>


          <div className="quick-grid">


            <div
              className="quick-card"
              onClick={() => navigate("/chat")}
            >

              <div className="icon">
                💬
              </div>

              <h3>
                AI Chat
              </h3>

              <p>
                Ask anything
              </p>

            </div>


            <div
              className="quick-card"
              onClick={() => navigate("/chat")}
            >

              <div className="icon">
                📅
              </div>

              <h3>
                Timetable
              </h3>

              <p>
                View your classes
              </p>

            </div>


            <div
              className="quick-card"
              onClick={() => navigate("/chat")}
            >

              <div className="icon">
                📍
              </div>

              <h3>
                Room Finder
              </h3>

              <p>
                Find classrooms
              </p>

            </div>


            <div
              className="quick-card"
              onClick={() => navigate("/chat")}
            >

              <div className="icon">
                🧪
              </div>

              <h3>
                Free Labs
              </h3>

              <p>
                Check availability
              </p>

            </div>


          </div>

        </section>


        {/* RECENT CONVERSATIONS */}

        <section className="recent">

          <div className="section-heading">

            <h2>
              Recent Conversations
            </h2>

            <span>
              View all →
            </span>

          </div>


          <div
            className="recent-item"
            onClick={() => navigate("/chat")}
          >

            <span>
              🕐
            </span>

            <div>

              <strong>
                Semester Timetable
              </strong>

              <p>
                When is my next class?
              </p>

            </div>

          </div>


          <div
            className="recent-item"
            onClick={() => navigate("/chat")}
          >

            <span>
              📚
            </span>

            <div>

              <strong>
                Academic Calendar
              </strong>

              <p>
                When does the semester start?
              </p>

            </div>

          </div>

        </section>

      </main>


      {/* BOTTOM NAV */}

      <nav className="bottom-nav">

        <div className="active">

          <span>
            ⌂
          </span>

          Home

        </div>


        <div
          onClick={() => navigate("/chat")}
        >

          <span>
            💬
          </span>

          Chat

        </div>


        <div
          onClick={() => navigate("/chat")}
        >

          <span>
            📅
          </span>

          Schedule

        </div>


        <div
          onClick={() => navigate("/profile")}
        >

          <span>
            👤
          </span>

          Profile

        </div>

      </nav>

    </div>
  );
}


/* =========================================
   APP ROUTES
========================================= */

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

      </Routes>

    </BrowserRouter>

  );
}


export default App;