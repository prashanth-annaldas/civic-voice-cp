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
      <section className="hero-section text-center position-relative overflow-hidden">
        <div className="hero-bg-overlay"></div>
        <div className="container position-relative z-1">
          <h1 className="display-4 fw-bold mb-4">Your Voice for a Better City</h1>
          <p className="lead mb-5 px-md-5 mx-md-5">
            Report real civic issues like potholes, water leakage, and garbage
            with location & image. Our AI detects the issue and alerts
            authorities instantly.
          </p>
          <div className="d-flex justify-content-center gap-4 mt-4">
            <Link to="/requests" className="btn btn-premium px-5 py-3 rounded-pill fw-bold shadow-lg">
              Report an Issue <i className="bi bi-arrow-right ms-2"></i>
            </Link>
            <Link to="/admin" className="btn btn-outline-premium px-5 py-3 rounded-pill fw-bold backdrop-blur">
              View Issues
            </Link>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="row text-center g-4 justify-content-center">
            {/* TOTAL PROBLEMS */}
            <div className="col-md-4">
              <div className="stat-card p-4 rounded-4 shadow-sm border-0">
                <div className="stat-icon mb-3 text-primary">
                  <i className="bi bi-exclamation-triangle-fill fs-1"></i>
                </div>
                <h3 className="display-5 fw-bold text-dark mb-1">{issues.length}</h3>
                <p className="text-muted fw-medium text-uppercase tracking-wider mb-0">Problems Reported</p>
              </div>
            </div>

            {/* TOTAL REQUESTS */}
            <div className="col-md-4">
              <div className="stat-card p-4 rounded-4 shadow-sm border-0">
                <div className="stat-icon mb-3 text-info">
                  <i className="bi bi-card-checklist fs-1"></i>
                </div>
                <h3 className="display-5 fw-bold text-dark mb-1">
                  {issues.filter((issue) => issue.type === "Manual").length}
                </h3>
                <p className="text-muted fw-medium text-uppercase tracking-wider mb-0">Requests Submitted</p>
              </div>
            </div>

            {/* AI DETECTION */}
            <div className="col-md-4">
              <div className="stat-card p-4 rounded-4 shadow-sm border-0">
                <div className="stat-icon mb-3 text-success">
                  <i className="bi bi-robot fs-1"></i>
                </div>
                <h3 className="display-5 fw-bold text-dark mb-1">AI</h3>
                <p className="text-muted fw-medium text-uppercase tracking-wider mb-0">Gemini Powered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container my-5 py-5 text-center features-section">
        <h2 className="mb-5 section-title">How Civic Voice Works</h2>
        <div className="row g-4 mt-2">
          <div className="col-md-4">
            <div className="feature-card h-100 p-5 rounded-4 border border-light shadow-sm">
              <div className="feature-icon-wrapper mx-auto mb-4 bg-primary-soft text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-camera fs-2"></i>
              </div>
              <h4 className="fw-bold mb-3">Capture</h4>
              <p className="text-muted">Take a photo of the issue with location access directly from your smartphone.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card h-100 p-5 rounded-4 border border-light shadow-sm">
              <div className="feature-icon-wrapper mx-auto mb-4 bg-info-soft text-info rounded-circle d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-cpu fs-2"></i>
              </div>
              <h4 className="fw-bold mb-3">AI Detects</h4>
              <p className="text-muted">Our integrated Gemini AI actively identifies and categorizes the type of civic issue.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card h-100 p-5 rounded-4 border border-light shadow-sm">
              <div className="feature-icon-wrapper mx-auto mb-4 bg-success-soft text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-bell-fill fs-2"></i>
              </div>
              <h4 className="fw-bold mb-3">Notify</h4>
              <p className="text-muted">Local authorities receive automated email alerts instantly pinpointing the problem.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container my-5 pb-5 map-section">
        <h2 className="text-center mb-5 section-title">Live Civic Issues in Your City</h2>
        <div className="map-wrapper p-3 bg-white rounded-5 shadow-lg border border-light">
          {issues.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <i className="bi bi-geo-alt-fill fs-1 d-block mb-3"></i>
              <p className="lead">No issues reported yet in your area.</p>
            </div>
          ) : (
            <div className="rounded-4 overflow-hidden" style={{ height: '500px' }}>
              <IssuesMap issues={issues} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
