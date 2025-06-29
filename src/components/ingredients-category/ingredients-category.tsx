import { forwardRef } from 'react';
import { TIngredientsCategoryProps } from './type';
import { IngredientsCategoryUI } from '../ui/ingredients-category';
import { useAppSelector } from '../../services/store';

export const IngredientsCategory = forwardRef<
  HTMLUListElement,
  TIngredientsCategoryProps
>(({ title, titleRef, ingredients, ingredientCounts }, ref) => (
  <IngredientsCategoryUI
    title={title}
    titleRef={titleRef}
    ingredients={ingredients}
    ingredientCounts={ingredientCounts}
    ref={ref}
  />
));
