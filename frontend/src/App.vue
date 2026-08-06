<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import PosView from './views/PosView.vue';
import MenuView from './views/MenuView.vue';
import TablesView from './views/TablesView.vue';
import DashboardView from './views/DashboardView.vue';
import ShiftView from './views/ShiftView.vue';
import RevisionView from './views/RevisionView.vue';
import HistoryView from './views/HistoryView.vue';
import LoginView from './views/LoginView.vue';
import ToastContainer from './components/ToastContainer.vue';
import { useThemeStore } from './stores/themeStore';
import { useAuthStore } from './stores/authStore';
import { usePosStore } from './stores/posStore';
import { useShiftStore } from './stores/shiftStore';
import { watch } from 'vue';

// Persist active tab in localStorage so F5 refresh stays on current page!
const activeTab = ref(localStorage.getItem('doston_pos_active_tab') || 'pos');
const themeStore = useThemeStore();
const authStore = useAuthStore();
const posStore = usePosStore();
const shiftStore = useShiftStore();

function handleTabChange(tab: string) {
  activeTab.value = tab;
  localStorage.setItem('doston_pos_active_tab', tab);
}

function initData() {
  if (authStore.isAuthenticated) {
    posStore.fetchProducts();
    posStore.loadTables();
    shiftStore.fetchActiveShift();
  }
}

watch(() => authStore.isAuthenticated, (newVal) => {
  if (newVal) {
    initData();
  }
});

onMounted(() => {
  themeStore.applyTheme();
  initData();
});
</script>

<template>
  <ToastContainer />
  <LoginView v-if="!authStore.isAuthenticated" />

  <div v-else class="h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden transition-colors duration-300">
    <!-- Navbar (Fixed Header Height) -->
    <Navbar class="shrink-0" :activeTab="activeTab" @changeTab="handleTabChange" />

    <!-- Main Content Area (Fills remaining height) -->
    <main class="flex-1 min-h-0 overflow-hidden relative">
      <PosView v-if="activeTab === 'pos'" />
      <MenuView v-else-if="activeTab === 'menu'" />
      <TablesView v-else-if="activeTab === 'tables'" />
      <DashboardView v-else-if="activeTab === 'dashboard'" />
      <ShiftView v-else-if="activeTab === 'shift'" />
      <HistoryView v-else-if="activeTab === 'history'" />
      <RevisionView v-else-if="activeTab === 'revision'" />
    </main>
  </div>
</template>
