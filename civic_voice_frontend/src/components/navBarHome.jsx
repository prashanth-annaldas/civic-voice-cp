import "bootstrap/dist/css/bootstrap.min.css";
import { NavLink, useNavigate } from "react-router-dom";
import Logo from "../assets/WhatsApp_Image_2026-01-06_at_9.57.51_PM-removebg-preview.png";
import "bootstrap-icons/font/bootstrap-icons.css";

function NavBarHome() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="container-fluid px-0">
      <header className="navbar navbar-expand-md fixed-top" style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
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
                { name: "Home", path: "/home", roles: ["USER", "STAFF", "ADMIN"] },
                { name: "Problems", path: "/problems", roles: ["USER", "STAFF", "ADMIN"] },
                { name: "Requests", path: "/requests", roles: ["USER", "STAFF", "ADMIN"] },
                { name: "Admin", path: "/admin", roles: ["ADMIN"] },
                { name: "Staff", path: "/staff", roles: ["USER", "STAFF", "ADMIN"] },
                { name: "About", path: "/about", roles: ["USER", "STAFF", "ADMIN"] },
              ].map((item) => {
                const userRole = localStorage.getItem("role") || "USER";
                if (!item.roles.includes(userRole)) return null;

                return (
                  <li className="nav-item mx-2" key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        "nav-link fw-medium px-3 rounded-pill transition-all" +
                        (isActive ? " active text-white" : " text-muted")
                      }
                      style={({ isActive }) => isActive ? {
                        background: 'var(--primary-gradient)',
                        boxShadow: 'var(--shadow-md)'
                      } : {}}
                    >
                      {item.name}
                    </NavLink>
                  </li>
                );
              })}
            </ul>

            <div className="d-flex ms-auto me-3 align-items-center mt-3 mt-md-0">
              <div className="dropdown w-100 text-center text-md-end">
                <button
                  className="btn d-flex align-items-center justify-content-center gap-2 rounded-pill px-4 ms-md-3"
                  data-bs-toggle="dropdown"
                  style={{
                    border: '1px solid var(--primary-color)',
                    color: 'var(--primary-color)',
                    background: 'transparent',
                    fontWeight: '600',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--primary-color)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--primary-color)';
                  }}
                >
                  <i className="bi bi-person-circle"></i> Account
                </button>
                <ul className="dropdown-menu dropdown-menu-end text-center text-md-start border-0 shadow-lg" style={{
                  borderRadius: 'var(--radius-lg)',
                  padding: '10px'
                }}>
                  <li>
                    <NavLink
                      to="/account"
                      className={({ isActive }) =>
                        "dropdown-item rounded" + (isActive ? " active bg-primary text-white fw-bold" : "")
                      }
                      style={{ padding: '8px 16px' }}
                    >
                      <i className="bi bi-person me-2"></i>My Profile
                    </NavLink>
                  </li>
                  <li>
                    <hr className="dropdown-divider my-2" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger fw-bold rounded d-flex align-items-center"
                      onClick={handleLogout}
                      style={{ padding: '8px 16px' }}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>Sign out
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
