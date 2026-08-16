import type { Ingredient } from '../../types/pos';

export const initialIngredients: Ingredient[] = [
  // --- XAMIR VA NONLAR (BREAD & DOUGH) ---
  { id: 'ing-2', name: 'Burger Bulochkasi', unit: 'PIECE', currentStock: 100, costPerUnit: 2000, minThreshold: 30 },
  { id: 'ing-3', name: 'Lavash Xamiri (Standard)', unit: 'PIECE', currentStock: 150, costPerUnit: 2500, minThreshold: 50 },
  { id: 'ing-3-xl', name: 'Tandir Lavash Xamiri 50sm', unit: 'PIECE', currentStock: 80, costPerUnit: 4500, minThreshold: 30 },
  { id: 'ing-7', name: 'Pitta Noni (Pocket bread)', unit: 'PIECE', currentStock: 100, costPerUnit: 2500, minThreshold: 30 },
  { id: 'ing-8', name: 'Danar Noni / Doner Bread', unit: 'PIECE', currentStock: 50, costPerUnit: 2500, minThreshold: 20 },
  { id: 'ing-11', name: 'Sosiska Hot-Dog Noni', unit: 'PIECE', currentStock: 150, costPerUnit: 1500, minThreshold: 50 },
  { id: 'ing-14', name: 'Pizza Xamiri (30cm)', unit: 'PIECE', currentStock: 60, costPerUnit: 5000, minThreshold: 20 },

  // --- ICHIMLIKLAR (DRINKS) ---
  { id: 'ing-10', name: 'Coca-Cola 0.5L', unit: 'PIECE', currentStock: 50, costPerUnit: 6000, minThreshold: 20 },
  { id: 'ing-fanta-05', name: 'Fanta 0.5L', unit: 'PIECE', currentStock: 40, costPerUnit: 6000, minThreshold: 20 },
  { id: 'ing-sprite-05', name: 'Sprite 0.5L', unit: 'PIECE', currentStock: 40, costPerUnit: 6000, minThreshold: 20 },
  { id: 'ing-nestle-water', name: 'Nestle Suv 1.5L', unit: 'PIECE', currentStock: 60, costPerUnit: 3500, minThreshold: 20 },
  { id: 'ing-pepsi-razliv', name: 'Pepsi 0.5L', unit: 'PIECE', currentStock: 50, costPerUnit: 6000, minThreshold: 20 }
];
