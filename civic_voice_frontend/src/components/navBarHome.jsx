import "bootstrap/dist/css/bootstrap.min.css";
import { NavLink, Link } from "react-router-dom";
import Logo from '../assets/Logo.jpeg';

function NavBarHome() {
  return (
    <div className="container-fluid px-4">
      <header className="navbar shadow-sm bg-white">
        <div className="row w-100 align-items-center">
          <div className="col"><img className="logo" src={Logo} alt="logo" /></div>

          <div className="col-md-6 d-flex justify-content-center">
            <ul className="nav nav-pills">
              {[
                { name: "Home", path: "/home" },
                { name: "Problems", path: "/problems" },
                { name: "Requests", path: "/requests" },
                { name: "Admin", path: "/admin" },
                { name: "About", path: "/about" },
              ].map((item) => (
                <li className="nav-item" key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      "nav-link" + (isActive ? " active" : "")
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-md-3 d-flex justify-content-end">
            <div className="dropdown">
              <Link
                to="#"
                className="d-flex align-items-center text-dark text-decoration-none dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                role="button"
              >
                <img
                  src="https://github.com/mdo.png"
                  alt="profile"
                  width="32"
                  height="32"
                  className="rounded-circle me-2"
                />
                <strong>Prashanth</strong>
              </Link>

              <ul className="dropdown-menu dropdown-menu-end text-small">
                <li>
                  <Link className="dropdown-item" to="/profile">
                    Profile
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button className="dropdown-item">
                    <Link className="dropdown-item" to="/">
                      Sign out
                    </Link>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default NavBarHome;
