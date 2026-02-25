import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || "USER";
    const location = useLocation();

    if (!token) {
        // Not logged in, redirect to login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Logged in but access denied (e.g. USER trying to access ADMIN route)
        // Could create a 403 page, but for now redirecting to home
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default ProtectedRoute;
