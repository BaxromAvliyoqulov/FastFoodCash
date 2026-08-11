import type { Product } from '../../types/pos';

export const burgerProducts: Product[] = [
  {
    id: 'prod-burg-1',
    categoryId: 'cat-burger',
    categoryName: 'Burger',
    name: 'Gamburger',
    price: 35000,
    imageUrl: '/images/burger/gamburger.webp',
    recipe: [
      { ingredientId: 'ing-2', ingredientName: 'Burger Bulochkasi', quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-1', ingredientName: "Mol Go'shti Kotletasi", quantityRequired: 1, unit: 'PIECE' }
    ]
  },
  {
    id: 'prod-burg-2',
    categoryId: 'cat-burger',
    categoryName: 'Burger',
    name: 'Chesse Burger',
    price: 37000,
    imageUrl: '/images/burger/cheeseburger.webp',
    recipe: [
      { ingredientId: 'ing-2', ingredientName: 'Burger Bulochkasi', quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-1', ingredientName: "Mol Go'shti Kotletasi", quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-6', ingredientName: "Cheeseburger Pishlog'i", quantityRequired: 1, unit: 'PIECE' }
    ]
  },
  {
    id: 'prod-burg-3',
    categoryId: 'cat-burger',
    categoryName: 'Burger',
    name: 'Dablburger',
    price: 40000,
    imageUrl: '/images/food/dablburger.jpg',
    recipe: [
      { ingredientId: 'ing-2', ingredientName: 'Burger Bulochkasi', quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-1', ingredientName: "Mol Go'shti Kotletasi", quantityRequired: 2, unit: 'PIECE' }
    ]
  },
  {
    id: 'prod-burg-4',
    categoryId: 'cat-burger',
    categoryName: 'Burger',
    name: 'Dabl Chesse Burger',
    price: 42000,
    imageUrl: '/images/food/dabl_cheese_burger.jpg',
    recipe: [
      { ingredientId: 'ing-2', ingredientName: 'Burger Bulochkasi', quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-1', ingredientName: "Mol Go'shti Kotletasi", quantityRequired: 2, unit: 'PIECE' },
      { ingredientId: 'ing-6', ingredientName: "Cheeseburger Pishlog'i", quantityRequired: 2, unit: 'PIECE' }
    ]
  },
  {
    id: 'prod-burg-5',
    categoryId: 'cat-burger',
    categoryName: 'Burger',
    name: 'Burger King',
    price: 37000,
    imageUrl: '/images/food/burger_king.jpg',
    recipe: [
      { ingredientId: 'ing-2', ingredientName: 'Burger Bulochkasi', quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-1', ingredientName: "Mol Go'shti Kotletasi", quantityRequired: 1, unit: 'PIECE' }
    ]
  },
  {
    id: 'prod-burg-6',
    categoryId: 'cat-burger',
    categoryName: 'Burger',
    name: 'KFC Burger',
    price: 30000,
    imageUrl: '/images/food/kfc_burger.jpg',
    recipe: [
      { ingredientId: 'ing-2', ingredientName: 'Burger Bulochkasi', quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-5', ingredientName: "Tovuq Go'shti File", quantityRequired: 0.130, unit: 'KG' }
    ]
  },
  {
    id: 'prod-burg-7',
    categoryId: 'cat-burger',
    categoryName: 'Burger',
    name: 'Club Sandwich',
    price: 40000,
    imageUrl: '/images/burger/club_sandwich.webp',
    recipe: [
      { ingredientId: 'ing-5', ingredientName: "Tovuq Go'shti File", quantityRequired: 0.120, unit: 'KG' },
      { ingredientId: 'ing-9', ingredientName: 'Kartoshka Frite', quantityRequired: 0.100, unit: 'KG' }
    ]
  }
];
