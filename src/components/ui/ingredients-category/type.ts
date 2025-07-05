import { TIngredient } from '@utils-types';

export type TIngredientsCategoryUIProps = {
  title: string;
  titleRef: React.RefObject<HTMLHeadingElement>;
  ingredients: TIngredient[];
  ingredientCounts: { [key: string]: number };
};
