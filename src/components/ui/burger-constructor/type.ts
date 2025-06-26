import { TOrder, TIngredient, TConstructorIngredient } from '@utils-types';

export type ConstructorItems = {
  bun: TIngredient | null;
  ingredients: TConstructorIngredient[];
};

export type BurgerConstructorProps = {
  price: number;
  orderRequest: boolean;
  constructorItems: ConstructorItems;
  orderModalData: any; // уточнить тип, если возможно
  onOrderClick: () => void;
  closeOrderModal: () => void;
};
