<script setup lang="ts">
import { useShiftStore } from '../stores/shiftStore';
import { useThemeStore } from '../stores/themeStore';
import { 
  Flame, 
  ShoppingCart, 
  Receipt, 
  ClipboardCheck, 
  User, 
  Clock,
  AlertTriangle,
  Sun,
  Moon,
  BarChart3,
  FolderKanban
} from 'lucide-vue-next';

defineProps<{
  activeTab: string;
}>();

const emit = defineEmits<{
  (e: 'change-tab', tab: string): void;
}>();

const shiftStore = useShiftStore();
const themeStore = useThemeStore();
</script>

<template>
  <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm dark:shadow-xl transition-colors duration-300">
    <!-- Brand Logo & System Name: DOSTON BURGER -->
    <div class="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
      <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
        <Flame class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <div>
        <h1 class="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-wide flex items-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
          DOSTON <span class="text-amber-500">BURGER</span>
          <span class="hidden sm:inline-block text-[10px] bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">POS PRO</span>
        </h1>
        <p class="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">Express POS & Multi-Audit Ecosystem</p>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <nav class="flex items-center bg-slate-100 dark:bg-slate-950 p-1 sm:p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-x-auto no-scrollbar max-w-full space-x-1">
      <button 
        @click="emit('change-tab', 'pos')"
        :class="[
          'flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs transition-all duration-200 shrink-0',
          activeTab === 'pos' 
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30' 
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-900'
        ]"
      >
        <ShoppingCart class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>POS Kassa</span>
      </button>

      <button 
        @click="emit('change-tab', 'menu')"
        :class="[
          'flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs transition-all duration-200 shrink-0',
          activeTab === 'menu' 
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30' 
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-900'
        ]"
      >
        <FolderKanban class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
        <span>Menyu & Kategoriyalar</span>
      </button>

      <button 
        @click="emit('change-tab', 'dashboard')"
        :class="[
          'flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs transition-all duration-200 shrink-0',
          activeTab === 'dashboard' 
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30' 
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-900'
        ]"
      >
        <BarChart3 class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Boshqaruv Paneli</span>
      </button>

      <button 
        @click="emit('change-tab', 'shift')"
        :class="[
          'flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs transition-all duration-200 shrink-0',
          activeTab === 'shift' 
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30' 
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-900'
        ]"
      >
        <Receipt class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Smena & Z-Report</span>
      </button>

      <button 
        @click="emit('change-tab', 'revision')"
        :class="[
          'flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs transition-all duration-200 shrink-0',
          activeTab === 'revision' 
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30' 
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-900'
        ]"
      >
        <ClipboardCheck class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Reviziya & Auditing</span>
      </button>
    </nav>

    <!-- Right Side Actions: Theme Switcher + Cashier & Shift Info Pill -->
    <div class="flex items-center space-x-3 shrink-0">
      <!-- Dark / Light Mode Toggle Button -->
      <button 
        @click="themeStore.toggleTheme"
        :title="themeStore.isDark ? 'Light mode-ga o\'tish' : 'Dark mode-ga o\'tish'"
        class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-amber-500 dark:text-amber-400 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm"
      >
        <Sun v-if="themeStore.isDark" class="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
        <Moon v-else class="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
      </button>

      <div v-if="shiftStore.currentShift" class="flex items-center space-x-2.5 sm:space-x-3 bg-slate-100 dark:bg-slate-950 px-3 sm:px-4 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
        <div class="text-left text-xs">
          <div class="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono text-[10px] sm:text-xs">
            <Clock class="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
            <span>Smena: {{ shiftStore.currentShift.openedAt }}</span>
          </div>
          <div class="text-slate-900 dark:text-white font-bold flex items-center gap-1 text-[11px] sm:text-xs">
            <User class="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />
            <span>{{ shiftStore.currentShift.cashierName }}</span>
          </div>
        </div>
      </div>
      
      <div v-else class="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 px-3 py-1.5 rounded-2xl text-xs font-bold">
        <AlertTriangle class="w-4 h-4" />
        <span>Smena Yopiq</span>
      </div>
    </div>
  </header>
</template>
