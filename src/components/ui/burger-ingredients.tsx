import { RefObject } from 'react';
import { TIngredient, TTabMode } from '../../utils/types';

export interface BurgerIngredientsUIProps {
  currentTab: TTabMode;
  buns: TIngredient[];
  mains: TIngredient[];
  sauces: TIngredient[];
  titleBunRef: RefObject<HTMLHeadingElement>;
  titleMainRef: RefObject<HTMLHeadingElement>;
  titleSaucesRef: RefObject<HTMLHeadingElement>;
  bunsRef: (node?: Element | null) => void;
  mainsRef: (node?: Element | null) => void;
  saucesRef: (node?: Element | null) => void;
  onTabClick: (tab: string) => void;
  onIngredientClick: (id: string) => void;
}

export const BurgerIngredientsUI: React.FC<BurgerIngredientsUIProps> = ({
  currentTab,
  buns,
  mains,
  sauces,
  titleBunRef,
  titleMainRef,
  titleSaucesRef,
  bunsRef,
  mainsRef,
  saucesRef,
  onTabClick,
  onIngredientClick
}) => <div>{/* Implement your UI here */}</div>;
