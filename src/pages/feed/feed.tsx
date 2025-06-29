import { FC } from 'react';
import { FeedUI } from '@ui';
import { useAppSelector, useAppDispatch } from '../../services/store';
import { fetchFeeds } from '../../services/slices/feed-slice';

export const Feed: FC = () => {
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector((state) => state.feed);

  const handleGetFeeds = () => {
    dispatch(fetchFeeds());
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
