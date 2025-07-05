import { FC, ReactElement, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { getUser } from '../../services/slices/auth-slice';
import { Preloader } from '../ui/preloader';

interface ProtectedRouteProps {
  children: ReactElement;
  anonymous?: boolean;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  anonymous = false
}) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const [authAttempted, setAuthAttempted] = useState(false);
  const from = location.state?.from || location.pathname;

  useEffect(() => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken && !user && !loading && !authAttempted) {
      setAuthAttempted(true);
      dispatch(getUser());
    }
  }, [dispatch, user, loading, authAttempted]);

  const refreshToken = localStorage.getItem('refreshToken');

  if (loading || (refreshToken && !user && !authAttempted)) {
    return <Preloader />;
  }

  if (anonymous && user) {
    return <Navigate to={from} />;
  }

  if (!anonymous && !user) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return children;
};
