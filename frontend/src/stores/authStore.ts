import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// Login freezing oldini olish uchun 5s timeout
async function fetchWithTimeout(url: string, options?: RequestInit, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('Serverga ulanib bo\'lmadi (5s timeout). Internet yoki backend offline.');
    throw err;
  }
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(localStorage.getItem('doston_pos_auth') === 'true');
  const user = ref<{ id: string; fullName: string; phone: string; role: string } | null>(
    JSON.parse(localStorage.getItem('doston_pos_user') || 'null')
  );

  const isAdmin = computed(() => user.value?.role === 'ADMIN');
  const isCashier = computed(() => user.value?.role === 'CASHIER');

  async function loginByPin(pinCode: string) {
    try {
      const response = await fetchWithTimeout(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinCode })
      });
      
      const body = await response.json();
      
      if (!response.ok || !body.success) {
        throw new Error(body.error || 'Server xatoligi');
      }

      const data = body.data;

      isAuthenticated.value = true;
      user.value = data.user;
      localStorage.setItem('doston_pos_auth', 'true');
      localStorage.setItem('doston_pos_user', JSON.stringify(data.user));
      
      return { success: true, user: data.user, activeShift: data.activeShift };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  function logout() {
    isAuthenticated.value = false;
    user.value = null;
    localStorage.removeItem('doston_pos_auth');
    localStorage.removeItem('doston_pos_user');
  }

  return {
    isAuthenticated,
    user,
    isAdmin,
    isCashier,
    loginByPin,
    logout
  };
});
