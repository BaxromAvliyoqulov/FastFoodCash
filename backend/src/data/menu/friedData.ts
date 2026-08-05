import type { Product } from '../../types/pos';

export const friedProducts: Product[] = [
  {
    id: 'prod-frd-1',
    categoryId: 'cat-fried',
    categoryName: 'Qovurilganlar & Sneklar',
    name: 'Classic Fri',
    price: 18000,
    imageUrl: '/images/food/classic_fri.jpg',
    recipe: [
      { ingredientId: 'ing-9', ingredientName: 'Kartoshka Frite', quantityRequired: 0.150, unit: 'KG' }
    ]
  },
  {
    id: 'prod-frd-2',
    categoryId: 'cat-fried',
    categoryName: 'Qovurilganlar & Sneklar',
    name: 'Jaydari Fri',
    price: 20000,
    imageUrl: '/images/food/jaydari_fri.jpg',
    recipe: [
      { ingredientId: 'ing-9', ingredientName: 'Kartoshka Frite', quantityRequired: 0.180, unit: 'KG' }
    ]
  },
  {
    id: 'prod-frd-3',
    categoryId: 'cat-fried',
    categoryName: 'Qovurilganlar & Sneklar',
    name: 'KFC (Portsiya)',
    price: 25000,
    imageUrl: '/images/hotdog/kfc_chicken.png',
    recipe: [
      { ingredientId: 'ing-12', ingredientName: 'KFC Tovuq Qanotlari', quantityRequired: 0.250, unit: 'KG' }
    ]
  },
  {
    id: 'prod-frd-4',
    categoryId: 'cat-fried',
    categoryName: 'Qovurilganlar & Sneklar',
    name: 'KFC (1 KG)',
    price: 85000,
    imageUrl: '/images/hotdog/kfc_chicken.png',
    recipe: [
      { ingredientId: 'ing-12', ingredientName: 'KFC Tovuq Qanotlari', quantityRequired: 1.000, unit: 'KG' }
    ]
  },
  {
    id: 'prod-frd-5',
    categoryId: 'cat-fried',
    categoryName: 'Qovurilganlar & Sneklar',
    name: 'Baliq Okean',
    price: 70000,
    imageUrl: '/images/fried/baliq_okean.png',
    recipe: [
      { ingredientId: 'ing-13', ingredientName: 'Baliq Okean (File)', quantityRequired: 0.400, unit: 'KG' }
    ]
  }
];
