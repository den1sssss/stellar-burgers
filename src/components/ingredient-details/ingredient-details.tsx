import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { IngredientDetailsUI } from '@ui';
import { useAppSelector } from '../../services/store';

export const IngredientDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { items: ingredients } = useAppSelector((state) => state.ingredients);

  const ingredient = ingredients.find((item) => item._id === id);

  if (!ingredient) return <div>Ingredient not found</div>;

  return <IngredientDetailsUI ingredientData={ingredient} />;
};
