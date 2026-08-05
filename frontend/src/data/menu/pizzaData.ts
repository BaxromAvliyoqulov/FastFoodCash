import type { Product } from '../../types/pos';

export const pizzaProducts: Product[] = [
  {
    id: 'prod-piz-1',
    categoryId: 'cat-pizza',
    categoryName: 'Pizza',
    name: "Go'shtli va Assorti Pizza",
    price: 78000,
    imageUrl: '/images/food/goshtli_assorti_pizza.jpg',
    recipe: [
      { ingredientId: 'ing-14', ingredientName: 'Pizza Xamiri', quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-15', ingredientName: 'Mozzarella Pishloq', quantityRequired: 0.180, unit: 'KG' },
      { ingredientId: 'ing-4', ingredientName: "Mol Go'shti (Marinovka)", quantityRequired: 0.150, unit: 'KG' }
    ]
  },
  {
    id: 'prod-piz-2',
    categoryId: 'cat-pizza',
    categoryName: 'Pizza',
    name: 'Alfredo Pizza',
    price: 75000,
    imageUrl: '/images/food/alfredo_pizza.jpg',
    recipe: [
      { ingredientId: 'ing-14', ingredientName: 'Pizza Xamiri', quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-15', ingredientName: 'Mozzarella Pishloq', quantityRequired: 0.180, unit: 'KG' },
      { ingredientId: 'ing-5', ingredientName: "Tovuq Go'shti File", quantityRequired: 0.150, unit: 'KG' }
    ]
  },
  {
    id: 'prod-piz-3',
    categoryId: 'cat-pizza',
    categoryName: 'Pizza',
    name: "Go'sht va Qo'ziqorin Pizza",
    price: 85000,
    imageUrl: '/images/food/gosht_qoziqorin_pizza.jpg',
    recipe: [
      { ingredientId: 'ing-14', ingredientName: 'Pizza Xamiri', quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-15', ingredientName: 'Mozzarella Pishloq', quantityRequired: 0.180, unit: 'KG' },
      { ingredientId: 'ing-4', ingredientName: "Mol Go'shti (Marinovka)", quantityRequired: 0.150, unit: 'KG' }
    ]
  },
  {
    id: 'prod-piz-4',
    categoryId: 'cat-pizza',
    categoryName: 'Pizza',
    name: 'Donar Pizza (XIT SOTUVDA)',
    price: 85000,
    imageUrl: '/images/pizza/donar_pizza.png',
    recipe: [
      { ingredientId: 'ing-14', ingredientName: 'Pizza Xamiri', quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-15', ingredientName: 'Mozzarella Pishloq', quantityRequired: 0.180, unit: 'KG' },
      { ingredientId: 'ing-4', ingredientName: "Mol Go'shti (Marinovka)", quantityRequired: 0.160, unit: 'KG' }
    ]
  },
  {
    id: 'prod-piz-5',
    categoryId: 'cat-pizza',
    categoryName: 'Pizza',
    name: "Go'sht va Achchiq Pizza",
    price: 78000,
    imageUrl: '/images/food/gosht_achchiq_pizza.jpg',
    recipe: [
      { ingredientId: 'ing-14', ingredientName: 'Pizza Xamiri', quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-15', ingredientName: 'Mozzarella Pishloq', quantityRequired: 0.180, unit: 'KG' }
    ]
  },
  {
    id: 'prod-piz-6',
    categoryId: 'cat-pizza',
    categoryName: 'Pizza',
    name: 'Peperoniy Pizza',
    price: 78000,
    imageUrl: '/images/food/peperoniy_pizza.jpg',
    recipe: [
      { ingredientId: 'ing-14', ingredientName: 'Pizza Xamiri', quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-15', ingredientName: 'Mozzarella Pishloq', quantityRequired: 0.180, unit: 'KG' }
    ]
  },
  {
    id: 'prod-piz-7',
    categoryId: 'cat-pizza',
    categoryName: 'Pizza',
    name: 'Doston Brend Pizza',
    price: 85000,
    imageUrl: '/images/food/doston_brend_pizza.jpg',
    recipe: [
      { ingredientId: 'ing-14', ingredientName: 'Pizza Xamiri', quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-15', ingredientName: 'Mozzarella Pishloq', quantityRequired: 0.200, unit: 'KG' },
      { ingredientId: 'ing-4', ingredientName: "Mol Go'shti (Marinovka)", quantityRequired: 0.150, unit: 'KG' }
    ]
  }
];
