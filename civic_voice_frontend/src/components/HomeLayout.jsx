import { Outlet, Navigate } from "react-router-dom";
import NavBarHome from "./navBarHome";

function HomeLayout() {
  const token = localStorage.getItem("token");

  const isValidToken =
    token &&
    token !== "undefined" &&
    token !== "null" &&
    token.trim() !== "";

  if (!isValidToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <NavBarHome />
      <Outlet />
    </>
  );
}

export default HomeLayout;
