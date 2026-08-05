import type { Product } from '../../types/pos';

export const coffeeProducts: Product[] = [
  {
    id: 'prod-cof-1',
    categoryId: 'cat-coffee',
    categoryName: 'Coffee Menu',
    name: 'Choco coffee',
    price: 10000,
    imageUrl: '/images/food/choco_coffee.jpg',
    recipe: []
  },
  {
    id: 'prod-cof-2',
    categoryId: 'cat-coffee',
    categoryName: 'Coffee Menu',
    name: 'Qora jacobs',
    price: 10000,
    imageUrl: '/images/food/qora_jacobs.jpg',
    recipe: []
  },
  {
    id: 'prod-cof-3',
    categoryId: 'cat-coffee',
    categoryName: 'Coffee Menu',
    name: 'Capupuccino',
    price: 10000,
    imageUrl: '/images/food/cappuccino.jpg',
    recipe: []
  },
  {
    id: 'prod-cof-4',
    categoryId: 'cat-coffee',
    categoryName: 'Coffee Menu',
    name: 'Maccoffee 3b1',
    price: 8000,
    imageUrl: '/images/food/maccoffee_3in1.jpg',
    recipe: []
  }
];
