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
