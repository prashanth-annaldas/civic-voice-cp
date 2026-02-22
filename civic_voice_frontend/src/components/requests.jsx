import { useState } from "react";
import Location from "./geoLocation";
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
      const res = await fetch(`${API_BASE}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: text,
          latitude: lat,
          longitude: lng,
        }),
      });

      if (!res.ok) throw new Error();

      setResult("Request submitted and email sent!");
      setText("");
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="requests-page d-flex justify-content-center align-items-center vh-100">

      <div className="container d-flex justify-content-center">
        <div className="col-md-6 requests-card">

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Describe the Requests / Demands
            </label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Write request details..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <Location setLat={setLat} setLng={setLng} />

          <button
            className="btn btn-primary px-4 mt-3"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>

          {result && (
            <div className="alert alert-success mt-3">
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Requests;
