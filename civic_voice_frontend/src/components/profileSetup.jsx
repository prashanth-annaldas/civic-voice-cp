import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = import.meta.env.VITE_API_URL;

function ProfileSetup({ onProfileUpdated }) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Please enter your name");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name }),
            });

            if (res.ok) {
                onProfileUpdated(name);
            } else {
                const data = await res.json();
                setError(data.detail || "Failed to save profile");
            }
        } catch (err) {
            setError("Server error");
        }
        setLoading(false);
    };

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                zIndex: 1050,
                backdropFilter: "blur(5px)",
            }}
        >
            <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "90%" }}>
                <h3 className="text-center mb-4">Complete Your Profile</h3>
                <p className="text-muted text-center">
                    Welcome! Before you can continue, please tell us your name.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="form-floating mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                        />
                        <label>Full Name</label>
                    </div>
                    {error && <div className="text-danger small mb-3 text-center">{error}</div>}
                    <button
                        type="submit"
                        className="btn btn-primary w-100 py-2"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Profile"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ProfileSetup;
