import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../authStore';

// Mock fetch
const originalFetch = globalThis.fetch;

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('initializes with default values when localStorage is empty', () => {
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
    expect(store.isAdmin).toBe(false);
    expect(store.isCashier).toBe(false);
  });

  it('loads user from localStorage', () => {
    const mockUser = { id: '1', fullName: 'Test User', phone: '123', role: 'ADMIN' };
    localStorage.setItem('doston_pos_auth', 'true');
    localStorage.setItem('doston_pos_user', JSON.stringify(mockUser));

    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(true);
    expect(store.user).toEqual(mockUser);
    expect(store.isAdmin).toBe(true);
    expect(store.isCashier).toBe(false);
  });

  it('handles logout correctly', () => {
    const mockUser = { id: '1', fullName: 'Test User', phone: '123', role: 'CASHIER' };
    localStorage.setItem('doston_pos_auth', 'true');
    localStorage.setItem('doston_pos_user', JSON.stringify(mockUser));

    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(true);

    store.logout();

    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
    expect(localStorage.getItem('doston_pos_auth')).toBeNull();
    expect(localStorage.getItem('doston_pos_user')).toBeNull();
  });

  it('handles successful login', async () => {
    const mockUser = { id: '1', fullName: 'Cashier 1', phone: '12345', role: 'CASHIER' };
    
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          user: mockUser,
          activeShift: null
        }
      })
    });

    const store = useAuthStore();
    const result = await store.loginByPin('1234');
    
    expect(result.success).toBe(true);
    expect(store.isAuthenticated).toBe(true);
    expect(store.user).toEqual(mockUser);
    expect(localStorage.getItem('doston_pos_auth')).toBe('true');
  });

  it('handles failed login', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({
        success: false,
        error: 'Noto\'g\'ri PIN kod'
      })
    });

    const store = useAuthStore();
    const result = await store.loginByPin('9999');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Noto\'g\'ri PIN kod');
    expect(store.isAuthenticated).toBe(false);
  });
});
