import { useState } from "react";
import Location from "./geoLocation";
import "./requests.css";

function Requests() {
  const [text, setText] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

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
      const res = await fetch("http://localhost:8000/requests", {
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
      {/* page background */}

      <div className="container d-flex justify-content-center">
        <div className="col-md-6 requests-card">
          {/* glass card */}

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Describe the Requests / Demands
            </label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Write problem details..."
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
