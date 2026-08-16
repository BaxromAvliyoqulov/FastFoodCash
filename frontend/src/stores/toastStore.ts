import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);
  let lastToastMessage = '';
  let lastToastTime = 0;

  function addToast(message: string, type: ToastType = 'info', duration: number = 3000) {
    const now = Date.now();
    // 1500ms ichida bir xil matnli xabarnoma qayta chaqirilsa, uni e'tiborsiz qoldirish
    if (lastToastMessage === message && (now - lastToastTime) < 1500) {
      return;
    }
    lastToastMessage = message;
    lastToastTime = now;

    const id = 'toast-' + now + '-' + Math.random().toString(36).substr(2, 9);
    toasts.value.push({ id, message, type, duration });

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }

  function success(message: string, duration?: number) {
    addToast(message, 'success', duration);
  }

  function error(message: string, duration?: number) {
    addToast(message, 'error', duration);
  }

  function warning(message: string, duration?: number) {
    addToast(message, 'warning', duration);
  }

  function info(message: string, duration?: number) {
    addToast(message, 'info', duration);
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
});
