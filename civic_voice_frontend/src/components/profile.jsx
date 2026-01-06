import { useEffect, useState } from "react";
import "./profile.css";
import "bootstrap/dist/css/bootstrap.min.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const email = "prashanthannaldas@gmail.com";

  useEffect(() => {
    fetch(`http://localhost:8000/profile`)
      .then((res) => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => setError("Unable to load profile"));
  }, []);

  if (error) {
    return <p className="text-danger text-center">{error}</p>;
  }

  if (!user) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card shadow">
        <div className="profile-avatar">
          {user.email.charAt(0).toUpperCase()}
        </div>

        <h3 className="mt-3">User Profile</h3>

        <div className="profile-info">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Joined:</strong> {user.joined}</p>
        </div>

        <button className="btn btn-danger mt-3">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;
