<script setup lang="ts">
import { computed } from 'vue';
import { usePosStore } from '../stores/posStore';
import { formatTime } from '../utils/formatters';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CloudUpload
} from 'lucide-vue-next';

const posStore = usePosStore();

const syncTimeDisplay = computed(() => {
  if (!posStore.lastSyncTime) return 'Hozir';
  return formatTime(posStore.lastSyncTime.toISOString());
});

const isSyncing = computed(() => posStore.isSyncingOrders || posStore.isSyncingProducts);

async function handleManualSync() {
  await posStore.forceRefreshMenu();
}

async function handleSyncOfflineOrders() {
  await posStore.syncOfflineOrders();
}
</script>

<template>
  <div class="flex items-center gap-2 flex-wrap">
    
    <!-- 🟢 ONLINE / 🔴 OFFLINE STATUS BADGE -->
    <div 
      :class="[
        'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black border transition-all duration-300 select-none shadow-sm',
        posStore.isOnline
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          : 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 animate-pulse'
      ]"
      :title="posStore.isOnline ? 'Server bilan aloqa barqaror (Online)' : 'Server yoki internet uzilgan (Offline rejimda ishlamoqda)'"
    >
      <span class="relative flex h-2 w-2">
        <span 
          v-if="posStore.isOnline" 
          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
        ></span>
        <span 
          :class="['relative inline-flex rounded-full h-2 w-2', posStore.isOnline ? 'bg-emerald-500' : 'bg-rose-500']"
        ></span>
      </span>

      <component :is="posStore.isOnline ? Wifi : WifiOff" class="w-3.5 h-3.5 shrink-0" />
      <span class="tracking-wide uppercase text-[10px]">
        {{ posStore.isOnline ? 'Online' : 'Offline' }}
      </span>
    </div>

    <!-- 🔄 OFFLINE PENDING QUEUE WARNING BADGE -->
    <button
      v-if="posStore.pendingOfflineCount > 0"
      @click="handleSyncOfflineOrders"
      :disabled="isSyncing"
      class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-700 dark:text-amber-300 transition-all cursor-pointer active:scale-95 shadow-sm animate-pulse"
      :title="`Serverga yuklanmagan ${posStore.pendingOfflineCount} ta oflayn chek bor. Yuklash uchun bosing!`"
    >
      <CloudUpload class="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
      <span>{{ posStore.pendingOfflineCount }} ta chek kutilmoqda</span>
      <span class="text-[9px] bg-amber-500/30 px-1 py-0.2 rounded font-bold">Yuklash</span>
    </button>

    <!-- 🔄 INSTANT FORCE REFRESH / MENU SYNC BUTTON -->
    <button
      @click="handleManualSync"
      :disabled="isSyncing"
      class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer active:scale-95 shadow-sm group"
      title="Barcha tovarlar, narxlar va savdo tarixini serverdan darhol qayta yuklash (Keshni tozalash)"
    >
      <RefreshCw 
        :class="['w-3.5 h-3.5 shrink-0 text-amber-500 transition-transform duration-500', isSyncing ? 'animate-spin' : 'group-hover:rotate-180']" 
      />
      <span class="hidden sm:inline">
        {{ isSyncing ? 'Yangilanmoqda...' : 'Menyuni Yangilash' }}
      </span>
      <span class="text-[9px] text-slate-400 font-mono hidden md:inline">
        {{ syncTimeDisplay }}
      </span>
    </button>

  </div>
</template>
