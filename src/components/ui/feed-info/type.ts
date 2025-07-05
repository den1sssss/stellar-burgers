import { TOrder } from '@utils-types';

export type Feed = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  loading: boolean;
  error: string | null;
};

export type FeedInfoUIProps = {
  feed: Feed;
  readyOrders: number[];
  pendingOrders: number[];
};

export type HalfColumnProps = {
  orders: number[];
  title: string;
  textColor?: string;
};

export type TColumnProps = {
  title: string;
  content: number;
};

export type FeedInfoProps = {
  feed: Feed;
};
