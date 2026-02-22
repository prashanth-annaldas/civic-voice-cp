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
    <div className="problems-page min-vh-100 d-flex flex-column" style={{ paddingTop: '80px' }}>
      <div className="container py-5 d-flex justify-content-center flex-grow-1 align-items-center">
        <div className="card shadow-xl border-0 rounded-4 overflow-hidden" style={{ maxWidth: '900px', width: '100%', background: 'var(--surface-color)' }}>
          <div className="row g-0">
            {/* HEADINGS / TITLE AREA */}
            <div className="col-12 bg-primary text-white p-4" style={{ background: 'var(--primary-gradient)' }}>
              <h2 className="mb-0 fw-bold"><i className="bi bi-camera-fill me-2"></i>Report a Problem</h2>
              <p className="mb-0 opacity-75 mt-1">Upload an image and provide details. AI will assist in categorizing it.</p>
            </div>

            <div className="col-md-5 p-0 bg-light d-flex flex-column">
              <div className="p-4 flex-grow-1 d-flex flex-column justify-content-center">
                {preview ? (
                  <div className="position-relative mb-3 rounded-4 overflow-hidden shadow-sm">
                    <img
                      src={preview}
                      className="w-100 object-fit-cover"
                      style={{ height: "260px" }}
                      alt="Preview"
                    />
                    <button
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle shadow"
                      onClick={() => { setFile(null); setPreview(null); }}
                      style={{ width: '32px', height: '32px' }}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                ) : (
                  <label
                    className="image-upload-zone w-100 mb-3 d-flex flex-column align-items-center justify-content-center p-5 text-center text-muted rounded-4 cursor-pointer"
                    style={{
                      height: "260px",
                      border: "2px dashed var(--primary-light)",
                      backgroundColor: "rgba(79, 70, 229, 0.03)",
                      transition: "all 0.3s ease",
                      cursor: "pointer"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(79, 70, 229, 0.08)";
                      e.currentTarget.style.borderColor = "var(--primary-color)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(79, 70, 229, 0.03)";
                      e.currentTarget.style.borderColor = "var(--primary-light)";
                    }}
                  >
                    <i className="bi bi-cloud-arrow-up fs-1 text-primary mb-2"></i>
                    <span className="fw-semibold text-dark">Click to upload image</span>
                    <span className="small text-muted mt-1">PNG, JPG up to 10MB</span>
                    <input
                      type="file"
                      className="d-none"
                      accept="image/*"
                      onChange={handleImage}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* FORM COLUMN */}
            <div className="col-md-7 p-4 p-md-5 d-flex flex-column justify-content-center">
              <div className="mb-4">
                <label className="form-label fw-bold text-dark mb-2">
                  Location Coordinates
                </label>
                <div className="p-3 bg-light rounded-3 border">
                  <Location setLat={setLat} setLng={setLng} />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold text-dark mb-2">
                  Describe the problem
                </label>
                <textarea
                  className="form-control bg-light border-0 px-3 py-3"
                  rows="4"
                  placeholder="E.g., Large pothole on the main avenue causing traffic..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  style={{ resize: 'none', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <button
                className="btn btn-primary btn-lg w-100 rounded-pill shadow-sm mt-2 fw-bold d-flex justify-content-center align-items-center gap-2"
                onClick={handleSubmit}
                disabled={loading}
                style={{ background: 'var(--primary-gradient)', border: 'none' }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Analyzing & Submitting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-fill"></i> Submit Report
                  </>
                )}
              </button>

              {result && (
                <div className="alert alert-success mt-4 d-flex align-items-center rounded-3 border-0 shadow-sm">
                  <i className="bi bi-check-circle-fill fs-4 me-3"></i>
                  <div>
                    <strong className="d-block mb-1">Success! Issue Detected:</strong>
                    <span className="text-dark bg-white px-2 py-1 rounded small fw-medium">{result}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>);
}

export default Problems;
