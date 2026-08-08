<script setup lang="ts">
import { usePosStore } from '../../stores/posStore';
import { Search, ShoppingBag, ArrowLeft } from 'lucide-vue-next';

defineProps<{
  activeCartLength: number;
  activeSubtotal: number;
  showTableProducts: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle-mobile-cart'): void;
  (e: 'switch-mode', mode: 'SABOY' | 'ZAL'): void;
  (e: 'back-to-table-map'): void;
  (e: 'open-expense'): void;
}>();

const posStore = usePosStore();
</script>

<template>
  <div class="shrink-0 px-3 sm:px-4 py-3 border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 flex flex-wrap items-center gap-3">
    <!-- Search -->
    <div class="relative flex-1 min-w-[160px] max-w-xs">
      <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input v-model="posStore.searchQuery" type="text" placeholder="Taom qidirish..." class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-colors" />
    </div>

    <!-- SABOY / ZAL MODE TOGGLE -->
    <div class="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
      <button @click="emit('switch-mode', 'ZAL')" :class="['px-5 py-2 rounded-xl transition-all flex items-center space-x-2 text-sm font-bold', posStore.operationMode === 'ZAL' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700']">
        <span class="text-base">🏛️</span><span class="hidden sm:inline">Zal</span>
        <span class="ml-1 text-[10px] text-slate-400 border border-slate-300 dark:border-slate-700 rounded px-1 hidden lg:inline">F4</span>
      </button>
      <button @click="emit('switch-mode', 'SABOY')" :class="['px-5 py-2 rounded-xl transition-all flex items-center space-x-2 text-sm font-bold', posStore.operationMode === 'SABOY' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700']">
        <span class="text-base">🛍️</span><span class="hidden sm:inline">Saboy</span>
        <span class="ml-1 text-[10px] text-slate-400 border border-slate-300 dark:border-slate-700 rounded px-1 hidden lg:inline">F4</span>
      </button>
    </div>

    <!-- ZAL: aktiv stol chip -->
    <button v-if="posStore.operationMode === 'ZAL' && posStore.activeTable && showTableProducts" @click="emit('back-to-table-map')" class="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 hover:bg-amber-500/20 transition-colors">
      <ArrowLeft class="w-3.5 h-3.5" />
      <span>{{ posStore.activeTable.name || `${posStore.activeTable.number}-Stol` }}</span>
      <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
    </button>

    <div class="ml-auto flex items-center gap-2">
      <!-- USD Dual Currency Badge -->
      <div v-if="activeSubtotal > 0" class="hidden xl:flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold" title="AQSH Dollaridagi taxminiy qiymat (Kurs: 12,900 so'm)">
        <span>💵</span>
        <span>${{ (activeSubtotal / 12900).toFixed(2) }}</span>
      </div>

      <!-- Expense Button -->
      <button @click="emit('open-expense')" class="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-colors">
        <span>💸</span><span class="hidden sm:inline">Rasxod</span>
      </button>

      <!-- Mobile cart button -->
      <button @click="emit('toggle-mobile-cart')" class="lg:hidden relative bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg shrink-0">
        <ShoppingBag class="w-4 h-4" />
        <span>{{ activeCartLength }}</span>
        <span v-if="activeSubtotal > 0" class="bg-black/20 px-1.5 py-0.5 rounded-lg font-mono text-[10px]">{{ (activeSubtotal / 1000).toFixed(0) }}k</span>
      </button>
    </div>
  </div>
</template>
