import "./about.css";

function About() {
  return (
    <div className="about-page">
      {/* HERO */}
      <section className="about-hero">
        <div className="container text-center">
          <h1>About Civic Voice</h1>
          <p>
            Empowering citizens to report real-world civic issues and
            build smarter, more responsive cities.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="container about-content">
        <div className="row justify-content-center">
          <div className="col-md-10 about-card">

            <h2>🌍 Our Mission</h2>
            <p>
              Civic Voice is a citizen-centric platform designed to bridge
              the gap between people and municipal authorities.  
              We enable citizens to report everyday civic issues such as
              potholes, water leakage, garbage overflow, and streetlight
              failures with precise location data.
            </p>

            <h2>🤖 AI-Powered Detection</h2>
            <p>
              Using <strong>Gemini AI</strong>, Civic Voice automatically
              analyzes uploaded images to identify the type of civic issue.
              This reduces manual effort and speeds up issue classification.
            </p>

            <h2>📍 Location-Based Reporting</h2>
            <p>
              Every issue is tagged with GPS coordinates, ensuring accurate
              mapping and transparency. Authorities can view issues directly
              on an interactive map and prioritize action.
            </p>

            <h2>🏛️ Why Civic Voice?</h2>
            <ul>
              <li>✔ Transparent civic issue reporting</li>
              <li>✔ AI-assisted problem identification</li>
              <li>✔ Real-time map visualization</li>
              <li>✔ Email notifications to authorities</li>
              <li>✔ Community-driven urban improvement</li>
            </ul>

          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
