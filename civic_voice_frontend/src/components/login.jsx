import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      navigate("/home", { replace: true });
    } catch (error) {
      setErr("Server Error");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light loginRegisterBG">
      <main className="shadow rounded p-4 boxx" style={{ maxWidth: "400px", width: "100%" }}>
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
            />
            <label>Password</label>
          </div>

          <button className="btn btn-primary w-100 py-2" type="submit">
            Login
          </button>

          {err && <div className="text-white">{err}</div>}
        </form>
      </main>
    </div>
  );
}

export default Login;
