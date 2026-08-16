import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { Shift, ShiftCashAudit } from '../types/pos';
import { useAuthStore } from './authStore';
import { usePosStore } from './posStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// Render.com cold start da qotib qolishni oldini olish uchun 3s timeout
async function fetchWithTimeout(url: string, options?: RequestInit, timeoutMs = 3000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('Backend timeout');
    throw err;
  }
}

export const useShiftStore = defineStore('shift', () => {
  const storedShift = localStorage.getItem('doston_current_shift');
  const storedAudits = localStorage.getItem('doston_shift_audits');

  const currentShift = ref<Shift | null>(storedShift ? JSON.parse(storedShift) : null);
  const shiftAudits = ref<ShiftCashAudit[]>(storedAudits ? JSON.parse(storedAudits) : []);
  const managerPins = new Set(['0000', '1111', '2222', '7777']); // Admin/Manager PINs

  const isShiftOpen = computed(() => currentShift.value?.status === 'OPEN');

  watch(currentShift, (newVal) => {
    if (newVal) {
      localStorage.setItem('doston_current_shift', JSON.stringify(newVal));
    } else {
      localStorage.removeItem('doston_current_shift');
    }
  }, { deep: true });

  watch(shiftAudits, (newVal) => {
    localStorage.setItem('doston_shift_audits', JSON.stringify(newVal));
  }, { deep: true });

  const currentShiftOrders = computed(() => {
    if (!currentShift.value || !currentShift.value.openedAt) return [];
    try {
      const posStore = usePosStore();
      const shiftStartTime = new Date(currentShift.value.openedAt).getTime();
      if (Number.isNaN(shiftStartTime)) return [];
      return (posStore.orderHistory || []).filter(o => {
        if (!o || !o.createdAt) return false;
        const t = new Date(o.createdAt).getTime();
        return !Number.isNaN(t) && t >= shiftStartTime;
      });
    } catch (err) {
      console.warn('Error computing currentShiftOrders:', err);
      return [];
    }
  });

  async function fetchActiveShift() {
    try {
      const res = await fetchWithTimeout(`${API_URL}/shifts/active`);
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data && body.data.activeShift) {
          const s = body.data.activeShift;
          const rawName = s.cashier?.fullName || s.cashierName || 'Admin';
          currentShift.value = {
            ...s,
            cashierName: rawName.replace(/baxrom\s*/i, '').trim() || 'Admin',
            expenses: s.expenses || currentShift.value?.expenses || []
          };
          return;
        }
      }
    } catch (e) {
      console.warn('Backend API unreachable, preserving local shift state:', e);
    }
  }

  // Chaqmoq tezligida (0ms instant UI update) markaziy smena ochish
  function openShift(initialCash: number, _cashierName: string = 'Admin') {
    const authStore = useAuthStore();
    const cashierName = authStore.isAdmin ? (authStore.user?.fullName || 'Admin') : 'Admin';
    const cashierId = authStore.user?.id || 'admin-1';

    const localShift: Shift = {
      id: 'shift-' + Date.now(),
      cashierName,
      openedAt: new Date().toISOString(),
      initialCash: Number(initialCash) || 0,
      status: 'OPEN',
      totalCashSales: 0,
      totalCardSales: 0,
      totalQrSales: 0,
      expenses: []
    };

    // Instant local state update
    currentShift.value = localShift;

    // Background async sync to backend API (non-blocking)
    fetchWithTimeout(`${API_URL}/shifts/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cashierId, initialCash })
    }).then(async (res) => {
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data?.shift?.id && currentShift.value) {
          currentShift.value.id = body.data.shift.id;
        }
      }
    }).catch(err => {
      console.warn('Background shift open sync warning:', err);
    });
  }

  function addExpense(amount: number, reason: string) {
    if (currentShift.value && currentShift.value.status === 'OPEN') {
      currentShift.value.expenses = currentShift.value.expenses || [];
      currentShift.value.expenses.push({
        id: 'exp-' + Date.now(),
        amount: Number(amount) || 0,
        reason,
        time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
      });
    }
  }

  function closeShiftBlindReconciliation(declaredCash: number, declaredCard: number, declaredQr: number, notes?: string): ShiftCashAudit {
    const activeShiftObj = currentShift.value || {
      id: 'shift-' + Date.now(),
      cashierName: 'Kassir',
      openedAt: new Date().toISOString(),
      initialCash: 0,
      status: 'OPEN' as const,
      totalCashSales: 0,
      totalCardSales: 0,
      totalQrSales: 0,
      expenses: []
    };

    const shiftOrders = currentShiftOrders.value;
    const totalOrderCash = shiftOrders.filter(o => o.paymentType === 'CASH').reduce((sum, o) => sum + o.totalAmount, 0);
    const totalExpenses = (activeShiftObj.expenses || []).reduce((sum, e) => sum + e.amount, 0);

    const initialCash = activeShiftObj.initialCash || 0;
    const expectedCash = initialCash + totalOrderCash - totalExpenses;
    const declaredCashNum = Number(declaredCash) || 0;
    const difference = declaredCashNum - expectedCash;

    let status: 'BALANCED' | 'SHORTAGE' | 'SURPLUS' = 'BALANCED';
    if (difference < -100) status = 'SHORTAGE';
    else if (difference > 100) status = 'SURPLUS';

    const audit: ShiftCashAudit = {
      id: 'aud-' + Date.now().toString().slice(-6),
      shiftId: activeShiftObj.id,
      expectedCash,
      declaredCash: declaredCashNum,
      declaredCard: Number(declaredCard) || 0,
      declaredQr: Number(declaredQr) || 0,
      totalExpenses,
      difference,
      status,
      notes: notes || '',
      createdAt: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    };

    // Instant local shift closure
    shiftAudits.value.unshift(audit);
    currentShift.value = null;
    localStorage.removeItem('doston_current_shift');

    // Background async sync to backend
    fetchWithTimeout(`${API_URL}/shifts/close-blind`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shiftId: activeShiftObj.id,
        declaredCash,
        declaredCard,
        declaredQr,
        notes,
        expenses: activeShiftObj.expenses || []
      })
    }).catch(err => {
      console.warn('Background shift close sync warning:', err);
    });

    return audit;
  }

  function verifyManagerPin(pin: string): boolean {
    return managerPins.has(pin);
  }

  return {
    currentShift,
    shiftAudits,
    isShiftOpen,
    currentShiftOrders,
    fetchActiveShift,
    openShift,
    addExpense,
    closeShiftBlindReconciliation,
    verifyManagerPin
  };
});
