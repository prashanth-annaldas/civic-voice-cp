import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const API_URL = import.meta.env.VITE_API_URL;
console.log("API_URL from env:", API_URL);

function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");

    if (!email || !pass) {
      setErr("Please fill all fields!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: pass,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data.detail || "Login failed");
        return;
      }

      if (!data.access_token) {
        setErr("Invalid server response");
        return;
      }

      localStorage.setItem("token", data.access_token);

      const role = data.user?.role || "USER";
      localStorage.setItem("role", role);

      if (role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (role === "STAFF") {
        navigate("/staff", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    } catch (error) {
      setErr("Server Error");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${API_URL}/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data.detail || "Google Login failed");
        return;
      }

      if (!data.access_token) {
        setErr("Invalid server response");
        return;
      }

      localStorage.setItem("token", data.access_token);

      const role = data.user?.role || "USER";
      localStorage.setItem("role", role);

      if (role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (role === "STAFF") {
        navigate("/staff", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    } catch (error) {
      setErr("Server Error during Google Login");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light loginRegisterBG">
      <main className="shadow rounded p-4 m-3 boxx" style={{ maxWidth: "400px", width: "100%" }}>
        <form onSubmit={handleLogin}>
          <center>
            <h1 className="text-white mb-3">Login</h1>
          </center>

          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email address</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="password"
              className="form-control"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
            />
            <label>Password</label>
          </div>

          <button className="btn btn-primary w-100 py-2" type="submit">
            Login
          </button>

          <div className="d-flex align-items-center my-3">
            <hr className="flex-grow-1 text-white m-0" />
            <span className="mx-2 text-white">OR</span>
            <hr className="flex-grow-1 text-white m-0" />
          </div>

          <div className="d-flex justify-content-center mb-3">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setErr("Google Login Failed");
              }}
            />
          </div>

          {err && <div className="text-white text-center mt-2">{err}</div>}

          <div className="mt-4 p-3 rounded" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
            <h6 className="text-warning mb-2 text-center">🛠 Demo Accounts Checklist</h6>
            <ul className="list-unstyled mb-0 ms-2 text-light small text-center" style={{ opacity: 0.9 }}>
              <li className="mb-1">✅ <strong>Admin:</strong> ram@gmail.com / ******</li>
              <li className="mb-1">✅ <strong>Staff:</strong> ravi@gmail.com / ******</li>
              <li>✅ <strong>User:</strong> kiran@gmail.com / ******</li>
            </ul>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Login;
