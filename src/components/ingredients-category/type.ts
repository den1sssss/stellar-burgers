import { TIngredient } from '@utils-types';

export type TIngredientsCategoryProps = {
  title: string;
  titleRef: React.RefObject<HTMLHeadingElement>;
  ingredients: TIngredient[];
  onIngredientClick: (id: string) => void;
  ingredientCounts: { [key: string]: number };
};
