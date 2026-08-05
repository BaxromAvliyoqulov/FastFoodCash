import { defineStore } from 'pinia';
import { ref } from 'vue';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(localStorage.getItem('doston_pos_auth') === 'true');
  const user = ref<{ id: string; fullName: string; phone: string; role: string } | null>(
    JSON.parse(localStorage.getItem('doston_pos_user') || 'null')
  );

  async function loginByPin(pinCode: string) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinCode })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Server xatoligi');
      }

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
    loginByPin,
    logout
  };
});
