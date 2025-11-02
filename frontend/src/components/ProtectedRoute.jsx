import React, { useContext } from 'react'; // <-- Add useContext
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // <-- Import AuthContext

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext); // <-- Use the hook like this
  if (loading) {
    // Show a loading spinner or message while checking auth
    return <div>Loading...</div>;
  }

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // Logged in, show the component they asked for
  return children;
}

export default ProtectedRoute;