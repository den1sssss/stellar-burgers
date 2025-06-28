import { FC, useEffect } from 'react';
import { ProfileOrdersUI } from '@ui-pages';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { fetchUserOrders } from '../../services/slices/feed-slice';

export const ProfileOrders: FC = () => {
  const dispatch = useAppDispatch();
  const { userOrders, loading } = useAppSelector((state) => state.feed);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <ProfileOrdersUI orders={userOrders} />;
};
