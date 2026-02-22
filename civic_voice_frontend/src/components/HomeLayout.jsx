import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import NavBarHome from "./navBarHome";
import ProfileSetup from "./profileSetup";

const API_URL = import.meta.env.VITE_API_URL;

function HomeLayout() {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const user = await res.json();
          if (!user.name) {
            setShowProfileSetup(true);
          }
        }
      } catch (err) {
        console.error("Checking profile failed");
      } finally {
        setLoading(false);
      }
    };
    checkProfile();
  }, [token]);

  const isValidToken =
    token &&
    token !== "undefined" &&
    token !== "null" &&
    token.trim() !== "";

  if (!isValidToken) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBarHome />
      <Outlet />
      {showProfileSetup && (
        <ProfileSetup onProfileUpdated={() => setShowProfileSetup(false)} />
      )}
    </>
  );
}

export default HomeLayout;
