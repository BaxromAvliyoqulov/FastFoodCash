/**
 * Crash-safe utility functions for currency, number, and date formatting.
 * Prevents "TypeError: Cannot read properties of undefined (reading 'toLocaleString')" crashes.
 */

export function formatMoney(amount: number | string | null | undefined): string {
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) {
    return '0';
  }
  const num = Number(amount);
  return num.toLocaleString('uz-UZ');
}

export function formatDateTime(dateVal: string | number | Date | null | undefined): string {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return String(dateVal);
  }
}

export function formatTime(dateVal: string | number | Date | null | undefined): string {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return String(dateVal);
  }
}

export function formatDualCurrency(amount: number | string | null | undefined, usdRate = 12900): string {
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) {
    return "0 so'm ($0.00)";
  }
  const num = Number(amount);
  const usd = (num / usdRate).toFixed(2);
  return `${num.toLocaleString('uz-UZ')} so'm ($${usd})`;
}

/**
 * Returns cashier floor designation, e.g. "KASSA 1 (1-Qavat • Asosiy Zal)"
 */
export function getCashierFloorInfo(userNameOrObj?: string | { fullName?: string; id?: string; role?: string } | null): {
  kassaName: string;
  floorName: string;
  badge: string;
} {
  const name = typeof userNameOrObj === 'string' 
    ? userNameOrObj 
    : (userNameOrObj?.fullName || userNameOrObj?.id || '');
    
  const lower = name.toLowerCase();

  if (lower.includes('2') || lower.includes('kassir 2') || lower.includes('kassir-2')) {
    return {
      kassaName: 'KASSA 2',
      floorName: '2-Qavat (VIP Xonalar)',
      badge: '👑 KASSA 2 (2-Qavat • VIP Xonalar)'
    };
  }

  if (lower.includes('1') || lower.includes('kassir 1') || lower.includes('kassir-1')) {
    return {
      kassaName: 'KASSA 1',
      floorName: '1-Qavat (Asosiy Zal)',
      badge: '🏛️ KASSA 1 (1-Qavat • Asosiy Zal)'
    };
  }

  return {
    kassaName: 'BOSH KASSA',
    floorName: '1-Qavat (Asosiy Zal)',
    badge: '🏛️ KASSA 1 (1-Qavat)'
  };
}

/**
 * Generates an automatic daily queue token (#1, #2, ...) that resets each day
 */
export function getNextDailyQueueNumber(): number {
  const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const savedDate = localStorage.getItem('doston_pos_daily_queue_date');
  let currentQueue = Number(localStorage.getItem('doston_pos_daily_queue_number')) || 0;

  if (savedDate !== todayStr) {
    // New calendar day: reset to 1
    currentQueue = 1;
    localStorage.setItem('doston_pos_daily_queue_date', todayStr);
    localStorage.setItem('doston_pos_daily_queue_number', '1');
  } else {
    currentQueue += 1;
    localStorage.setItem('doston_pos_daily_queue_number', String(currentQueue));
  }

  return currentQueue;
}

export function getCurrentDailyQueueNumber(): number {
  return Number(localStorage.getItem('doston_pos_daily_queue_number')) || 1;
}

