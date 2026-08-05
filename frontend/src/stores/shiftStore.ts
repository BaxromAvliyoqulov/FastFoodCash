import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Shift, ShiftCashAudit, Order } from '../types/pos';
import { usePosStore } from './posStore';

export const useShiftStore = defineStore('shift', () => {
  const currentShift = ref<Shift | null>({
    id: 'shift-1001',
    cashierName: 'Anvar Aliyev',
    openedAt: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    initialCash: 200000, // Float Cash (kassa boshlang'ich naqd puli)
    status: 'OPEN',
    totalCashSales: 0,
    totalCardSales: 0,
    totalQrSales: 0
  });

  const shiftAudits = ref<ShiftCashAudit[]>([]);
  const managerPin = '7777'; // Mock Manager Verification PIN

  const isShiftOpen = computed(() => currentShift.value?.status === 'OPEN');

  function openShift(initialCash: number, cashierName: string = 'Kassir #1') {
    currentShift.value = {
      id: 'shift-' + Date.now(),
      cashierName,
      openedAt: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      initialCash,
      status: 'OPEN',
      totalCashSales: 0,
      totalCardSales: 0,
      totalQrSales: 0
    };
  }

  // Perform Blind Cash Reconciliation (Ko'r-kassir Usulidagi Z-Report Auditi)
  function closeShiftBlindReconciliation(declaredCash: number, declaredCard: number, declaredQr: number, notes?: string) {
    if (!currentShift.value) return null;

    const posStore = usePosStore();
    
    // Calculate Actual System Expected Totals from Shift Orders
    const shiftOrders = posStore.orderHistory.filter((o: Order) => o.shiftId === currentShift.value?.id && o.status !== 'CANCELLED');
    
    const expectedCashSales = shiftOrders.filter((o: Order) => o.paymentType === 'CASH').reduce((sum: number, o: Order) => sum + o.totalAmount, 0);
    const expectedCardSales = shiftOrders.filter((o: Order) => o.paymentType === 'CARD').reduce((sum: number, o: Order) => sum + o.totalAmount, 0);
    const expectedQrSales = shiftOrders.filter((o: Order) => o.paymentType === 'CLICK_PAYME' || o.paymentType === 'DELIVERY_PARTNER').reduce((sum: number, o: Order) => sum + o.totalAmount, 0);

    // Expected Cash in Drawer = Initial Cash + Expected Cash Sales
    const expectedCashInDrawer = currentShift.value.initialCash + expectedCashSales;
    
    // Difference calculation: Declared Cash - Expected Cash
    const cashDifference = declaredCash - expectedCashInDrawer;

    const cardDiff = declaredCard - expectedCardSales;
    const qrDiff = declaredQr - expectedQrSales;

    let auditStatus: 'BALANCED' | 'SHORTAGE' | 'SURPLUS' = 'BALANCED';
    if (cashDifference < -1000 || cardDiff < -1000 || qrDiff < -1000) {
      auditStatus = 'SHORTAGE'; // Kamchilik (Shortage)
    } else if (cashDifference > 1000 || cardDiff > 1000 || qrDiff > 1000) {
      auditStatus = 'SURPLUS'; // Ortiqcha (Surplus)
    }

    const auditRecord: ShiftCashAudit = {
      id: 'audit-' + Date.now(),
      shiftId: currentShift.value.id,
      expectedCash: expectedCashInDrawer,
      declaredCash,
      difference: cashDifference,
      declaredCard,
      declaredQr,
      status: auditStatus,
      notes,
      createdAt: new Date().toLocaleString('uz-UZ')
    };

    shiftAudits.value.unshift(auditRecord);

    currentShift.value.status = 'CLOSED';
    currentShift.value.closedAt = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

    return auditRecord;
  }

  function verifyManagerPin(pin: string): boolean {
    return pin === managerPin;
  }

  return {
    currentShift,
    shiftAudits,
    isShiftOpen,
    openShift,
    closeShiftBlindReconciliation,
    verifyManagerPin
  };
});
