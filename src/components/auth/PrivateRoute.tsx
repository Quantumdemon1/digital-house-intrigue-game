
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state if auth state is still being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  // Check if bypass mode is enabled in localStorage
  const bypassAuth = localStorage.getItem('bypass-auth') === 'true';
  
  // Allow access if authenticated OR if bypass is enabled
  if (isAuthenticated() || bypassAuth) {
    return <>{children}</>;
  }
  
  // Redirect to login if not authenticated and bypass not enabled
  return <Navigate to="/" replace />;
};

export default PrivateRoute;
