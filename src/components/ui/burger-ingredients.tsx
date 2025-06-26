import { RefObject } from 'react';
import { TIngredient, TTabMode } from '../../utils/types';
import { Tab } from '@zlden/react-developer-burger-ui-components';
import { IngredientsCategory } from '../ingredients-category';
import styles from './burger-ingredients/burger-ingredients.module.css';

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
}) => (
  <section className={styles.burger_ingredients}>
    <nav>
      <ul className={styles.menu}>
        <Tab value='bun' active={currentTab === 'bun'} onClick={onTabClick}>
          Булки
        </Tab>
        <Tab value='main' active={currentTab === 'main'} onClick={onTabClick}>
          Начинки
        </Tab>
        <Tab value='sauce' active={currentTab === 'sauce'} onClick={onTabClick}>
          Соусы
        </Tab>
      </ul>
    </nav>
    <div className={styles.content}>
      <IngredientsCategory
        title='Булки'
        titleRef={titleBunRef}
        ingredients={buns}
        ref={bunsRef}
      />
      <IngredientsCategory
        title='Начинки'
        titleRef={titleMainRef}
        ingredients={mains}
        ref={mainsRef}
      />
      <IngredientsCategory
        title='Соусы'
        titleRef={titleSaucesRef}
        ingredients={sauces}
        ref={saucesRef}
      />
    </div>
  </section>
);
