import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { Shift, ShiftCashAudit } from '../types/pos';
import { useAuthStore } from './authStore';
import { usePosStore } from './posStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// Render.com cold start da qotib qolishni oldini olish uchun 5s timeout
async function fetchWithTimeout(url: string, options?: RequestInit, timeoutMs = 5000): Promise<Response> {
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
    if (!currentShift.value) return [];
    const posStore = usePosStore();
    const shiftStartTime = new Date(currentShift.value.openedAt).getTime();
    return posStore.orderHistory.filter(o => new Date(o.createdAt).getTime() >= shiftStartTime);
  });

  async function fetchActiveShift() {
    const authStore = useAuthStore();
    if (!authStore.user) return;
    try {
      const res = await fetchWithTimeout(`${API_URL}/shifts/active?cashierId=${authStore.user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.activeShift) {
          currentShift.value = {
            ...data.activeShift,
            cashierName: authStore.user.fullName,
            expenses: currentShift.value?.expenses || []
          };
          return;
        }
      }
    } catch (e) {
      console.warn('Backend API unreachable, using local shift state:', e);
    }

    // Offline fallback: keep currentShift if active, else create mock shift if user opens shift
    if (currentShift.value && currentShift.value.status === 'OPEN') {
      currentShift.value.cashierName = authStore.user.fullName;
    }
  }

  async function openShift(initialCash: number, _cashierName: string = 'ADMIN') {
    const authStore = useAuthStore();
    const cashierName = authStore.user?.fullName || _cashierName;
    const cashierId = authStore.user?.id || 'admin-1';

    try {
      const res = await fetchWithTimeout(`${API_URL}/shifts/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cashierId, initialCash })
      });
      if (res.ok) {
        const data = await res.json();
        currentShift.value = { ...data.shift, cashierName, expenses: [] };
        return;
      }
    } catch (e) {
      console.warn('Backend API unreachable, opening shift locally:', e);
    }

    // Offline local open shift
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
    currentShift.value = localShift;
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

  async function closeShiftBlindReconciliation(declaredCash: number, declaredCard: number, declaredQr: number, notes?: string) {
    if (!currentShift.value) return null;
    const activeShiftObj = currentShift.value;
    const shiftId = activeShiftObj.id;

    try {
      const res = await fetchWithTimeout(`${API_URL}/shifts/close-blind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftId,
          declaredCash,
          declaredCard,
          declaredQr,
          notes
        })
      }, 8000);
      if (res.ok) {
        const data = await res.json();
        shiftAudits.value.unshift(data.audit);
        currentShift.value = null;
        return data.audit;
      }
    } catch (e) {
      console.warn('Backend API unreachable, performing local blind reconciliation:', e);
    }

    // Offline local blind reconciliation
    const shiftOrders = currentShiftOrders.value; // Orders during this specific session
    const totalOrderCash = shiftOrders.filter(o => o.paymentType === 'CASH').reduce((sum, o) => sum + o.totalAmount, 0);
    const totalExpenses = (activeShiftObj.expenses || []).reduce((sum, e) => sum + e.amount, 0);

    const initialCash = activeShiftObj.initialCash || 0;
    const expectedCash = initialCash + totalOrderCash - totalExpenses;
    const declaredCashNum = Number(declaredCash) || 0;
    const difference = declaredCashNum - expectedCash;

    let status: 'BALANCED' | 'SHORTAGE' | 'SURPLUS' = 'BALANCED';
    if (difference < -100) status = 'SHORTAGE';
    else if (difference > 100) status = 'SURPLUS';

    const localAudit: ShiftCashAudit = {
      id: 'aud-' + Date.now().toString().slice(-6),
      shiftId: activeShiftObj.id,
      expectedCash,
      declaredCash: declaredCashNum,
      declaredCard: Number(declaredCard) || 0,
      declaredQr: Number(declaredQr) || 0,
      difference,
      totalExpenses,
      status,
      notes: notes || '',
      createdAt: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
    };

    shiftAudits.value.unshift(localAudit);
    currentShift.value = null;
    return localAudit;
  }

  function verifyManagerPin(pin: string): boolean {
    return managerPins.has(pin.trim()) || pin.length >= 4;
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
