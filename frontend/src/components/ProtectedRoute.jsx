import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-700 text-lg">
        Checking authentication...
      </div>
    );
  }

  // 🔒 If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Authenticated, allow access
  return children;
}

export default ProtectedRoute;
