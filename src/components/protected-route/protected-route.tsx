import { FC, ReactElement, useEffect } from 'react';
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
  const { user, loading } = useAppSelector((state) => state.auth);
  const from = location.state?.from || location.pathname;

  // Автологин при загрузке защищенного маршрута
  useEffect(() => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken && !user && !loading) {
      dispatch(getUser());
    }
  }, [dispatch, user, loading]);

  // Показываем прелоадер во время проверки авторизации
  if (loading) {
    return <Preloader />;
  }

  // Если разрешен неавторизованный доступ, а пользователь авторизован...
  if (anonymous && user) {
    // ...то отправляем его на предыдущую страницу
    return <Navigate to={from} />;
  }

  // Если требуется авторизация, а пользователь не авторизован...
  if (!anonymous && !user) {
    // ...то отправляем его на страницу логин
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // Если все ок, то рендерим внутреннее содержимое
  return children;
};
