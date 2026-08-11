<script setup lang="ts">
import { ref } from 'vue';
import DashboardView from './DashboardView.vue';
import HistoryView from './HistoryView.vue';
import MenuView from './MenuView.vue';
import RevisionView from './RevisionView.vue';
import ShiftView from './ShiftView.vue';
import { 
  BarChart3, 
  History, 
  FolderKanban, 
  Package, 
  Receipt,
  Crown
} from 'lucide-vue-next';

// Retrieve last admin tab or default to dashboard
const adminActiveTab = ref(localStorage.getItem('doston_pos_admin_tab') || 'dashboard');

function changeAdminTab(tab: string) {
  adminActiveTab.value = tab;
  localStorage.setItem('doston_pos_admin_tab', tab);
}

const tabs = [
  { id: 'dashboard', label: 'Boshqaruv Dashbordi', icon: BarChart3 },
  { id: 'history',   label: 'Savdo Tarixi',         icon: History },
  { id: 'menu',      label: 'Menyu & Kategoriyalar', icon: FolderKanban },
  { id: 'revision',  label: "Ombor Qoldig'i",        icon: Package },
  { id: 'shift',     label: 'Smena & Z-Report',      icon: Receipt },
];
</script>

<template>
  <div class="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">

    <!-- ── Admin Top Navbar ────────────────────────────────── -->
    <nav class="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center gap-2 shadow-sm">
      <!-- Admin Badge -->
      <div class="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-slate-800 py-2 shrink-0">
        <div class="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
          <Crown class="w-4 h-4 text-amber-500" />
        </div>
        <span class="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider whitespace-nowrap">Admin Paneli</span>
      </div>

      <!-- Tab Buttons -->
      <div class="flex items-center gap-0.5 overflow-x-auto scrollbar-thin py-2 flex-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="changeAdminTab(tab.id)"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer',
            adminActiveTab === tab.id
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4 shrink-0" />
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </nav>

    <!-- ── Admin Content Area ──────────────────────────────── -->
    <main class="flex-1 min-h-0 overflow-hidden relative">
      <DashboardView v-if="adminActiveTab === 'dashboard'" />
      <HistoryView   v-else-if="adminActiveTab === 'history'" />
      <MenuView      v-else-if="adminActiveTab === 'menu'" />
      <RevisionView  v-else-if="adminActiveTab === 'revision'" />
      <ShiftView     v-else-if="adminActiveTab === 'shift'" />
    </main>

  </div>
</template>
