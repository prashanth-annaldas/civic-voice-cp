import { Outlet, useLocation } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import NavBarHome from "./components/navBarHome";
import NavBar from "./components/navBar";

function App() {
  const location = useLocation();
  const showNav = location.pathname === "/";
  const showNavHome = location.pathname === "/home" || location.pathname === "/problems" || location.pathname === "/requests" || location.pathname === "/admin" || location.pathname === "/about";

  return (
    <>
      {showNav && <NavBar />}
      {showNavHome && <NavBarHome />}
      <Outlet />
    </>
  );
}

export default App;