import { useState } from "react";
import Location from "./geoLocation";
import emailjs from "@emailjs/browser";
import "./requests.css";

function Requests() {
  const [text, setText] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL;

  const handleSubmit = async () => {
    if (!text) {
      alert("Please describe the problem");
      return;
    }

    if (lat === null || lng === null) {
      alert("Please allow location access");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/requests`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          description: text,
          latitude: lat,
          longitude: lng,
        }),
      });

      if (!res.ok) {
        let errStr = "Unknown error";
        try {
          const errData = await res.json();
          errStr = errData.detail || errData.error || res.statusText;
        } catch (e) {
          errStr = res.statusText;
        }
        alert("Python Backend Error: " + JSON.stringify(errStr));
        throw new Error("Backend Error");
      }

      const userEmail = localStorage.getItem("email") || "User";

      try {
        const response = await emailjs.send(
          "service_x4znowc",
          "template_i1oasoa",
          {
            name: userEmail.split("@")[0], // use the part before @ as name
            email: userEmail,
            time: new Date().toLocaleString(),
            message: `Location: Lat ${lat}, Lng ${lng}\n\nDetails: ${text}`,
          },
          "GkY_gPSCuhaAoGfEg"
        );
        console.log("EmailJS Success:", response.status, response.text);
        setResult("Request submitted and email sent successfully!");
      } catch (err) {
        console.error("EmailJS Error:", err);
        setResult("Request submitted, but email failed: " + (err.text || err.message || JSON.stringify(err)));
      }

      setText("");
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="requests-page min-vh-100 d-flex flex-column" style={{ paddingTop: '80px' }}>
      <div className="container py-5 d-flex justify-content-center flex-grow-1 align-items-center">
        <div className="card shadow-xl border-0 rounded-4 overflow-hidden" style={{ maxWidth: '650px', width: '100%', background: 'var(--surface-color)' }}>
          {/* HEADER */}
          <div className="bg-info text-white p-4" style={{ background: 'var(--secondary-gradient)' }}>
            <h2 className="mb-0 fw-bold"><i className="bi bi- megaphone-fill me-2"></i>Submit a Request</h2>
            <p className="mb-0 opacity-75 mt-1">Lodge a formal demand or request directly to city officials.</p>
          </div>

          <div className="p-4 p-md-5">
            <div className="mb-4">
              <label className="form-label fw-bold text-dark mb-2">
                Request Details
              </label>
              <textarea
                className="form-control bg-light border-0 px-3 py-3"
                rows="5"
                placeholder="Please describe your request in detail..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ resize: 'none', borderRadius: 'var(--radius-md)' }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold text-dark mb-2">
                Location Coordinates
              </label>
              <div className="p-3 bg-light rounded-3 border">
                <Location setLat={setLat} setLng={setLng} />
              </div>
            </div>

            <button
              className="btn btn-info btn-lg w-100 rounded-pill shadow-sm mt-3 fw-bold d-flex justify-content-center align-items-center gap-2 text-white"
              onClick={handleSubmit}
              disabled={loading}
              style={{ background: 'var(--secondary-gradient)', border: 'none' }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="bi bi-send-check-fill"></i> Submit Request
                </>
              )}
            </button>

            {result && (
              <div className="alert alert-success mt-4 d-flex align-items-center rounded-3 border-0 shadow-sm">
                <i className="bi bi-check-circle-fill fs-4 me-3"></i>
                <div>
                  <strong className="d-block mb-1">Success!</strong>
                  <span className="small">{result}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Requests;
