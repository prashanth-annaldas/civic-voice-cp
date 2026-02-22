import { useState } from "react";
import Location from "./geoLocation";
import "bootstrap/dist/css/bootstrap.min.css";
import "./problems.css";

function Problems() {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  const handleImage = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async () => {
    const API_BASE = import.meta.env.VITE_API_URL;
    if (!file) {
      alert("Please upload an image");
      return;
    }

    if (lat === null || lng === null) {
      alert("Please allow location access");
      return;
    }

    setLoading(true);
    setResult("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("lat", lat);
    formData.append("lng", lng);
    formData.append("description", text);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data.issue.type);
      } else {
        setResult("Upload failed");
      }
    } catch (err) {
      setResult("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="problems-page d-flex justify-content-center align-items-center vh-100">
      <div className="container d-flex justify-content-center">
        <div className="col-md-10 problems-card">
          <div className="row justify-content-center">
            {/* IMAGE COLUMN */}
            <div className="col-md-4 mb-4">
              <div className="card">
                {preview ? (
                  <img
                    src={preview}
                    className="card-img-top"
                    style={{ height: "220px", objectFit: "cover" }}
                    alt="Preview"
                  />
                ) : (
                  <div className="image-placeholder d-flex align-items-center justify-content-center">
                    No Image Selected
                  </div>
                )}

                <div className="card-body">
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImage}
                  />
                </div>
              </div>
            </div>

            {/* FORM COLUMN */}
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Describe the problem
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
                <div className="alert alert-info mt-3">
                  <strong>Detected Issue:</strong> {result}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Problems;
