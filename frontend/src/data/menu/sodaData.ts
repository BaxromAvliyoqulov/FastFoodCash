import type { Product } from '../../types/pos';

export const sodaProducts: Product[] = [
  // ─── COCA-COLA ───────────────────────────────
  {
    id: 'prod-drk-cola-05',
    categoryId: 'cat-cola',
    categoryName: 'Coca-Cola',
    name: 'Coca-Cola 0.5L',
    price: 10000,
    imageUrl: '/images/food/coca_cola_05.jpg',
    recipe: [{ ingredientId: 'ing-10', ingredientName: 'Coca-Cola 0.5L', quantityRequired: 1, unit: 'PIECE' }]
  },
  {
    id: 'prod-drk-cola-1',
    categoryId: 'cat-cola',
    categoryName: 'Coca-Cola',
    name: 'Coca-Cola 1L',
    price: 15000,
    imageUrl: '/images/food/coca_cola_1l.jpg',
    recipe: []
  },
  {
    id: 'prod-drk-cola-15',
    categoryId: 'cat-cola',
    categoryName: 'Coca-Cola',
    name: 'Coca-Cola 1.5L',
    price: 20000,
    imageUrl: '/images/food/coca_cola_15l.jpg',
    recipe: []
  },
  {
    id: 'prod-drk-cola-2l',
    categoryId: 'cat-cola',
    categoryName: 'Coca-Cola',
    name: 'Coca-Cola 2L',
    price: 20000,
    imageUrl: '/images/food/coca_cola_15l.jpg',
    recipe: []
  },
  {
    id: 'prod-drk-cola-bot',
    categoryId: 'cat-cola',
    categoryName: 'Coca-Cola',
    name: 'Coca-Cola Butulka',
    price: 10000,
    imageUrl: '/images/food/coca_cola_butulka.jpg',
    recipe: []
  },

  // ─── FANTA ───────────────────────────────────
  {
    id: 'prod-drk-fanta-05',
    categoryId: 'cat-fanta',
    categoryName: 'Fanta',
    name: 'Fanta 0.5L',
    price: 10000,
    imageUrl: '/images/food/fanta_05.jpg',
    recipe: []
  },
  {
    id: 'prod-drk-fanta-1',
    categoryId: 'cat-fanta',
    categoryName: 'Fanta',
    name: 'Fanta 1L',
    price: 15000,
    imageUrl: '/images/food/fanta_1l.jpg',
    recipe: []
  },
  {
    id: 'prod-drk-fanta-15',
    categoryId: 'cat-fanta',
    categoryName: 'Fanta',
    name: 'Fanta 1.5L',
    price: 20000,
    imageUrl: '/images/food/fanta_15l.jpg',
    recipe: []
  },
  {
    id: 'prod-drk-fanta-2l',
    categoryId: 'cat-fanta',
    categoryName: 'Fanta',
    name: 'Fanta 2L',
    price: 20000,
    imageUrl: '/images/food/fanta_15l.jpg',
    recipe: []
  },

  // ─── PEPSI ───────────────────────────────────
  {
    id: 'prod-drk-pepsi-05',
    categoryId: 'cat-pepsi',
    categoryName: 'Pepsi',
    name: 'Pepsi 0.5L',
    price: 10000,
    imageUrl: '/images/food/pepsi_05.jpg',
    recipe: []
  },
  {
    id: 'prod-drk-pepsi-1',
    categoryId: 'cat-pepsi',
    categoryName: 'Pepsi',
    name: 'Pepsi 1L',
    price: 15000,
    imageUrl: '/images/food/pepsi_1l.jpg',
    recipe: []
  },
  {
    id: 'prod-drk-pepsi-15',
    categoryId: 'cat-pepsi',
    categoryName: 'Pepsi',
    name: 'Pepsi 1.5L',
    price: 20000,
    imageUrl: '/images/food/pepsi_15l.jpg',
    recipe: []
  },
  {
    id: 'prod-drk-pepsi-2l',
    categoryId: 'cat-pepsi',
    categoryName: 'Pepsi',
    name: 'Pepsi 2L',
    price: 20000,
    imageUrl: '/images/food/pepsi_15l.jpg',
    recipe: []
  },
  {
    id: 'prod-drk-pepsi-bot',
    categoryId: 'cat-pepsi',
    categoryName: 'Pepsi',
    name: 'Pepsi Butulka',
    price: 10000,
    imageUrl: '/images/food/pepsi_butulka.jpg',
    recipe: []
  }
];

