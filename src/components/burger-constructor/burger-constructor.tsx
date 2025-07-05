import { FC, useCallback } from 'react';
import { BurgerConstructorUI } from '@ui';
import { useAppSelector, useAppDispatch } from '../../services/store';
import { clearConstructor } from '../../services/slices/constructor-slice';
import { createOrder, clearOrder } from '../../services/slices/order-slice';
import { useNavigate, useLocation } from 'react-router-dom';

export const BurgerConstructor: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { bun, ingredients } = useAppSelector(
    (state) => state.burgerConstructor
  );
  const { currentOrder, loading: orderRequest } = useAppSelector(
    (state) => state.order
  );
  const user = useAppSelector((state) => state.auth.user);

  const handleOrderClick = useCallback(() => {
    if (!bun) return;
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    const ingredientIds = [
      bun._id,
      ...ingredients.map((item) => item._id),
      bun._id
    ];
    dispatch(createOrder(ingredientIds));
  }, [bun, ingredients, dispatch, user, navigate, location]);

  const handleCloseOrderModal = useCallback(() => {
    dispatch(clearOrder());
    dispatch(clearConstructor());
    navigate('/');
  }, [dispatch, navigate]);

  const totalPrice = useCallback(() => {
    const bunPrice = bun ? bun.price * 2 : 0;
    const ingredientsPrice = ingredients.reduce(
      (sum, item) => sum + item.price,
      0
    );
    return bunPrice + ingredientsPrice;
  }, [bun, ingredients]);

  const constructorIngredients = ingredients.map((item, index) => ({
    ...item,
    id: item.constructorId || String(index)
  }));

  return (
    <BurgerConstructorUI
      price={totalPrice()}
      orderRequest={orderRequest}
      constructorItems={{ bun, ingredients: constructorIngredients }}
      onOrderClick={handleOrderClick}
      closeOrderModal={handleCloseOrderModal}
      orderModalData={currentOrder}
    />
  );
};
