import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  // localStorage se user nikalo
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  // 1. Login hi nahi hai
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Login hai, but role allowed nahi hai
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Sab sahi hai
  return children;
};

export default ProtectedRoute;