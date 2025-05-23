import { FC, useEffect } from 'react';
import { ProfileOrdersUI } from '@ui-pages';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { connectToUserOrders } from '../../services/websocket';
import { getCookie } from '../../utils/cookie';

export const ProfileOrders: FC = () => {
  const dispatch = useAppDispatch();
  const { userOrders } = useAppSelector((state) => state.feed);
  const token = getCookie('accessToken');

  useEffect(() => {
    if (token) {
      const disconnect = connectToUserOrders(dispatch, token);
      return () => {
        disconnect();
      };
    }
  }, [dispatch, token]);

  return <ProfileOrdersUI orders={userOrders} />;
};
