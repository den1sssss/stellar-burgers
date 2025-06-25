import { FC, ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactElement;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('accessToken'); // We'll use this simple check for now

  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return children;
};
