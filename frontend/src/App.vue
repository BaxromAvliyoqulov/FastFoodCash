<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import PosView from './views/PosView.vue';
import TablesView from './views/TablesView.vue';
import ShiftView from './views/ShiftView.vue';
import LoginView from './views/LoginView.vue';
import AdminLayout from './views/AdminLayout.vue';
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
  if (authStore.isCashier && ['menu', 'dashboard', 'revision', 'history'].includes(tab)) {
    tab = 'pos';
  }
  activeTab.value = tab;
  localStorage.setItem('doston_pos_active_tab', tab);
}

function initData() {
  if (authStore.isAuthenticated) {
    if (authStore.isCashier && ['menu', 'dashboard', 'revision', 'history', 'admin'].includes(activeTab.value)) {
      handleTabChange('pos');
    }
    posStore.fetchProducts();
    posStore.loadTables();
    posStore.fetchOrders();
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

  window.addEventListener('change-tab-event', (e: Event) => {
    const customEvent = e as CustomEvent;
    if (customEvent.detail) {
      handleTabChange(customEvent.detail);
    }
  });
});
</script>

<template>
  <ToastContainer />
  <LoginView v-if="!authStore.isAuthenticated" />

  <div v-else class="h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden transition-colors duration-300">
    <!-- Navbar (Fixed Header Height) -->
    <Navbar class="shrink-0" :activeTab="activeTab" @changeTab="handleTabChange" />

    <!-- Main Content Area (Fills remaining height) -->
    <main class="flex-1 min-h-0 overflow-y-auto relative">
      <PosView v-if="activeTab === 'pos'" />
      <TablesView v-else-if="activeTab === 'tables'" />
      <AdminLayout v-else-if="activeTab === 'admin'" />
      <ShiftView v-else-if="activeTab === 'shift'" />
    </main>
  </div>
</template>
