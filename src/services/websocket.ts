import { updateOrders, updateUserOrders } from './slices/feed-slice';
import { AppDispatch } from './store';
import { TWSMessage, TWSUserMessage } from '../utils/types';

const WS_URL = process.env.BURGER_WS_URL || 'wss://norma.nomoreparties.space';

export const connectToOrders = (dispatch: AppDispatch) => {
  const socket = new WebSocket(`${WS_URL}/orders/all`);

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data) as TWSMessage;
    if (data.success) {
      dispatch(
        updateOrders({
          orders: data.orders,
          total: data.total,
          totalToday: data.totalToday
        })
      );
    }
  };

  return () => {
    socket.close();
  };
};

export const connectToUserOrders = (dispatch: AppDispatch, token: string) => {
  const socket = new WebSocket(`${WS_URL}/orders?token=${token}`);

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data) as TWSUserMessage;
    if (data.success) {
      dispatch(updateUserOrders(data.orders));
    }
  };

  return () => {
    socket.close();
  };
};
