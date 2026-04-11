import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getStoredAuth } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { token } = getStoredAuth();

  if (!token) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;

