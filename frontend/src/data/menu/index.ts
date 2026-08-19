import type { Product } from '../../types/pos';
import { lavashProducts } from './lavashData';
import { burgerProducts } from './burgerData';
import { hotdogProducts } from './hotdogData';
import { friedProducts } from './friedData';
import { pizzaProducts } from './pizzaData';
import { saladProducts } from './saladsData';
import { dessertProducts } from './dessertsData';
import { coffeeProducts } from './coffeeData';
import { sodaProducts } from './sodaData';
import { drinksProducts } from './drinksData';
import { energyProducts } from './energyData';
import { juicesProducts } from './juicesData';

export { initialIngredients } from './ingredientsData';
export { initialCategories } from './categoriesData';
export { lavashProducts } from './lavashData';
export { burgerProducts } from './burgerData';
export { hotdogProducts } from './hotdogData';
export { friedProducts } from './friedData';
export { pizzaProducts } from './pizzaData';
export { saladProducts } from './saladsData';
export { dessertProducts } from './dessertsData';
export { coffeeProducts } from './coffeeData';
export { sodaProducts } from './sodaData';
export { drinksProducts } from './drinksData';
export { energyProducts } from './energyData';
export { juicesProducts } from './juicesData';

export const initialProducts: Product[] = [
  ...lavashProducts,
  ...burgerProducts,
  ...hotdogProducts,
  ...friedProducts,
  ...pizzaProducts,
  ...saladProducts,
  ...dessertProducts,
  ...coffeeProducts,
  ...sodaProducts,
  ...drinksProducts,
  ...energyProducts,
  ...juicesProducts
];

