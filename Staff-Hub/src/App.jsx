import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";

import Login from "./pages/login/Login";
import Signup from "./pages/login/Signup";
import Forgetemail from "./pages/forgetpassword/Forgetemail";
import Otpverify from "./pages/forgetpassword/Otpverify";
import ResetPassword from "./pages/forgetpassword/ResetPassword";

import Dashboard from "./pages/dashboard/Dashboard";
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/dashboard/Unauthorized";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";

function App() {
  return (
    <Routes>

      {/* Login */}
      <Route path="/" element={<Login />} />

      <Route path="/login" element={<Login />} />

      {/* Signup */}
      <Route path="/signup" element={<Signup />} />

      {/* Forgot Password */}
      <Route
        path="/forgot-password"
        element={<Forgetemail />}
      />

      <Route
        path="/otp-verify"
        element={<Otpverify />}
      />

      <Route
        path="/resetpassword"
        element={<ResetPassword />}
      />

      {/* Admin Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />


      {/* Super Admin Dashboard */}
      <Route
        path="/superadmindashboard"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />


      {/* Unauthorized */}
      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

    </Routes>
  );
}

export default App;