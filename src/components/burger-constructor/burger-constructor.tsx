import { FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { createOrder, clearOrder } from '../../services/slices/order-slice';
import { clearConstructor } from '../../services/slices/constructor-slice';

export const BurgerConstructor: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { bun, ingredients } = useAppSelector((state) => state.constructor);
  const { currentOrder, loading: orderRequest } = useAppSelector((state) => state.order);
  const { user } = useAppSelector((state) => state.auth);

  const onOrderClick = () => {
    if (!bun || orderRequest) return;

    if (!user) {
      navigate('/login');
      return;
    }

    const ingredientIds = [
      bun._id,
      ...ingredients.map((item) => item._id),
      bun._id
    ];
    dispatch(createOrder(ingredientIds));
  };

  const closeOrderModal = () => {
    dispatch(clearOrder());
    dispatch(clearConstructor());
  };

  const price = useMemo(
    () => {
      const bunPrice = bun ? bun.price * 2 : 0;
      const ingredientsPrice = ingredients.reduce(
        (sum, item) => sum + (item?.price || 0),
        0
      );
      return bunPrice + ingredientsPrice;
    },
    [bun, ingredients]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={{ bun, ingredients }}
      orderModalData={currentOrder}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
