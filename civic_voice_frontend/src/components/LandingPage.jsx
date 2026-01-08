import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Logo from "../assets/Logo.jpeg";
import "bootstrap/dist/css/bootstrap.min.css";
import "./home.css";

function LandingPage() {
  return (
    <div className="container-fluid px-0">
      <header className="navbar shadow-sm bg-white">
        <div className="row w-100 align-items-center">

          <div className="col">
            <a to="/home">
              <img className="logo" src={Logo} alt="logo" />
            </a>
          </div>

          <div className="col-md-6 d-flex justify-content-center">
            <ul className="nav nav-pills">
              {["Home", "Problems", "Requests", "Admin", "About"].map((item) => (
                <li className="nav-item" key={item}>
                  <span className={`nav-link ${item === "Home" ? "active" : ""}`}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-md-3 d-flex justify-content-end gap-2">
            <Link to="/login" className="btn btn-outline-primary">
              Login
            </Link>
            <Link to="/register" className="btn btn-outline-primary">
              Sign Up
            </Link>
          </div>

        </div>
      </header>

      <section className="hero-section text-center landingPageBG">
        <h1>Your Voice for a Better City</h1>
        <p>
          Report real civic issues like potholes, water leakage, and garbage
          with location & image. Our AI detects the issue and alerts authorities.
        </p>
      </section>
    </div>
  );
}

export default LandingPage;
