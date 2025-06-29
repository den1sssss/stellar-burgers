import { FC, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { fetchFeeds } from '../../services/slices/feed-slice';
import { fetchIngredients } from '../../services/slices/ingredients-slice';

export const OrderInfo: FC = () => {
  const dispatch = useAppDispatch();
  const { number } = useParams<{ number: string }>();
  const { orders } = useAppSelector((state) => state.feed);
  const { items: ingredients, loading: ingredientsLoading } = useAppSelector(
    (state) => state.ingredients
  );
  const orderData = orders.find((order) => order.number === Number(number));

  // Загружаем заказы и ингредиенты, если их нет
  useEffect(() => {
    if (!orders.length) {
      dispatch(fetchFeeds());
    }
    if (!ingredients.length) {
      dispatch(fetchIngredients());
    }
  }, [dispatch, orders.length, ingredients.length]);

  // Если данные ещё не загружены
  if (!orders.length || !ingredients.length || ingredientsLoading) {
    return <Preloader />;
  }

  // Если заказ не найден
  if (!orderData) {
    return <div>Заказ не найден</div>;
  }

  // Готовим данные для отображения
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
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
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
