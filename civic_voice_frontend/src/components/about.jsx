import "./about.css";
import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

function About() {
  return (
    <div className="about-page position-relative overflow-hidden w-100 h-100">
      {/* Decorative Blob */}
      <div className="position-absolute top-0 start-0 translate-middle" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(13,110,253,0.3) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }}></div>
      <div className="position-absolute bottom-0 end-0 translate-middle" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(220,53,69,0.2) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 0 }}></div>

      <div className="container position-relative pb-5" style={{ zIndex: 1, paddingTop: '100px' }}>
        {/* HERO */}
        <div className="text-center mb-5 about-hero">
          <h1 className="fw-bolder display-4 mb-3" style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Transforming Civic Engagement
          </h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '800px', fontSize: '1.25rem' }}>
            Civic Voice bridges the gap between citizens and authorities. We empower people to report community issues effortlessly while leveraging advanced AI to streamline municipal action.
          </p>
        </div>

        {/* STATS OR HIGHLIGHTS */}
        <div className="row g-4 mb-5 justify-content-center">
          {[
            { icon: "bi-globe-americas", title: "Transparency", desc: "Open mapping of all civic reports ensures full visibility and accountability.", color: "text-primary" },
            { icon: "bi-robot", title: "AI-Powered", desc: "Our Gemini 2.5 Intelligence analyzes and categorizes images automatically.", color: "text-success" },
            { icon: "bi-geo-alt-fill", title: "Precision", desc: "GPS tagged submissions route problems exactly to where they belong.", color: "text-danger" }
          ].map((feature, idx) => (
            <div className="col-12 col-md-4" key={idx}>
              <div className="about-feature-card h-100 p-4 text-center rounded-4 shadow-sm">
                <div className={`display-3 mb-3 ${feature.color}`}>
                  <i className={`bi ${feature.icon}`}></i>
                </div>
                <h4 className="fw-bold mb-2">{feature.title}</h4>
                <p className="text-muted mb-0">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* MISSION SECTION */}
        <div className="row g-5 align-items-center mb-5 p-4 rounded-5 about-mission-section shadow-lg mx-0">
          <div className="col-lg-6">
            <h2 className="fw-bold mb-4" style={{ color: "var(--bs-primary)" }}>Our Mission</h2>
            <p className="text-dark fs-5" style={{ lineHeight: '1.8' }}>
              We envision cities where communities actively collaborate to improve their living environment. By replacing archaic reporting systems with an intelligent, centralized, and transparent platform, Civic Voice guarantees that every pothole, leak, and broken streetlight is not just heard—but resolved.
            </p>
            <ul className="list-unstyled mt-4">
              <li className="d-flex align-items-center mb-3">
                <i className="bi bi-check-circle-fill text-success fs-4 me-3"></i>
                <span className="fs-5 fw-medium">Real-time Heatmap Tracking</span>
              </li>
              <li className="d-flex align-items-center mb-3">
                <i className="bi bi-check-circle-fill text-success fs-4 me-3"></i>
                <span className="fs-5 fw-medium">Automated Department Routing</span>
              </li>
              <li className="d-flex align-items-center mb-3">
                <i className="bi bi-check-circle-fill text-success fs-4 me-3"></i>
                <span className="fs-5 fw-medium">Community Civic Trust Integration</span>
              </li>
            </ul>
          </div>
          <div className="col-lg-6 text-center">
            <div className="about-image-wrapper p-3 rounded-5 shadow-lg d-inline-block bg-white">
              <img
                src="https://www.bitsathy.ac.in/wp-content/uploads/ew-what-is-generative-ai-model-1.png"
                alt="Civic Voice Vision"
                className="img-fluid rounded-4"
                style={{ objectFit: 'cover', height: '400px', width: '100%' }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default About;
