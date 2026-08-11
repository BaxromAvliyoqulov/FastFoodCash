<script setup lang="ts">
import { ref } from 'vue';
import { useShiftStore } from '../stores/shiftStore';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { 
  Flame, 
  ShoppingCart, 
  Receipt, 
  ClipboardCheck, 
  Clock,
  AlertTriangle,
  Sun,
  Moon,
  BarChart3,
  FolderKanban,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Crown
} from 'lucide-vue-next';

defineProps<{
  activeTab: string;
}>();

const emit = defineEmits<{
  (e: 'change-tab', tab: string): void;
}>();

const authStore = useAuthStore();
const shiftStore = useShiftStore();
const themeStore = useThemeStore();

const isAdminDropdownOpen = ref(false);

function selectAdminTab(tab: string) {
  isAdminDropdownOpen.value = false;
  emit('change-tab', tab);
}
</script>

<template>
  <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-sm dark:shadow-2xl transition-colors duration-300 relative z-30">
    <!-- Brand Logo & System Identity -->
    <div class="flex items-center space-x-3 shrink-0">
      <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
        <Flame class="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 class="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-wide flex items-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
          DOSTON <span class="text-amber-500">BURGER</span>
          <span class="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">POS PRO</span>
        </h1>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Express POS & Multi-Audit Ecosystem</p>
      </div>
    </div>

    <!-- Center Organized Navigation Tabs -->
    <nav class="flex items-center bg-slate-100/80 dark:bg-slate-950/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-x-1 shrink-0 relative">
      
      <!-- OPERATIONAL KASSA TABS -->
      <button 
        @click="emit('change-tab', 'pos'); isAdminDropdownOpen = false"
        :class="[
          'flex items-center space-x-2 px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all duration-200 shrink-0 cursor-pointer',
          activeTab === 'pos' 
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 scale-[1.02]' 
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-900'
        ]"
      >
        <ShoppingCart class="w-4 h-4" />
        <span>POS Kassa</span>
      </button>

      <button 
        @click="emit('change-tab', 'tables'); isAdminDropdownOpen = false"
        :class="[
          'flex items-center space-x-2 px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all duration-200 shrink-0 cursor-pointer',
          activeTab === 'tables' 
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 scale-[1.02]' 
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-900'
        ]"
      >
        <LayoutDashboard class="w-4 h-4" />
        <span>Stollar</span>
      </button>

      <!-- SMENA FOR CASHIER ONLY (IF NOT ADMIN) -->
      <button 
        v-if="!authStore.isAdmin"
        @click="emit('change-tab', 'shift'); isAdminDropdownOpen = false"
        :class="[
          'flex items-center space-x-2 px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all duration-200 shrink-0 cursor-pointer',
          activeTab === 'shift' 
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 scale-[1.02]' 
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-900'
        ]"
      >
        <Receipt class="w-4 h-4" />
        <span>Smena</span>
      </button>

      <!-- DIVIDER FOR ADMIN SECTION -->
      <div v-if="authStore.isAdmin" class="h-5 w-px bg-slate-300 dark:bg-slate-800 mx-1 shrink-0"></div>

      <!-- SINGLE ADMIN PANEL DROPDOWN MENU -->
      <div v-if="authStore.isAdmin" class="relative">
        <button 
          @click="isAdminDropdownOpen = !isAdminDropdownOpen"
          :class="[
            'flex items-center space-x-2 px-4 py-2 rounded-xl font-black text-xs transition-all duration-200 shrink-0 cursor-pointer border',
            ['dashboard', 'history', 'menu', 'revision', 'shift'].includes(activeTab)
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400/50 shadow-md shadow-amber-500/30 scale-[1.02]' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
          ]"
        >
          <Crown class="w-4 h-4 text-amber-400" />
          <span>👑 Admin Paneli</span>
          <ChevronDown class="w-3.5 h-3.5 transition-transform duration-200" :class="{ 'rotate-180': isAdminDropdownOpen }" />
        </button>

        <!-- Dropdown Menu Items -->
        <div 
          v-if="isAdminDropdownOpen" 
          class="absolute right-0 sm:left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150"
        >
          <button 
            @click="selectAdminTab('dashboard')"
            :class="['w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer text-left', activeTab === 'dashboard' ? 'bg-amber-500 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800']"
          >
            <BarChart3 class="w-4 h-4 text-amber-500" :class="{ 'text-white': activeTab === 'dashboard' }" />
            <span>📊 Boshqaruv Dashbordi</span>
          </button>

          <button 
            @click="selectAdminTab('history')"
            :class="['w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer text-left', activeTab === 'history' ? 'bg-amber-500 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800']"
          >
            <ClipboardCheck class="w-4 h-4 text-indigo-500" :class="{ 'text-white': activeTab === 'history' }" />
            <span>📋 Savdo Tarixi (Full Audit)</span>
          </button>

          <button 
            @click="selectAdminTab('menu')"
            :class="['w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer text-left', activeTab === 'menu' ? 'bg-amber-500 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800']"
          >
            <FolderKanban class="w-4 h-4 text-emerald-500" :class="{ 'text-white': activeTab === 'menu' }" />
            <span>📁 Menyu & Kategoriyalar</span>
          </button>

          <button 
            @click="selectAdminTab('revision')"
            :class="['w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer text-left', activeTab === 'revision' ? 'bg-amber-500 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800']"
          >
            <ClipboardCheck class="w-4 h-4 text-purple-500" :class="{ 'text-white': activeTab === 'revision' }" />
            <span>📦 Ombor Qoldig'i</span>
          </button>

          <button 
            @click="selectAdminTab('shift')"
            :class="['w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer text-left', activeTab === 'shift' ? 'bg-amber-500 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800']"
          >
            <Receipt class="w-4 h-4 text-rose-500" :class="{ 'text-white': activeTab === 'shift' }" />
            <span>💵 Smena & Z-Report Audit</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Right Action Controls: Shift Status + Theme Switcher + Logout -->
    <div class="flex items-center space-x-2.5 shrink-0">
      <!-- Shift Status Pill -->
      <button 
        v-if="shiftStore.currentShift" 
        @click="emit('change-tab', 'shift'); isAdminDropdownOpen = false"
        class="flex items-center space-x-2.5 bg-slate-100 dark:bg-slate-950 px-3.5 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm"
        title="Smena ma'lumotlari"
      >
        <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
        <div class="text-left text-xs">
          <div class="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono text-[10px]">
            <Clock class="w-3 h-3 text-slate-400 shrink-0" />
            <span>Smena ochiq</span>
          </div>
          <div class="text-slate-900 dark:text-white font-black text-[11px]">
            {{ (shiftStore.currentShift.cashierName || authStore.user?.fullName)?.replace(/Baxrom\s*/gi, '').trim() || 'Admin' }}
          </div>
        </div>
      </button>
      
      <button 
        v-else 
        @click="emit('change-tab', 'shift'); isAdminDropdownOpen = false"
        class="flex items-center space-x-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 px-3 py-2 rounded-2xl text-xs font-black cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm hover:bg-rose-500/20"
        title="Smenani ochish uchun bosing"
      >
        <AlertTriangle class="w-4 h-4" />
        <span>Smena Yopiq</span>
      </button>

      <!-- Theme Switcher -->
      <button 
        @click="themeStore.toggleTheme"
        :title="themeStore.isDark ? 'Yorug\' rejim' : 'Qorong\'u rejim'"
        class="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-amber-500 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0"
      >
        <Sun v-if="themeStore.isDark" class="w-4 h-4 text-amber-400" />
        <Moon v-else class="w-4 h-4 text-slate-700" />
      </button>

      <!-- Logout Button -->
      <button 
        @click="authStore.logout"
        title="Tizimdan chiqish"
        class="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-rose-500 flex items-center justify-center hover:scale-105 hover:bg-rose-50 dark:hover:bg-rose-950/30 active:scale-95 transition-all shadow-sm shrink-0"
      >
        <LogOut class="w-4 h-4" />
      </button>
    </div>
  </header>
</template>
