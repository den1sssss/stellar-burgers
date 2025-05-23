import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import { useAppSelector } from '../../services/store';

export const IngredientDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { items, loading } = useAppSelector((state) => state.ingredients);
  const ingredientData = items.find((item) => item._id === id);

  if (loading) {
    return <Preloader />;
  }

  if (!ingredientData) {
    return <div>Ingredient not found</div>;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
