import { FC, useEffect } from 'react';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { fetchFeeds } from '../../services/slices/feed-slice';
import { fetchIngredients } from '../../services/slices/ingredients-slice';

export const Feed: FC = () => {
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector((state) => state.feed);
  const { items: ingredients } = useAppSelector((state) => state.ingredients);

  useEffect(() => {
    if (!ingredients.length) {
      dispatch(fetchIngredients());
    }
    if (!orders.length) {
      dispatch(fetchFeeds());
    }
  }, [dispatch, ingredients.length, orders.length]);

  const handleGetFeeds = () => {
    dispatch(fetchFeeds());
  };

  if (loading) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
