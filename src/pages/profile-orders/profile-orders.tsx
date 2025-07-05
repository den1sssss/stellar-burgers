import { FC, useEffect, useRef } from 'react';
import { OrdersList } from '@components';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { fetchUserOrders } from '../../services/slices/feed-slice';

export const ProfileOrders: FC = () => {
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector((state) => state.feed);
  const ordersRequested = useRef(false);

  useEffect(() => {
    if (!orders?.length && !loading && !ordersRequested.current) {
      ordersRequested.current = true;
      dispatch(fetchUserOrders());
    }
  }, [dispatch, orders?.length, loading]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <OrdersList orders={orders} />;
};
