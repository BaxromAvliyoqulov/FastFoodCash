import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// ─── Offline fallback foydalanuvchilar ─────────────────────────────────────────
// Backend ishlamasa ham kassa TO'XTAMASLIGI kerak!
// Bu seed.ts dagi foydalanuvchilar bilan bir xil.
const OFFLINE_USERS: Array<{ id: string; fullName: string; phone: string; pinCode: string; role: string }> = [
  { id: 'offline-admin',    fullName: 'Admin',    phone: '998901234567', pinCode: '7777', role: 'ADMIN' },
  { id: 'offline-kassir-1', fullName: 'Kassir 1', phone: '998901111111', pinCode: '1111', role: 'CASHIER' },
  { id: 'offline-kassir-2', fullName: 'Kassir 2', phone: '998909876543', pinCode: '2222', role: 'CASHIER' },
];

// Login freezing oldini olish uchun 3s timeout (5s emas — mijoz kutib turmaydi!)
async function fetchWithTimeout(url: string, options?: RequestInit, timeoutMs = 3000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('OFFLINE');
    throw err;
  }
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(localStorage.getItem('doston_pos_auth') === 'true');
  const user = ref<{ id: string; fullName: string; phone: string; role: string } | null>(
    JSON.parse(localStorage.getItem('doston_pos_user') || 'null')
  );
  const isOfflineMode = ref(false);

  const isAdmin = computed(() => user.value?.role === 'ADMIN');
  const isCashier = computed(() => user.value?.role === 'CASHIER');

  // ─── Offline PIN tekshirish ─────────────────────────────────────────────────
  // Avval localStorage'dagi backenddan kelgan userlarni tekshiradi,
  // agar topilmasa — hardcoded OFFLINE_USERS dan qidiradi.
  function offlineLoginByPin(pinCode: string): { success: boolean; user?: any; error?: string } {
    // 1. localStorage'dagi oldingi muvaffaqiyatli loginlardan qidirish
    const cachedUsers = JSON.parse(localStorage.getItem('doston_pos_known_users') || '[]');
    const cachedMatch = cachedUsers.find((u: any) => u.pinCode === pinCode);
    if (cachedMatch) {
      const { pinCode: _, ...safeUser } = cachedMatch;
      return { success: true, user: safeUser };
    }

    // 2. Hardcoded offline fallback foydalanuvchilar
    const offlineMatch = OFFLINE_USERS.find(u => u.pinCode === pinCode);
    if (offlineMatch) {
      const { pinCode: _, ...safeUser } = offlineMatch;
      return { success: true, user: safeUser };
    }

    return { success: false, error: 'PIN kod noto\'g\'ri!' };
  }

  async function loginByPin(pinCode: string) {
    // ═══════════════════════════════════════════════════════════════════════════
    // 1-QADAM: Backend'ga ulanishga harakat qilish (3 soniya limit)
    // ═══════════════════════════════════════════════════════════════════════════
    try {
      const response = await fetchWithTimeout(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinCode })
      });
      
      const body = await response.json();
      
      if (!response.ok || !body.success) {
        // Backend javob berdi, lekin PIN noto'g'ri
        return { success: false, error: body.error || 'PIN kod noto\'g\'ri!' };
      }

      const data = body.data;

      isAuthenticated.value = true;
      isOfflineMode.value = false;
      user.value = data.user;
      localStorage.setItem('doston_pos_auth', 'true');
      localStorage.setItem('doston_pos_user', JSON.stringify(data.user));
      
      // Muvaffaqiyatli loginni keshga saqlash (keyingi offline login uchun)
      _cacheUserForOffline(data.user, pinCode);
      
      return { success: true, user: data.user, activeShift: data.activeShift };
    } catch (_backendError: any) {
      // ═════════════════════════════════════════════════════════════════════════
      // 2-QADAM: Backend offline — offline fallback login
      // ═════════════════════════════════════════════════════════════════════════
      console.warn('Backend offline. Offline login ishlatilmoqda...');
      
      const offlineResult = offlineLoginByPin(pinCode);
      
      if (offlineResult.success && offlineResult.user) {
        isAuthenticated.value = true;
        isOfflineMode.value = true;
        user.value = offlineResult.user;
        localStorage.setItem('doston_pos_auth', 'true');
        localStorage.setItem('doston_pos_user', JSON.stringify(offlineResult.user));
        
        return { success: true, user: offlineResult.user, offline: true };
      }

      return { success: false, error: offlineResult.error || 'PIN kod noto\'g\'ri!' };
    }
  }

  // Backend login muvaffaqiyatli bo'lganda — userni keshga saqlash
  function _cacheUserForOffline(userData: any, pinCode: string) {
    try {
      const cachedUsers = JSON.parse(localStorage.getItem('doston_pos_known_users') || '[]');
      const existingIndex = cachedUsers.findIndex((u: any) => u.id === userData.id);
      const cacheEntry = { ...userData, pinCode };
      
      if (existingIndex > -1) {
        cachedUsers[existingIndex] = cacheEntry;
      } else {
        cachedUsers.push(cacheEntry);
      }
      localStorage.setItem('doston_pos_known_users', JSON.stringify(cachedUsers));
    } catch (e) {
      console.warn('Failed to cache user for offline:', e);
    }
  }

  function logout() {
    isAuthenticated.value = false;
    isOfflineMode.value = false;
    user.value = null;
    localStorage.removeItem('doston_pos_auth');
    localStorage.removeItem('doston_pos_user');
  }

  return {
    isAuthenticated,
    isOfflineMode,
    user,
    isAdmin,
    isCashier,
    loginByPin,
    logout
  };
});
