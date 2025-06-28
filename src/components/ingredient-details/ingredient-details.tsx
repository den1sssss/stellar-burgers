import { FC, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { fetchIngredients } from '../../services/slices/ingredients-slice';

export const IngredientDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.ingredients);
  const ingredientData = items.find((item) => item._id === id);

  useEffect(() => {
    if (!items.length && !loading) {
      dispatch(fetchIngredients());
    }
  }, [dispatch, items.length, loading]);

  if (loading) {
    return <Preloader />;
  }

  if (!ingredientData) {
    return <div>Ingredient not found</div>;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
