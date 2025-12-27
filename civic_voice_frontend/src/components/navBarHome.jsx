import "bootstrap/dist/css/bootstrap.min.css";
import { NavLink } from "react-router-dom";

function NavBarHome() {
  return (
    <div className="container-fluid px-4">
      <header className="navbar shadow-sm bg-white">
        <div className="row w-100 align-items-center">
          <div className="col-md-3"></div>

          <div className="col-md-6 d-flex justify-content-center">
            <ul className="nav nav-pills">
              {[
                { name: "Home", path: "/" },
                { name: "Problems", path: "/problems" },
                { name: "Requests", path: "/requests" },
                { name: "Contact", path: "/contact" },
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
              <a
                href="#"
                className="d-flex align-items-center text-dark text-decoration-none dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <img
                  src="https://github.com/mdo.png"
                  alt=""
                  width="32"
                  height="32"
                  className="rounded-circle me-2"
                />
                <strong>mdo</strong>
              </a>

              <ul className="dropdown-menu dropdown-menu-end text-small">
                <li>
                  <a className="dropdown-item" href="#">
                    Profile
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Settings
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Sign out
                  </a>
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
