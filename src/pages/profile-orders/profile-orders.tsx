import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileOrdersUI } from '@ui-pages';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { fetchUserOrders } from '../../services/slices/feed-slice';
import { fetchIngredients } from '../../services/slices/ingredients-slice';

export const ProfileOrders: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { userOrders, loading, error } = useAppSelector((state) => state.feed);
  const { items: ingredients } = useAppSelector((state) => state.ingredients);

  useEffect(() => {
    dispatch(fetchUserOrders()).then((result) => {
      // Если произошла ошибка аутентификации, перенаправляем на логин
      if (
        result.meta.requestStatus === 'rejected' &&
        result.payload === 'Authentication failed'
      ) {
        navigate('/login');
      }
    });
    if (!ingredients.length) {
      dispatch(fetchIngredients());
    }
  }, [dispatch, ingredients.length, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <ProfileOrdersUI orders={userOrders} />;
};
