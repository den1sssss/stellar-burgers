import { FC, ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../services/store';

interface ProtectedRouteProps {
  children: ReactElement;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    // Save the attempted URL for redirecting after login
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return children;
};
