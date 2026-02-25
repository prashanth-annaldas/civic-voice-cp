import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = import.meta.env.VITE_API_URL;

const StaffDashboard = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userRole = localStorage.getItem("role") || "USER";

    const fetchItems = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/staff/items`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("Failed to fetch dashboard items");
            }

            const data = await res.json();
            setItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleStatusUpdate = async (itemType, itemId, newStatus) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/staff/items/${itemType}/${itemId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                throw new Error(`Failed to update status for ${itemType} ${itemId}`);
            }

            // Re-fetch to reflect changes immediately
            fetchItems();
        } catch (err) {
            alert("Error updating status: " + err.message);
        }
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mb-5" style={{ paddingTop: "100px" }}>
            <h2 className="mb-4 text-center" style={{ fontWeight: "700", color: "#2c3e50" }}>
                Staff Operations Dashboard
            </h2>
            <p className="text-muted text-center mb-5">
                Manage active citizen reports and requests below.
            </p>

            {items.length === 0 ? (
                <div className="alert alert-info text-center">No active issues or requests to display.</div>
            ) : (
                <div className="row g-4">
                    {items.map((item) => {
                        const isRequest = item.type === "request";
                        const badgeClass =
                            item.status === "Pending"
                                ? "bg-danger"
                                : item.status === "Processing"
                                    ? "bg-warning text-dark"
                                    : "bg-success";

                        return (
                            <div key={`${item.type}-${item.id}`} className="col-12 col-md-6 col-lg-4">
                                <div className="card h-100 shadow-sm border-0" style={{ transition: "0.3s", borderRadius: "12px" }}>
                                    {item.image && (
                                        <img
                                            src={`${API_URL}/uploads/${item.image.split('/').pop()}`}
                                            className="card-img-top"
                                            alt={item.category}
                                            style={{ height: "200px", objectFit: "cover", borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}
                                        />
                                    )}
                                    {!item.image && (
                                        <div className="card-img-top d-flex align-items-center justify-content-center bg-light text-muted" style={{ height: "200px", borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}>
                                            <i className={isRequest ? "bi bi-chat-text fs-1" : "bi bi-image-fill fs-1"}></i>
                                            <span className="ms-2">{isRequest ? "Request (No Image)" : "No Image Provided"}</span>
                                        </div>
                                    )}

                                    <div className="card-body d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h5 className="card-title fw-bold mb-0 text-truncate" style={{ maxWidth: "70%" }}>
                                                {item.category}
                                            </h5>
                                            <span className={`badge ${badgeClass} rounded-pill`}>{item.status}</span>
                                        </div>

                                        <p className="card-text text-muted small flex-grow-1" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                            {item.description || "No description provided."}
                                        </p>

                                        <div className="text-muted small mb-3">
                                            <strong>Loc:</strong> {item.lat?.toFixed(4)}, {item.lng?.toFixed(4)}
                                            <br />
                                            <strong>ID:</strong> {item.type.toUpperCase()}-{item.id}
                                        </div>

                                        {userRole !== "USER" && (
                                            <div className="d-flex gap-2 mt-auto pt-2 border-top">
                                                <button
                                                    className="btn btn-outline-warning btn-sm w-50 fw-semibold"
                                                    onClick={() => handleStatusUpdate(item.type, item.id, "Processing")}
                                                    disabled={item.status === "Processing" || item.status === "Resolved"}
                                                >
                                                    <i className="bi bi-gear-fill me-1"></i> Processing
                                                </button>
                                                <button
                                                    className="btn btn-outline-success btn-sm w-50 fw-semibold"
                                                    onClick={() => handleStatusUpdate(item.type, item.id, "Resolved")}
                                                    disabled={item.status === "Resolved"}
                                                >
                                                    <i className="bi bi-check-circle-fill me-1"></i> Resolved
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StaffDashboard;
