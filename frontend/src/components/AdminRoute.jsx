import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);

  // Check if user is logged in AND is an admin
  if (user && user.isAdmin) {
    return children; // They are an admin, show the page
  }

  // Not an admin, send them back to their projects page
  return <Navigate to="/projects" replace />;
}

export default AdminRoute;