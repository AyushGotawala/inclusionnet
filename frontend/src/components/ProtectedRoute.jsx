import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Debug logging (remove in production)
  if (allowedRoles.length > 0) {
    console.log('ProtectedRoute check:', {
      userRole: user?.role,
      allowedRoles,
      isAllowed: allowedRoles.includes(user?.role)
    });
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    console.warn('Access denied:', {
      userRole: user?.role,
      allowedRoles,
      user: user
    });
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;