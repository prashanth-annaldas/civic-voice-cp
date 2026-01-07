import { Outlet, Navigate } from "react-router-dom";

function AuthLayout() {
  const token = localStorage.getItem("token");

  const isValidToken =
    token &&
    token !== "undefined" &&
    token !== "null" &&
    token.trim() !== "";

  if (isValidToken) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

export default AuthLayout;
