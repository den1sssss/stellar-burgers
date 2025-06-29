import { FC, memo } from 'react';
import { BurgerIngredientUI } from '@ui';
import { TBurgerIngredientProps } from './type';
import { useAppDispatch } from '../../services/store';
import { addIngredient } from '../../services/slices/constructor-slice';

export const BurgerIngredient: FC<TBurgerIngredientProps> = memo(
  ({ ingredient, count }) => {
    const dispatch = useAppDispatch();

    const handleAdd = () => {
      const {
        _id,
        name,
        type,
        proteins,
        fat,
        carbohydrates,
        calories,
        price,
        image,
        image_large,
        image_mobile
      } = ingredient;
      dispatch(
        addIngredient({
          _id,
          name,
          type,
          proteins,
          fat,
          carbohydrates,
          calories,
          price,
          image,
          image_large,
          image_mobile
        })
      );
    };

    return (
      <BurgerIngredientUI
        ingredient={ingredient}
        count={count}
        handleAdd={handleAdd}
      />
    );
  }
);
