import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import IssuesMap from "./issueMap";
import "./home.css";

function Home() {
  const [issues, setIssues] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_BASE}/issues`)
      .then((res) => res.json())
      .then((data) => setIssues(data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <section className="hero-section text-center">
        <h1>Your Voice for a Better City</h1>
        <p>
          Report real civic issues like potholes, water leakage, and garbage
          with location & image. Our AI detects the issue and alerts
          authorities.
        </p>
        <div className="d-flex justify-content-center gap-3 mt-3">
          <Link to="/requests" className="btn btn-primary">
            Report an Issue
          </Link>
          <Link to="/admin" className="btn btn-outline-light">
            View Issues
          </Link>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="row text-center">
            {/* TOTAL PROBLEMS */}
            <div className="col-md-4">
              <h3>{issues.length}</h3>
              <p>Problems Reported</p>
            </div>

            {/* TOTAL REQUESTS */}
            <div className="col-md-4">
              <h3>
                {issues.filter((issue) => issue.type === "Manual").length}
              </h3>
              <p>Requests Submitted</p>
            </div>

            {/* AI DETECTION */}
            <div className="col-md-4">
              <h3>AI</h3>
              <p>Gemini Detection</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container my-5 text-center">
        <h2>How Civic Voice Works</h2>
        <div className="row mt-4">
          <div className="col-md-4">
            <h4>📸 Capture</h4>
            <p>Take a photo of the issue with location access.</p>
          </div>
          <div className="col-md-4">
            <h4>🤖 AI Detects</h4>
            <p>Gemini AI identifies the type of civic issue.</p>
          </div>
          <div className="col-md-4">
            <h4>🏛️ Notify</h4>
            <p>Authorities receive email alerts instantly.</p>
          </div>
        </div>
      </section>

      <section className="container my-5">
        <h2 className="text-center mb-3">Live Civic Issues in Your City</h2>
        {issues.length === 0 ? (
          <p className="text-center text-muted">No issues reported yet.</p>
        ) : (
          <IssuesMap issues={issues} />
        )}
      </section>
    </div>
  );
}

export default Home;
