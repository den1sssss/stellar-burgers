import { FC, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { OrderInfoUI } from '@ui';
import { useAppSelector, useAppDispatch } from '../../services/store';
import { fetchOrderByNumber } from '../../services/slices/feed-slice';

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number: string }>();
  const dispatch = useAppDispatch();
  const { currentOrder, loading, error } = useAppSelector(
    (state) => state.feed
  );
  const { items: ingredients } = useAppSelector((state) => state.ingredients);

  useEffect(() => {
    if (number) {
      dispatch(fetchOrderByNumber(number));
    }
  }, [dispatch, number]);

  const orderInfo = useMemo(() => {
    if (!currentOrder || !ingredients?.length) return null;

    const date = new Date(currentOrder.createdAt);

    type TIngredientsWithCount = {
      [key: string]: any & { count: number };
    };

    const ingredientsInfo = currentOrder.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...currentOrder,
      ingredientsInfo,
      date,
      total
    };
  }, [currentOrder, ingredients]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!orderInfo) return <div>Order not found</div>;

  return <OrderInfoUI orderInfo={orderInfo} />;
};
