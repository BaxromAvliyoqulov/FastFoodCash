import type { Product } from '../../types/pos';

export const lavashProducts: Product[] = [
  {
    id: 'prod-lav-1',
    categoryId: 'cat-lavash',
    categoryName: 'Lavash',
    name: 'Lavash (obichniy)',
    price: 35000,
    imageUrl: '/images/food/lavash_obichniy.jpg',
    recipe: [
      { ingredientId: 'ing-3', ingredientName: 'Lavash Xamiri', quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-4', ingredientName: "Mol Go'shti (Marinovka)", quantityRequired: 0.140, unit: 'KG' },
    ],
    availableModifiers: [
      { id: 'mod-1', name: "Pishloq qo'shish", price: 2000, ingredientDeduction: { ingredientId: 'ing-6', quantity: 1 } },
      { id: 'mod-2', name: 'Achiq Halapeno', price: 2000 }
    ]
  },
  {
    id: 'prod-lav-2',
    categoryId: 'cat-lavash',
    categoryName: 'Lavash',
    name: 'Pishloqli Lavash',
    price: 37000,
    imageUrl: '/images/lavash/pishloqli_lavash.png',
    recipe: [
      { ingredientId: 'ing-3', ingredientName: 'Lavash Xamiri', quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-4', ingredientName: "Mol Go'shti (Marinovka)", quantityRequired: 0.140, unit: 'KG' },
      { ingredientId: 'ing-6', ingredientName: "Cheeseburger Pishlog'i", quantityRequired: 1, unit: 'PIECE' },
    ]
  },
  {
    id: 'prod-lav-3',
    categoryId: 'cat-lavash',
    categoryName: 'Lavash',
    name: 'Achchiq Lavash',
    price: 37000,
    imageUrl: '/images/food/achchiq_lavash.jpg',
    recipe: [
      { ingredientId: 'ing-3', ingredientName: 'Lavash Xamiri', quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-4', ingredientName: "Mol Go'shti (Marinovka)", quantityRequired: 0.140, unit: 'KG' },
    ]
  },
  {
    id: 'prod-lav-4',
    categoryId: 'cat-lavash',
    categoryName: 'Lavash',
    name: 'Tandir Lavash (50 sm)',
    price: 45000,
    imageUrl: '/images/lavash/tandir_lavash_50cm.png',
    recipe: [
      { ingredientId: 'ing-3-xl', ingredientName: 'Tandir Lavash Xamiri 50sm', quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-4', ingredientName: "Mol Go'shti (Marinovka)", quantityRequired: 0.220, unit: 'KG' },
    ]
  },
  {
    id: 'prod-lav-5',
    categoryId: 'cat-lavash',
    categoryName: 'Lavash',
    name: 'Pitta',
    price: 35000,
    imageUrl: '/images/lavash/pitta.png',
    recipe: [
      { ingredientId: 'ing-7', ingredientName: 'Pitta Noni', quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-4', ingredientName: "Mol Go'shti (Marinovka)", quantityRequired: 0.130, unit: 'KG' },
    ]
  },
  {
    id: 'prod-lav-6',
    categoryId: 'cat-lavash',
    categoryName: 'Lavash',
    name: 'Danar',
    price: 33000,
    imageUrl: '/images/food/danar.jpg',
    recipe: [
      { ingredientId: 'ing-8', ingredientName: 'Danar Noni', quantityRequired: 1, unit: 'PIECE' },
      { ingredientId: 'ing-4', ingredientName: "Mol Go'shti (Marinovka)", quantityRequired: 0.120, unit: 'KG' },
    ]
  }
];
