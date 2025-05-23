import { FC, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../services/store';
import { connectToOrders, connectToUserOrders } from '../services/websocket';
import { getCookie } from '../utils/cookie';

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: FC<WebSocketProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const token = getCookie('accessToken');

  useEffect(() => {
    let disconnect: (() => void) | undefined;

    if (location.pathname === '/feed') {
      disconnect = connectToOrders(dispatch);
    } else if (location.pathname === '/profile/orders' && user && token) {
      disconnect = connectToUserOrders(dispatch, token);
    }

    return () => {
      if (disconnect) {
        disconnect();
      }
    };
  }, [dispatch, location.pathname, user, token]);

  return <>{children}</>;
}; 