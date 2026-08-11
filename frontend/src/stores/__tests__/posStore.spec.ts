import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePosStore } from '../posStore';
import type { Product, Modifier } from '../../types/pos';

describe('POS Store - Cart & Operation Mode Logic', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  const sampleProduct: Product = {
    id: 'prod-1',
    categoryId: 'cat-1',
    categoryName: 'Burgerlar',
    name: 'Gamburger',
    price: 25000,
    imageUrl: '/images/food/gamburger.jpg',
    recipe: [],
    availableModifiers: []
  };

  const sampleModifier: Modifier = {
    id: 'mod-1',
    name: 'Pishloq (Cheese)',
    price: 5000
  };

  it('adds items to SABOY cart correctly', () => {
    const store = usePosStore();
    expect(store.cart.length).toBe(0);

    store.addToCart(sampleProduct);
    expect(store.cart.length).toBe(1);
    expect(store.cart[0].product.name).toBe('Gamburger');
    expect(store.cart[0].quantity).toBe(1);
    expect(store.cartSubtotal).toBe(25000);
  });

  it('adds items with modifiers and updates subtotal', () => {
    const store = usePosStore();
    store.addToCart(sampleProduct, [sampleModifier]);

    expect(store.cart.length).toBe(1);
    expect(store.cart[0].unitPrice).toBe(30000); // 25000 + 5000
    expect(store.cartSubtotal).toBe(30000);
  });

  it('increments quantity when same product is added twice', () => {
    const store = usePosStore();
    store.addToCart(sampleProduct);
    store.addToCart(sampleProduct);

    expect(store.cart.length).toBe(1);
    expect(store.cart[0].quantity).toBe(2);
    expect(store.cartSubtotal).toBe(50000);
  });

  it('clears SABOY cart', () => {
    const store = usePosStore();
    store.addToCart(sampleProduct);
    expect(store.cart.length).toBe(1);

    store.clearCart();
    expect(store.cart.length).toBe(0);
    expect(store.cartSubtotal).toBe(0);
  });

  it('handles operation mode switching', () => {
    const store = usePosStore();
    expect(store.operationMode).toBe('ZAL');

    store.setOperationMode('SABOY');
    expect(store.operationMode).toBe('SABOY');
    expect(localStorage.getItem('doston_pos_mode')).toBe('SABOY');
  });
});
