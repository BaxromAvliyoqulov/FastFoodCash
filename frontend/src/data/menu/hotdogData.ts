import type { Product } from '../../types/pos';

export const hotdogProducts: Product[] = [
  {
    id: 'prod-hd-1',
    categoryId: 'cat-hotdog',
    categoryName: 'Hot Dog',
    name: 'HOT DOG CLASSIC',
    price: 15000,
    imageUrl: '/images/food/hot_dog_classic.jpg',
    recipe: [
      { ingredientId: 'ing-11', ingredientName: 'Sosiska Hot-Dog', quantityRequired: 1, unit: 'PIECE' }
    ]
  },
  {
    id: 'prod-hd-2',
    categoryId: 'cat-hotdog',
    categoryName: 'Hot Dog',
    name: 'HOT DOG KAROL',
    price: 25000,
    imageUrl: '/images/hotdog/hot_dog_karol.png',
    recipe: [
      { ingredientId: 'ing-11', ingredientName: 'Sosiska Hot-Dog', quantityRequired: 2, unit: 'PIECE' },
      { ingredientId: 'ing-6', ingredientName: "Cheeseburger Pishlog'i", quantityRequired: 1, unit: 'PIECE' }
    ]
  },
  {
    id: 'prod-hd-3',
    categoryId: 'cat-hotdog',
    categoryName: 'Hot Dog',
    name: 'HOT-LET DOG',
    price: 33000,
    imageUrl: '/images/hotdog/hotlet_dog.png',
    recipe: [
      { ingredientId: 'ing-1', ingredientName: "Mol Go'shti Kotletasi", quantityRequired: 1, unit: 'PIECE' }
    ]
  },
  {
    id: 'prod-hd-4',
    categoryId: 'cat-hotdog',
    categoryName: 'Hot Dog',
    name: "GO'SHT HOT-DOG",
    price: 33000,
    imageUrl: '/images/hotdog/gosht_hot_dog.png',
    recipe: [
      { ingredientId: 'ing-4', ingredientName: "Mol Go'shti (Marinovka)", quantityRequired: 0.120, unit: 'KG' }
    ]
  },
  {
    id: 'prod-hd-5',
    categoryId: 'cat-hotdog',
    categoryName: 'Hot Dog',
    name: 'CHICKEEN DOG',
    price: 33000,
    imageUrl: '/images/food/chickeen_dog.jpg',
    recipe: [
      { ingredientId: 'ing-5', ingredientName: "Tovuq Go'shti File", quantityRequired: 0.120, unit: 'KG' }
    ]
  }
];
