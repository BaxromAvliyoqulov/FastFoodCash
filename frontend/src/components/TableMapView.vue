<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePosStore } from '../stores/posStore';
import { useToastStore } from '../stores/toastStore';
import { useAuthStore } from '../stores/authStore';
import type { Table } from '../types/pos';
import { 
  Clock, X, Crown, Armchair, CheckCircle2,
  Activity, AlertTriangle, ArrowRightLeft
} from 'lucide-vue-next';

const posStore = usePosStore();
const toast = useToastStore();
const authStore = useAuthStore();

// ─── Kassir qavat aniqlash ─────────────────────────────────────────────────────
// Kassa 1 (Kassir 1) → 1-qavat (faqat stollar: 1–15)
// Kassa 2 (Kassir 2) → 2-qavat (faqat xonalar: 16–21)
// Admin → barchasi
const cashierFloor = computed<'ALL' | 'FLOOR_1' | 'FLOOR_2'>(() => {
  const user = authStore.user;
  if (!user) return 'ALL';
  if (user.role === 'ADMIN') return 'ALL';
  
  const name = (user.fullName || '').toLowerCase();
  // Kassir 2 → 2-qavat (xonalar)
  if (name.includes('kassir 2') || name.includes('kassa 2') || name.includes('2-kassir')) {
    return 'FLOOR_2';
  }
  // Kassir 1 yoki boshqa kassirlar → 1-qavat (stollar)
  return 'FLOOR_1';
});

const emit = defineEmits<{
  (e: 'table-selected', tableId: string): void;
}>();

// Active Filter: Zone & Status — kassir qavati bo'yicha default tab
const activeTab = ref<'ALL' | 'ZAL' | 'ROOMS'>(
  cashierFloor.value === 'FLOOR_1' ? 'ZAL' 
    : cashierFloor.value === 'FLOOR_2' ? 'ROOMS' 
    : 'ALL'
);
const statusFilter = ref<'ALL' | 'FREE' | 'OCCUPIED'>('ALL');

// Table confirmation modal state
const closingTable = ref<Table | null>(null);

// Table Transfer & Merge state
const transferModalOpen = ref(false);
const sourceTable = ref<Table | null>(null);
const targetTableId = ref<string>('');
const isMergeMode = ref(false);

function openTransferModal(table: Table, event: Event) {
  event.stopPropagation();
  sourceTable.value = table;
  targetTableId.value = '';
  isMergeMode.value = false;
  transferModalOpen.value = true;
}

function handleExecuteTransfer() {
  if (!sourceTable.value || !targetTableId.value) {
    toast.warning('Iltimos, ko\'chiriladigan manzil stolni tanlang!');
    return;
  }
  if (isMergeMode.value) {
    posStore.mergeTables(sourceTable.value.id, targetTableId.value);
  } else {
    posStore.transferTable(sourceTable.value.id, targetTableId.value);
  }
  transferModalOpen.value = false;
  sourceTable.value = null;
  targetTableId.value = '';
}

// ─── Real-time timer ──────────────────────────────────────────────────────────
const now = ref(Date.now());
let timerInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  timerInterval = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

function isRoomTable(table: Table): boolean {
  const name = (table.name || '').toLowerCase();
  return name.includes('xona') || name.includes('vip') || table.number >= 16;
}

// Separate tables into Zal vs Rooms — kassir qavati bo'yicha filtrlanadi
const activeTablesList = computed(() => {
  const all = posStore.tables.filter(t => t.isActive);
  // Agar kassir faqat bitta qavatga biriktirilgan bo'lsa, faqat shu qavat stollarini ko'rsatish
  if (cashierFloor.value === 'FLOOR_1') {
    return all.filter(t => !isRoomTable(t)); // Faqat stollar (1-qavat)
  }
  if (cashierFloor.value === 'FLOOR_2') {
    return all.filter(t => isRoomTable(t)); // Faqat xonalar (2-qavat)
  }
  return all; // Admin — barchasi
});

const mainHallTables = computed(() => {
  return activeTablesList.value.filter(t => !isRoomTable(t) && matchStatus(t));
});

const vipRoomTables = computed(() => {
  return activeTablesList.value.filter(t => isRoomTable(t) && matchStatus(t));
});

function matchStatus(table: Table): boolean {
  if (statusFilter.value === 'FREE') return table.status === 'FREE';
  if (statusFilter.value === 'OCCUPIED') return table.status === 'OCCUPIED';
  return true;
}

const freeCount = computed(() => activeTablesList.value.filter(t => t.status === 'FREE').length);
const occupiedCount = computed(() => activeTablesList.value.filter(t => t.status === 'OCCUPIED').length);

const totalActiveSalesSum = computed(() => {
  return activeTablesList.value.reduce((sum, t) => sum + tableSubtotal(t), 0);
});

// Qancha vaqt o'tgani
function elapsedTime(table: Table): string {
  if (!table.openedAt) return '';
  const ms = now.value - table.openedAt;
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;

  if (hours > 0) return `${hours}s ${remMins}d`;
  if (mins > 0) return `${mins} daqiqa`;
  return `${totalSec}s`;
}

function getTableElapsedMinutes(table: Table): number {
  if (!table.openedAt) return 0;
  return Math.floor((now.value - table.openedAt) / 60000);
}

function getTableTimerStyle(table: Table) {
  const mins = getTableElapsedMinutes(table);
  if (mins >= 60) {
    return {
      text: 'text-rose-600 dark:text-rose-400 font-black',
      pill: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/30',
      border: 'border-rose-500 shadow-rose-500/15 ring-2 ring-rose-500/25',
      tag: '1s+ o\'tirdi',
      tagClass: 'bg-rose-600 text-white animate-pulse'
    };
  }
  if (mins >= 30) {
    return {
      text: 'text-amber-600 dark:text-amber-400 font-bold',
      pill: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30',
      border: 'border-amber-500/80 shadow-amber-500/10 ring-2 ring-amber-500/20',
      tag: '30m+ o\'tirdi',
      tagClass: 'bg-amber-500 text-white'
    };
  }
  return {
    text: 'text-emerald-600 dark:text-emerald-400 font-bold',
    pill: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30',
    border: 'border-rose-500',
    tag: 'Yangi',
    tagClass: 'bg-emerald-500 text-white'
  };
}

function startedAt(table: Table): string {
  if (!table.openedAt) return '';
  return new Date(table.openedAt).toLocaleTimeString('uz-UZ', {
    hour: '2-digit', minute: '2-digit'
  });
}

function tableSubtotal(table: Table): number {
  return table.cart.reduce((s, i) => s + i.totalPrice, 0);
}

function tableCartCount(table: Table): number {
  return table.cart.reduce((s, i) => s + i.quantity, 0);
}

function selectTable(table: Table) {
  posStore.setActiveTable(table.id);
  emit('table-selected', table.id);
}

function handleCloseTable(tableId: string, event: Event) {
  event.stopPropagation();
  const table = posStore.tables.find(t => t.id === tableId);
  if (!table) return;
  closingTable.value = table;
}

function confirmCloseTable() {
  if (!closingTable.value) return;
  const table = closingTable.value;
  posStore.closeTable(table.id);
  if (posStore.activeTableId === table.id) {
    posStore.clearActiveTable();
  }
  toast.success(`${table.name || table.number + '-Stol'} muvaffaqiyatli yopildi va bo'shatildi!`);
  closingTable.value = null;
}

function cancelCloseTable() {
  closingTable.value = null;
}
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
    
    <!-- ── 1. COMPACT TOP HEADER & METRIC BAR (Only 1 sleek row) ── -->
    <div class="shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-wrap items-center justify-between gap-3">
      
      <div class="flex items-center space-x-3">
        <div 
          :class="[
            'w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0',
            cashierFloor === 'FLOOR_2' 
              ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/25' 
              : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25'
          ]"
        >
          <Crown v-if="cashierFloor === 'FLOOR_2'" class="w-5 h-5 text-amber-100" />
          <Armchair v-else class="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 class="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-wide leading-tight flex items-center gap-2">
            <span>{{ cashierFloor === 'FLOOR_2' ? '2-Qavat · VIP Xonalar' : cashierFloor === 'FLOOR_1' ? '1-Qavat · Asosiy Zal' : 'Restoran Stollar & Xonalar' }}</span>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {{ activeTablesList.length }} ta {{ cashierFloor === 'FLOOR_2' ? 'xona' : 'joy' }}
            </span>
          </h2>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {{ cashierFloor === 'FLOOR_2' ? 'Xonani tanlang va buyurtma kiriting' : 'Stolni tanlang va buyurtma kiriting' }}
          </p>
        </div>
      </div>

      <!-- Right Side: Status Badges & Filter -->
      <div class="flex items-center gap-2">
        
        <!-- Total Active Sales Sum Pill -->
        <div v-if="totalActiveSalesSum > 0" class="hidden sm:flex items-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-500/30 font-black text-xs font-mono">
          <Activity class="w-3.5 h-3.5" />
          <span>{{ totalActiveSalesSum.toLocaleString('uz-UZ') }} so'm</span>
        </div>

        <!-- Free Status Pill -->
        <button 
          @click="statusFilter = statusFilter === 'FREE' ? 'ALL' : 'FREE'"
          :class="[
            'text-xs font-black px-3.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95',
            statusFilter === 'FREE' 
              ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/30' 
              : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-100'
          ]"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{{ freeCount }} ta bo'sh</span>
        </button>

        <!-- Occupied Status Pill -->
        <button 
          @click="statusFilter = statusFilter === 'OCCUPIED' ? 'ALL' : 'OCCUPIED'"
          :class="[
            'text-xs font-black px-3.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95',
            statusFilter === 'OCCUPIED' 
              ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-500/30' 
              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30 hover:bg-rose-100'
          ]"
        >
          <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span>{{ occupiedCount }} ta band</span>
        </button>

        <!-- Admin Tab Switcher (Only if Admin) -->
        <div v-if="cashierFloor === 'ALL'" class="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button 
            @click="activeTab = 'ALL'"
            :class="['px-2.5 py-1 rounded-lg text-xs font-bold transition', activeTab === 'ALL' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500']"
          >
            Hammasi
          </button>
          <button 
            @click="activeTab = 'ZAL'"
            :class="['px-2.5 py-1 rounded-lg text-xs font-bold transition', activeTab === 'ZAL' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500']"
          >
            🏛️ 1-Qavat
          </button>
          <button 
            @click="activeTab = 'ROOMS'"
            :class="['px-2.5 py-1 rounded-lg text-xs font-bold transition', activeTab === 'ROOMS' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm' : 'text-slate-500']"
          >
            👑 2-Qavat
          </button>
        </div>

      </div>

    </div>

    <!-- ── 2. SEPARATED STOLLAR & XONALAR SCROLLABLE BODY ── -->
    <div class="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
      
      <!-- 🏛️ SECTION 1: ASOSIY ZAL STOLLARI (1-QAVAT: 15 TA STOL) -->
      <div v-if="(activeTab === 'ALL' || activeTab === 'ZAL') && mainHallTables.length > 0">
        
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3">
          <button
            v-for="table in mainHallTables"
            :key="table.id"
            @click="selectTable(table)"
            :class="[
              'relative flex flex-col rounded-2xl p-3.5 text-left transition-all duration-150 cursor-pointer group overflow-hidden min-h-[145px] active:scale-[0.98] border-2 shadow-sm',
              posStore.activeTableId === table.id
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 shadow-lg ring-4 ring-amber-500/30'
                : table.status === 'FREE'
                ? 'border-emerald-500 bg-white dark:bg-slate-900 hover:border-emerald-600 hover:shadow-md'
                : [
                    'bg-rose-50/50 dark:bg-rose-950/30 hover:shadow-md',
                    getTableTimerStyle(table).border
                  ]
            ]"
          >
            <!-- Action buttons for occupied tables -->
            <div v-if="table.status === 'OCCUPIED'" class="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
              <button
                @click="openTransferModal(table, $event)"
                class="w-7 h-7 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center transition-all shadow-md cursor-pointer active:scale-90"
                title="Stolni ko'chirish yoki birlashtirish"
              >
                <ArrowRightLeft class="w-3.5 h-3.5" />
              </button>
              <button
                @click="handleCloseTable(table.id, $event)"
                class="w-7 h-7 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-all shadow-md cursor-pointer active:scale-90"
                title="Stolni yopish"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Table Number & Status Pill -->
            <div class="flex items-center gap-3 w-full mb-2">
              <div
                :class="[
                  'w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black font-mono transition-colors shrink-0 shadow-md',
                  table.status === 'OCCUPIED'
                    ? 'bg-gradient-to-br from-rose-600 to-red-600 text-white shadow-rose-500/30'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30'
                ]"
              >
                {{ table.number }}
              </div>
              
              <div class="min-w-0 flex-1">
                <p class="font-black text-sm text-slate-900 dark:text-white leading-tight truncate">
                  {{ table.name || `${table.number}-Stol` }}
                </p>

                <div
                  :class="[
                    'text-[10px] font-black px-2 py-0.5 rounded-full mt-1 inline-flex items-center gap-1 uppercase tracking-wider',
                    table.status === 'FREE'
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                      : getTableTimerStyle(table).pill
                  ]"
                >
                  <span :class="['w-1.5 h-1.5 rounded-full', table.status === 'FREE' ? 'bg-emerald-500' : 'bg-rose-500 animate-ping']"></span>
                  <span>{{ table.status === 'FREE' ? 'BO\'SH' : getTableTimerStyle(table).tag }}</span>
                </div>
              </div>
            </div>

            <!-- Bottom Content (Infographics: Timer / Items Count / Subtotal) -->
            <div class="mt-auto w-full pt-2 border-t border-slate-200 dark:border-slate-800">
              <template v-if="table.status === 'FREE'">
                <div class="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  <span class="flex items-center gap-1">
                    <CheckCircle2 class="w-3.5 h-3.5" />
                    <span>Bo'sh · Tayyor</span>
                  </span>
                  <span class="text-[10px] font-mono text-slate-400">4 o'rin</span>
                </div>
              </template>

              <template v-else>
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-[10px] font-bold">
                    <span :class="['flex items-center gap-1', getTableTimerStyle(table).text]">
                      <Clock class="w-3 h-3" />
                      <span>{{ startedAt(table) }} ({{ elapsedTime(table) }})</span>
                    </span>
                    <span v-if="tableCartCount(table) > 0" class="font-mono bg-rose-200/60 dark:bg-rose-900/40 px-1.5 py-0.5 rounded text-rose-800 dark:text-rose-200">
                      {{ tableCartCount(table) }} taom
                    </span>
                  </div>

                  <div v-if="tableSubtotal(table) > 0" class="text-xs font-mono font-black text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 rounded-lg border border-rose-300 dark:border-rose-800 text-right">
                    💰 {{ tableSubtotal(table).toLocaleString('uz-UZ') }} so'm
                  </div>
                </div>
              </template>
            </div>
          </button>
        </div>
      </div>

      <!-- 👑 SECTION 2: ALOHIDA VIP XONALAR (2-QAVAT: 6 TA XONA) -->
      <div v-if="(activeTab === 'ALL' || activeTab === 'ROOMS') && vipRoomTables.length > 0">
        
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <button
            v-for="table in vipRoomTables"
            :key="table.id"
            @click="selectTable(table)"
            :class="[
              'relative flex flex-col rounded-3xl p-5 text-left transition-all duration-150 cursor-pointer group overflow-hidden min-h-[165px] active:scale-[0.98] border-2 shadow-md',
              posStore.activeTableId === table.id
                ? 'border-amber-500 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent shadow-xl ring-4 ring-amber-500/40'
                : table.status === 'FREE'
                ? 'border-amber-500/80 bg-white dark:bg-slate-900 hover:border-amber-500 hover:shadow-lg'
                : [
                    'bg-rose-50/60 dark:bg-rose-950/40 hover:shadow-lg',
                    getTableTimerStyle(table).border
                  ]
            ]"
          >
            <!-- Action buttons for occupied VIP rooms -->
            <div v-if="table.status === 'OCCUPIED'" class="absolute top-3 right-3 flex items-center gap-1.5 z-10">
              <button
                @click="openTransferModal(table, $event)"
                class="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center transition-all shadow-md cursor-pointer active:scale-90"
                title="Xonani ko'chirish yoki birlashtirish"
              >
                <ArrowRightLeft class="w-4 h-4" />
              </button>
              <button
                @click="handleCloseTable(table.id, $event)"
                class="w-8 h-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-all shadow-md cursor-pointer active:scale-90"
                title="Xonani yopish"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- VIP Badge Header Tag -->
            <div class="flex items-center justify-between mb-2">
              <span class="inline-flex items-center gap-1.5 text-[11px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                <Crown class="w-3.5 h-3.5 text-amber-500" /> 2-QAVAT · VIP
              </span>

              <span 
                :class="[
                  'text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider',
                  table.status === 'FREE' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : getTableTimerStyle(table).pill
                ]"
              >
                {{ table.status === 'FREE' ? 'BO\'SH' : getTableTimerStyle(table).tag }}
              </span>
            </div>

            <!-- Table Number & Name -->
            <div class="flex items-center space-x-3 my-2">
              <div 
                :class="[
                  'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black font-mono shadow-md shrink-0',
                  table.status === 'OCCUPIED'
                    ? 'bg-gradient-to-br from-rose-600 to-red-600 text-white shadow-rose-500/30'
                    : 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-amber-500/30'
                ]"
              >
                {{ table.number >= 16 ? (table.number - 15) : table.number }}
              </div>

              <div>
                <h4 class="font-black text-lg text-slate-900 dark:text-white leading-tight">
                  {{ table.name }}
                </h4>
                <p class="text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                  ⭐ Alohida VIP Xona
                </p>
              </div>
            </div>

            <!-- Bottom Content -->
            <div class="mt-auto w-full pt-2.5 border-t border-amber-500/20">
              <template v-if="table.status === 'FREE'">
                <div class="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <span>🟢 Xona qabulga tayyor</span>
                  <span class="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-black">VIP Lounge</span>
                </div>
              </template>

              <template v-else>
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-xs font-bold">
                    <span :class="['flex items-center gap-1', getTableTimerStyle(table).text]">
                      <Clock class="w-3.5 h-3.5" />
                      <span>⏱️ {{ startedAt(table) }} ({{ elapsedTime(table) }})</span>
                    </span>
                    <span v-if="tableCartCount(table) > 0" class="font-mono bg-rose-200/60 dark:bg-rose-900/40 px-2 py-0.5 rounded text-rose-800 dark:text-rose-200">
                      🛒 {{ tableCartCount(table) }} taom
                    </span>
                  </div>

                  <div v-if="tableSubtotal(table) > 0" class="text-sm font-mono font-black text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/50 px-2.5 py-1 rounded-xl border border-rose-300 dark:border-rose-800 text-right">
                    💰 {{ tableSubtotal(table).toLocaleString('uz-UZ') }} so'm
                  </div>
                </div>
              </template>
            </div>

          </button>
        </div>
      </div>

    </div>

    <!-- ── 3. CUSTOM STOLNI YOPISH CONFIRMATION MODAL ── -->
    <Teleport to="body">
      <div 
        v-if="closingTable"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm transition-all duration-300"
      >
        <div 
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200"
          @click.stop
        >
          <div class="flex items-center space-x-3 text-amber-500">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle class="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 class="font-black text-lg text-slate-900 dark:text-white">
                {{ closingTable.name || closingTable.number + '-Stol' }}ni yopish
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Stolni bo'shatish va sessiyani yakunlash
              </p>
            </div>
          </div>

          <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-sm">
            <div class="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Sessiyada to'langan:</span>
              <span class="font-black font-mono text-emerald-600 dark:text-emerald-400">
                {{ (closingTable.totalPaid || 0).toLocaleString('uz-UZ') }} so'm
              </span>
            </div>
            <div class="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Buyurtma taomlar soni:</span>
              <span class="font-bold font-mono text-slate-900 dark:text-white">
                {{ tableCartCount(closingTable) }} ta
              </span>
            </div>
            <p class="text-xs text-rose-500 dark:text-rose-400 font-medium pt-1 border-t border-slate-200 dark:border-slate-700">
              ⚠️ Stol yopilgach, u bo'sh (FREE) holatga o'tadi va yangi mehmonlar uchun tayyor bo'ladi.
            </p>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              @click="cancelCloseTable"
              class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              @click="confirmCloseTable"
              class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-black shadow-lg shadow-rose-500/25 hover:from-rose-600 hover:to-red-700 transition-all text-sm flex items-center space-x-2 cursor-pointer"
            >
              <span>Ha, stolni yopish</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── 4. TABLE TRANSFER & MERGE MODAL ── -->
    <Teleport to="body">
      <div 
        v-if="transferModalOpen && sourceTable"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div 
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div class="flex items-center space-x-3 text-amber-500">
              <div class="w-11 h-11 rounded-2xl bg-amber-500/15 flex items-center justify-center shrink-0">
                <ArrowRightLeft class="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 class="font-black text-lg text-slate-900 dark:text-white">
                  {{ sourceTable.name || sourceTable.number + '-Stol' }}ni Ko'chirish
                </h3>
                <p class="text-xs text-slate-500">
                  Buyurtmani boshqa stolga o'tkazish yoki birlashtirish
                </p>
              </div>
            </div>
            <button 
              @click="transferModalOpen = false" 
              class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Current Order Summary -->
          <div class="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span class="text-slate-500 block font-bold">Ko'chirilayotgan stol:</span>
              <span class="font-black text-slate-900 dark:text-white text-sm">{{ sourceTable.name }}</span>
            </div>
            <div class="text-right">
              <span class="text-slate-500 block font-bold">{{ tableCartCount(sourceTable) }} ta taom:</span>
              <span class="font-black text-amber-600 dark:text-amber-400 font-mono text-sm">{{ tableSubtotal(sourceTable).toLocaleString('uz-UZ') }} so'm</span>
            </div>
          </div>

          <!-- Destination Table Selector -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Qaysi stolga ko'chirilsin?
            </label>
            
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
              <button
                v-for="t in posStore.tables.filter(x => x.id !== sourceTable?.id)"
                :key="t.id"
                type="button"
                @click="targetTableId = t.id"
                :class="[
                  'p-3 rounded-2xl border text-center transition cursor-pointer font-bold text-xs flex flex-col items-center justify-center gap-1',
                  targetTableId === t.id
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                    : t.status === 'FREE'
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/50 hover:border-amber-400'
                    : 'bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-700/50 hover:border-amber-400'
                ]"
              >
                <span class="text-base font-black">{{ t.number >= 16 ? (t.number - 15) : t.number }}</span>
                <span class="text-[10px] truncate max-w-full">{{ t.name }}</span>
                <span :class="['text-[8px] font-black px-1 rounded uppercase', t.status === 'FREE' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/20 text-rose-700 dark:text-rose-300']">
                  {{ t.status === 'FREE' ? 'Bo\'sh' : 'Band' }}
                </span>
              </button>
            </div>
          </div>

          <!-- Merge mode toggle if destination is occupied -->
          <div v-if="posStore.tables.find(t => t.id === targetTableId)?.status === 'OCCUPIED'" class="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tanlangan stol band. Hisoblarni birlashtirish:
            </span>
            <input 
              type="checkbox" 
              v-model="isMergeMode"
              class="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              @click="transferModalOpen = false"
              class="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              :disabled="!targetTableId"
              @click="handleExecuteTransfer"
              class="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 transition text-xs disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowRightLeft class="w-4 h-4" />
              <span>{{ isMergeMode ? 'Hisoblarni Birlashtirish' : 'Stolni Ko\'chirish' }}</span>
            </button>
          </div>

        </div>
      </div>
    </Teleport>

  </div>
</template>
