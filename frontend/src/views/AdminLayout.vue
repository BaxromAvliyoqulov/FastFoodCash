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
</script>

<template>
  <div class="h-full flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 overflow-hidden">
    
    <!-- Admin Sidebar / Navbar -->
    <aside class="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
      <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
          <Crown class="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h2 class="font-black text-slate-900 dark:text-white leading-tight">Admin Paneli</h2>
          <p class="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Boshqaruv markazi</p>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin flex flex-row md:flex-col overflow-x-auto md:overflow-x-hidden">
        
        <button 
          @click="changeAdminTab('dashboard')"
          :class="['flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap md:whitespace-normal', adminActiveTab === 'dashboard' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white']"
        >
          <BarChart3 class="w-5 h-5" :class="{ 'text-amber-200': adminActiveTab === 'dashboard' }" />
          <span>Boshqaruv Dashbordi</span>
        </button>

        <button 
          @click="changeAdminTab('history')"
          :class="['flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap md:whitespace-normal', adminActiveTab === 'history' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white']"
        >
          <History class="w-5 h-5" :class="{ 'text-amber-200': adminActiveTab === 'history' }" />
          <span>Savdo Tarixi</span>
        </button>

        <button 
          @click="changeAdminTab('menu')"
          :class="['flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap md:whitespace-normal', adminActiveTab === 'menu' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white']"
        >
          <FolderKanban class="w-5 h-5" :class="{ 'text-amber-200': adminActiveTab === 'menu' }" />
          <span>Menyu & Kategoriyalar</span>
        </button>

        <button 
          @click="changeAdminTab('revision')"
          :class="['flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap md:whitespace-normal', adminActiveTab === 'revision' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white']"
        >
          <Package class="w-5 h-5" :class="{ 'text-amber-200': adminActiveTab === 'revision' }" />
          <span>Ombor Qoldig'i</span>
        </button>

        <button 
          @click="changeAdminTab('shift')"
          :class="['flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap md:whitespace-normal', adminActiveTab === 'shift' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white']"
        >
          <Receipt class="w-5 h-5" :class="{ 'text-amber-200': adminActiveTab === 'shift' }" />
          <span>Smena & Z-Report</span>
        </button>
        
      </nav>
    </aside>

    <!-- Admin Content Area -->
    <main class="flex-1 min-w-0 h-full overflow-hidden relative">
      <DashboardView v-if="adminActiveTab === 'dashboard'" />
      <HistoryView v-else-if="adminActiveTab === 'history'" />
      <MenuView v-else-if="adminActiveTab === 'menu'" />
      <RevisionView v-else-if="adminActiveTab === 'revision'" />
      <ShiftView v-else-if="adminActiveTab === 'shift'" />
    </main>

  </div>
</template>
