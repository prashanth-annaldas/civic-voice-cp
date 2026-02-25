import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App.jsx";
import AuthLayout from "./components/AuthLayout.jsx";
import HomeLayout from "./components/HomeLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import LandingPage from "./components/LandingPage.jsx";
import Login from "./components/login.jsx";
import Register from "./components/register.jsx";
import Home from "./components/home.jsx";
import Problems from "./components/problems.jsx";
import Requests from "./components/requests.jsx";
import Admin from "./components/admin.jsx";
import StaffDashboard from "./components/StaffDashboard.jsx";
import About from "./components/about.jsx";
import Account from "./components/account.jsx";

import "bootstrap/dist/js/bootstrap.bundle.min.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [

      { index: true, element: <LandingPage /> },

      {
        element: <AuthLayout />,
        children: [
          { path: "login", element: <Login /> },
          { path: "register", element: <Register /> },
        ],
      },

      {
        element: <HomeLayout />,
        children: [
          { path: "home", element: <ProtectedRoute><Home /></ProtectedRoute> },
          { path: "problems", element: <ProtectedRoute><Problems /></ProtectedRoute> },
          { path: "requests", element: <ProtectedRoute><Requests /></ProtectedRoute> },
          { path: "admin", element: <ProtectedRoute allowedRoles={["ADMIN"]}><Admin /></ProtectedRoute> },
          { path: "staff", element: <ProtectedRoute allowedRoles={["ADMIN", "STAFF", "USER"]}><StaffDashboard /></ProtectedRoute> },
          { path: "about", element: <ProtectedRoute><About /></ProtectedRoute> },
          { path: "account", element: <ProtectedRoute><Account /></ProtectedRoute> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE"}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
