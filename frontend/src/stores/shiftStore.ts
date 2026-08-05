import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Shift, ShiftCashAudit } from '../types/pos';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const useShiftStore = defineStore('shift', () => {
  const currentShift = ref<Shift | null>(null);
  const shiftAudits = ref<ShiftCashAudit[]>([]);
  const managerPin = '7777'; // Mock Manager Verification PIN

  const isShiftOpen = computed(() => currentShift.value?.status === 'OPEN');

  async function fetchActiveShift() {
    const authStore = useAuthStore();
    if (!authStore.user) return;
    try {
      const res = await fetch(`${API_URL}/shifts/active?cashierId=${authStore.user.id}`);
      const data = await res.json();
      if (data.activeShift) {
        currentShift.value = {
          ...data.activeShift,
          expenses: currentShift.value?.expenses || []
        };
      } else {
        currentShift.value = null;
      }
    } catch (e) {
      console.error('Fetch active shift error:', e);
    }
  }

  async function openShift(initialCash: number, cashierName: string = 'ADMIN') {
    const authStore = useAuthStore();
    if (!authStore.user) return;
    try {
      const res = await fetch(`${API_URL}/shifts/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cashierId: authStore.user.id, initialCash })
      });
      const data = await res.json();
      if (res.ok) {
        currentShift.value = { ...data.shift, cashierName: authStore.user.fullName, expenses: [] };
      } else {
        alert(data.error || 'Smena ochishda xatolik');
      }
    } catch (e) {
      console.error(e);
    }
  }

  function addExpense(amount: number, reason: string) {
    if (currentShift.value && currentShift.value.status === 'OPEN') {
      currentShift.value.expenses = currentShift.value.expenses || [];
      currentShift.value.expenses.push({
        id: 'exp-' + Date.now(),
        amount,
        reason,
        time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
      });
    }
  }

  async function closeShiftBlindReconciliation(declaredCash: number, declaredCard: number, declaredQr: number, notes?: string) {
    if (!currentShift.value) return null;
    try {
      const res = await fetch(`${API_URL}/shifts/close-blind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftId: currentShift.value.id,
          declaredCash,
          declaredCard,
          declaredQr,
          notes
        })
      });
      const data = await res.json();
      if (res.ok) {
        shiftAudits.value.unshift(data.audit);
        currentShift.value = null;
        return data.audit;
      } else {
        alert(data.error || 'Xatolik');
        return null;
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  function verifyManagerPin(pin: string): boolean {
    return pin === managerPin;
  }

  return {
    currentShift,
    shiftAudits,
    isShiftOpen,
    fetchActiveShift,
    openShift,
    addExpense,
    closeShiftBlindReconciliation,
    verifyManagerPin
  };
});
