<template>
  <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4 sm:px-0">
    <TransitionGroup 
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-x-8 opacity-0"
      enter-to-class="transform translate-x-0 opacity-100"
      leave-active-class="transition duration-200 ease-in absolute w-full"
      leave-from-class="transform translate-x-0 opacity-100"
      leave-to-class="transform translate-x-8 opacity-0"
      move-class="transition duration-300 ease-in-out"
    >
      <div 
        v-for="toast in toastStore.toasts" 
        :key="toast.id"
        class="relative overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 pointer-events-auto flex items-center p-4 gap-3 shadow-2xl"
        :class="getToastClasses(toast.type)"
      >
        <!-- Subtle Status Gradient Background -->
        <div 
          class="absolute inset-0 opacity-[0.08] dark:opacity-[0.15]"
          :class="getGradientClass(toast.type)"
        ></div>
        
        <!-- Icon with Neon Drop Shadow -->
        <div class="shrink-0 relative z-10" :class="getIconWrapperClass(toast.type)">
          <component :is="getIcon(toast.type)" class="w-6 h-6" :class="getIconColorClass(toast.type)" />
        </div>
        
        <!-- Message -->
        <div class="relative z-10 flex-1">
          <p class="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
            {{ toast.message }}
          </p>
        </div>

        <!-- Close Button -->
        <button 
          @click="toastStore.removeToast(toast.id)"
          class="relative z-10 shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToastStore, type ToastType } from '../stores/toastStore';
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, X } from 'lucide-vue-next';

const toastStore = useToastStore();

function getToastClasses(type: ToastType) {
  switch (type) {
    case 'error':
      return 'border-rose-500/30 dark:border-rose-500/20 shadow-[0_4px_24px_rgba(225,29,72,0.25)] dark:shadow-[0_4px_24px_rgba(225,29,72,0.4)]';
    case 'success':
      return 'border-emerald-500/30 dark:border-emerald-500/20 shadow-[0_4px_24px_rgba(16,185,129,0.25)] dark:shadow-[0_4px_24px_rgba(16,185,129,0.4)]';
    case 'warning':
      return 'border-amber-500/30 dark:border-amber-500/20 shadow-[0_4px_24px_rgba(245,158,11,0.25)] dark:shadow-[0_4px_24px_rgba(245,158,11,0.4)]';
    case 'info':
    default:
      return 'border-blue-500/30 dark:border-blue-500/20 shadow-[0_4px_24px_rgba(59,130,246,0.25)] dark:shadow-[0_4px_24px_rgba(59,130,246,0.4)]';
  }
}

function getGradientClass(type: ToastType) {
  switch (type) {
    case 'error': return 'bg-gradient-to-r from-rose-500 to-transparent';
    case 'success': return 'bg-gradient-to-r from-emerald-500 to-transparent';
    case 'warning': return 'bg-gradient-to-r from-amber-500 to-transparent';
    case 'info':
    default: return 'bg-gradient-to-r from-blue-500 to-transparent';
  }
}

function getIcon(type: ToastType) {
  switch (type) {
    case 'error': return AlertOctagon;
    case 'success': return CheckCircle2;
    case 'warning': return AlertTriangle;
    case 'info':
    default: return Info;
  }
}

function getIconWrapperClass(type: ToastType) {
  switch (type) {
    case 'error': return 'drop-shadow-[0_0_8px_rgba(225,29,72,0.6)]';
    case 'success': return 'drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]';
    case 'warning': return 'drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]';
    case 'info':
    default: return 'drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]';
  }
}

function getIconColorClass(type: ToastType) {
  switch (type) {
    case 'error': return 'text-rose-500';
    case 'success': return 'text-emerald-500';
    case 'warning': return 'text-amber-500';
    case 'info':
    default: return 'text-blue-500';
  }
}
</script>
