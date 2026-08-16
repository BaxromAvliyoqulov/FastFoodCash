<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePosStore } from '../../stores/posStore';
import { useAuthStore } from '../../stores/authStore';
import { Search, ShoppingBag, ArrowLeft, Maximize, Minimize } from 'lucide-vue-next';

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
const authStore = useAuthStore();

// Kassir qaysi qavatga biriktirilgan?
const cashierFloor = computed<'ALL' | 'FLOOR_1' | 'FLOOR_2'>(() => {
  const user = authStore.user;
  if (!user) return 'ALL';
  if (user.role === 'ADMIN') return 'ALL';
  const name = (user.fullName || '').toLowerCase();
  if (name.includes('kassir 2') || name.includes('kassa 2') || name.includes('2-kassir')) {
    return 'FLOOR_2';
  }
  return 'FLOOR_1';
});

// ZAL rejimi tugmasi matni
const zalLabel = computed(() => {
  if (cashierFloor.value === 'FLOOR_2') return '2-Qavat Xonalar';
  if (cashierFloor.value === 'FLOOR_1') return '1-Qavat Stollar';
  return 'Zal';
});

const zalEmoji = computed(() => {
  return cashierFloor.value === 'FLOOR_2' ? '👑' : '🏛️';
});

// Fullscreen logic
const isFullscreen = ref(false);

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
    isFullscreen.value = true;
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
      isFullscreen.value = false;
    }
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange);
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange);
});
</script>

<template>
  <div class="shrink-0 px-3 sm:px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center gap-3">
    <!-- Search -->
    <div class="relative flex-1 min-w-[150px] max-w-xs">
      <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input v-model="posStore.searchQuery" type="text" placeholder="Taom qidirish..." class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-colors" />
    </div>

    <!-- SABOY / ZAL MODE TOGGLE -->
    <div class="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
      <button @click="emit('switch-mode', 'ZAL')" :class="['px-4 py-1.5 rounded-lg transition-all flex items-center space-x-2 text-xs font-bold', posStore.operationMode === 'ZAL' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700']">
        <span class="text-sm">{{ zalEmoji }}</span><span>{{ zalLabel }}</span>
        <span class="ml-1 text-[9px] text-slate-400 border border-slate-300 dark:border-slate-700 rounded px-1 hidden md:inline">F4</span>
      </button>
      <button @click="emit('switch-mode', 'SABOY')" :class="['px-4 py-1.5 rounded-lg transition-all flex items-center space-x-2 text-xs font-bold', posStore.operationMode === 'SABOY' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700']">
        <span class="text-sm">🛍️</span><span>Saboy</span>
        <span class="ml-1 text-[9px] text-slate-400 border border-slate-300 dark:border-slate-700 rounded px-1 hidden md:inline">F4</span>
      </button>
    </div>

    <!-- ZAL: aktiv stol chip -->
    <button v-if="posStore.operationMode === 'ZAL' && posStore.activeTable && showTableProducts" @click="emit('back-to-table-map')" class="flex items-center gap-2 bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-xl text-xs font-black shrink-0 hover:bg-amber-500/25 transition-colors">
      <ArrowLeft class="w-3.5 h-3.5" />
      <span>{{ posStore.activeTable.name || `${posStore.activeTable.number}-Joy` }}</span>
      <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
    </button>

    <div class="ml-auto flex items-center gap-2">
      <!-- Fullscreen Toggle Button -->
      <button 
        @click="toggleFullscreen" 
        :title="isFullscreen ? 'To\'liq ekrandan chiqish' : 'To\'liq ekran rejimi (F11)'"
        class="hidden sm:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
      >
        <Minimize v-if="isFullscreen" class="w-4 h-4 text-amber-500" />
        <Maximize v-else class="w-4 h-4 text-slate-500" />
        <span class="hidden md:inline">{{ isFullscreen ? 'Kichraytirish' : 'To\'liq Ekran' }}</span>
      </button>

      <!-- Expense Button -->
      <button @click="emit('open-expense')" class="flex items-center gap-1 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-colors">
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
