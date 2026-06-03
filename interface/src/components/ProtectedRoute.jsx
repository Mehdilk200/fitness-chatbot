import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireProfile = true }) => {
  const token = localStorage.getItem('token');
  const isProfileComplete = localStorage.getItem('is_profile_complete') === 'true';

  if (!token) {
    // Not logged in
    return <Navigate to="/auth" replace />;
  }

  if (requireProfile && !isProfileComplete) {
    // Logged in but profile incomplete
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;
