import "bootstrap/dist/css/bootstrap.min.css";
import { NavLink, useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.jpeg";
import "bootstrap-icons/font/bootstrap-icons.css";

function NavBarHome() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="container-fluid px-0">
      <header className="navbar navbar-expand-md shadow-sm bg-white fixed-top">
        <div className="container-fluid align-items-center">

          <NavLink className="navbar-brand ms-3" to="/home">
            <img className="logo m-0" src={Logo} alt="logo" style={{ width: "60px" }} />
          </NavLink>

          <button
            className="navbar-toggler me-3"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navBarContent"
            aria-controls="navBarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-center" id="navBarContent">
            <ul className="navbar-nav mb-2 mb-md-0 d-flex align-items-center">
              {[
                { name: "Home", path: "/home" },
                { name: "Problems", path: "/problems" },
                { name: "Requests", path: "/requests" },
                { name: "Admin", path: "/admin" },
                { name: "About", path: "/about" },
              ].map((item) => (
                <li className="nav-item mx-2" key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      "nav-link fw-semibold" + (isActive ? " active text-primary" : " text-dark")
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="d-flex ms-auto me-3 align-items-center mt-3 mt-md-0">
              <div className="dropdown w-100 text-center text-md-end">
                <button
                  className="btn btn-outline-secondary dropdown-toggle"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-person-circle me-2"></i> Account
                </button>
                <ul className="dropdown-menu dropdown-menu-end text-center text-md-start">
                  <li>
                    <button className="dropdown-item text-danger fw-bold" onClick={handleLogout}>
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </header>
    </div>
  );
}

export default NavBarHome;
