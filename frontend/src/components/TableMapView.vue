<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePosStore } from '../stores/posStore';
import type { Table } from '../types/pos';
import { 
  Clock, X, Crown, Armchair, CheckCircle2, Layers,
  Activity, Utensils
} from 'lucide-vue-next';

const posStore = usePosStore();

const emit = defineEmits<{
  (e: 'table-selected', tableId: string): void;
}>();

// Active Filter: Zone & Status
const activeTab = ref<'ALL' | 'ZAL' | 'ROOMS'>('ALL');
const statusFilter = ref<'ALL' | 'FREE' | 'OCCUPIED'>('ALL');

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

// Separate tables into Zal vs Rooms
const activeTablesList = computed(() => posStore.tables.filter(t => t.isActive));

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

const totalActiveTablesCount = computed(() => activeTablesList.value.length);
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
  const confirm = window.confirm(
    `${table.name || table.number + '-Stol'}ni yopmoqchimisiz?\n` +
    `Sessiyada to'langan: ${table.totalPaid.toLocaleString('uz-UZ')} so'm\n` +
    `Stol bo'sh holatga qaytadi.`
  );
  if (confirm) {
    posStore.closeTable(tableId);
    if (posStore.activeTableId === tableId) {
      posStore.clearActiveTable();
    }
  }
}
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
    
    <!-- ── 1. TOP HEADER & METRIC BAR ── -->
    <div class="shrink-0 p-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md space-y-3">
      
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 shrink-0">
            <Armchair class="w-5 h-5" />
          </div>
          <div>
            <h2 class="font-black text-base text-slate-900 dark:text-white tracking-wide">
              Zal & Xonalar Xaritasi
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Stol yoki Xonani bosing → Kassada buyurtma kiriting
            </p>
          </div>
        </div>

        <!-- Metric Pills & Status Filters -->
        <div class="flex flex-wrap items-center gap-2.5">
          
          <!-- Total Active Sales Sum Pill -->
          <div v-if="totalActiveSalesSum > 0" class="flex items-center gap-1.5 bg-rose-500/15 text-rose-600 dark:text-rose-400 px-3.5 py-1.5 rounded-xl border border-rose-500/30 font-black text-xs font-mono">
            <Activity class="w-3.5 h-3.5" />
            <span>💰 {{ totalActiveSalesSum.toLocaleString('uz-UZ') }} so'm</span>
          </div>

          <!-- Status Filters -->
          <div class="flex items-center gap-1.5 ml-auto">
            <button 
              @click="statusFilter = statusFilter === 'FREE' ? 'ALL' : 'FREE'"
              :class="[
                'text-xs font-black px-3.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5',
                statusFilter === 'FREE' 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              ]"
            >
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>🟢 {{ freeCount }} bo'sh</span>
            </button>

            <button 
              @click="statusFilter = statusFilter === 'OCCUPIED' ? 'ALL' : 'OCCUPIED'"
              :class="[
                'text-xs font-black px-3.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5',
                statusFilter === 'OCCUPIED' 
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md' 
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
              ]"
            >
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>🔴 {{ occupiedCount }} band</span>
            </button>
          </div>

        </div>

      </div>

      <!-- Zone Partition Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
        <button 
          @click="activeTab = 'ALL'"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'ALL'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          ]"
        >
          <Layers class="w-3.5 h-3.5 text-amber-500" />
          <span>Barchasi ({{ totalActiveTablesCount }})</span>
        </button>

        <button 
          @click="activeTab = 'ZAL'"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'ZAL'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          ]"
        >
          <Armchair class="w-3.5 h-3.5 text-emerald-500" />
          <span>🏛️ Asosiy Zal (15 stol)</span>
        </button>

        <button 
          @click="activeTab = 'ROOMS'"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
            activeTab === 'ROOMS'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          ]"
        >
          <Crown class="w-3.5 h-3.5 text-amber-400" />
          <span>👑 VIP Xonalar (6 xona)</span>
        </button>
      </div>
    </div>

    <!-- ── 2. SEPARATED STOLLAR & XONALAR SCROLLABLE BODY ── -->
    <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-7">
      
      <!-- 🏛️ SECTION 1: ASOSIY ZAL STOLLARI -->
      <div v-if="(activeTab === 'ALL' || activeTab === 'ZAL') && mainHallTables.length > 0" class="space-y-3">
        <div class="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h3 class="font-black text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              🏛️ Asosiy Zal Stollari
            </h3>
          </div>
          <span class="text-xs font-bold text-slate-400 font-mono">{{ mainHallTables.length }} ta stol</span>
        </div>

        <div class="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4">
          <button
            v-for="table in mainHallTables"
            :key="table.id"
            @click="selectTable(table)"
            :class="[
              'relative flex flex-col rounded-3xl p-4 text-left transition-all duration-300 cursor-pointer group overflow-hidden min-h-[155px] hover:-translate-y-1 hover:shadow-xl border-t-4',
              posStore.activeTableId === table.id
                ? 'border-t-amber-500 border-x-2 border-b-2 border-amber-500/80 bg-gradient-to-br from-amber-500/20 via-amber-50 to-orange-100 dark:from-amber-900/40 dark:to-orange-950/40 shadow-xl shadow-amber-500/20 ring-4 ring-amber-500/30 scale-[1.03] z-10'
                : table.status === 'FREE'
                ? 'border-t-emerald-500 border-x border-b border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 hover:border-emerald-500 shadow-sm'
                : 'border-t-rose-600 border-x-2 border-b-2 border-rose-500/60 bg-rose-500/15 dark:bg-rose-950/40 ring-1 ring-rose-500/30 shadow-lg shadow-rose-500/10'
            ]"
          >
            <!-- Close button for occupied tables -->
            <button
              v-if="table.status === 'OCCUPIED'"
              @click="handleCloseTable(table.id, $event)"
              class="absolute top-3 right-3 w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center transition-all z-10 opacity-80 hover:opacity-100 shadow-md"
              title="Stolni yopish"
            >
              <X class="w-4 h-4" />
            </button>

            <!-- Table Number & Status Pill -->
            <div class="flex items-start gap-3 w-full mb-3" :class="table.status === 'OCCUPIED' ? 'pr-6' : ''">
              <div
                :class="[
                  'w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black transition-colors shrink-0 shadow-md',
                  table.status === 'OCCUPIED'
                    ? 'bg-gradient-to-br from-rose-600 to-red-600 text-white shadow-rose-500/30'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/25'
                ]"
              >
                {{ table.number }}
              </div>
              
              <div class="min-w-0 pt-0.5">
                <p class="font-black text-sm text-slate-900 dark:text-white leading-none truncate">
                  {{ table.name || `${table.number}-Stol` }}
                </p>

                <div
                  :class="[
                    'text-[10px] font-black px-2 py-0.5 rounded-full mt-1.5 inline-flex items-center gap-1 uppercase tracking-wider',
                    table.status === 'FREE'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                  ]"
                >
                  <span :class="['w-1.5 h-1.5 rounded-full', table.status === 'FREE' ? 'bg-emerald-500' : 'bg-rose-500 animate-ping']"></span>
                  <span>{{ table.status === 'FREE' ? 'BO\'SH' : 'BAND' }}</span>
                </div>
              </div>
            </div>

            <!-- Bottom Content (Infographics: Timer / Items Count / Subtotal) -->
            <div class="mt-auto w-full pt-2 border-t" :class="table.status === 'OCCUPIED' ? 'border-rose-500/20' : 'border-emerald-500/20'">
              <template v-if="table.status === 'FREE'">
                <div class="flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span class="flex items-center gap-1">
                    <CheckCircle2 class="w-3.5 h-3.5" />
                    <span>Joy tayyor</span>
                  </span>
                  <span class="text-[10px] font-mono opacity-70">🪑 4 o'rin</span>
                </div>
              </template>

              <template v-else>
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-[10px] font-bold text-rose-600/90 dark:text-rose-400/90">
                    <span class="flex items-center gap-1">
                      <Clock class="w-3 h-3 text-rose-500" />
                      <span>{{ startedAt(table) }} ({{ elapsedTime(table) }})</span>
                    </span>
                    <span v-if="tableCartCount(table) > 0" class="flex items-center gap-0.5 font-mono">
                      <Utensils class="w-3 h-3" /> {{ tableCartCount(table) }} taom
                    </span>
                  </div>

                  <div v-if="tableSubtotal(table) > 0" class="text-xs font-mono font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20 text-right">
                    💰 {{ tableSubtotal(table).toLocaleString('uz-UZ') }} so'm
                  </div>
                </div>
              </template>
            </div>
          </button>
        </div>
      </div>

      <!-- 👑 SECTION 2: ALOHIDA VIP XONALAR & KABINETLAR -->
      <div v-if="(activeTab === 'ALL' || activeTab === 'ROOMS') && vipRoomTables.length > 0" class="space-y-3 pt-2">
        <div class="flex items-center justify-between border-b border-amber-500/30 pb-2">
          <div class="flex items-center gap-2">
            <Crown class="w-4 h-4 text-amber-500" />
            <h3 class="font-black text-sm text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              👑 Alohida VIP Xonalar & Kabinetlar
            </h3>
          </div>
          <span class="text-xs font-bold font-mono bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded-full">
            {{ vipRoomTables.length }} ta xona
          </span>
        </div>

        <div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          <button
            v-for="table in vipRoomTables"
            :key="table.id"
            @click="selectTable(table)"
            :class="[
              'relative flex flex-col rounded-3xl p-4 text-left transition-all duration-300 cursor-pointer group overflow-hidden min-h-[160px] hover:-translate-y-1.5 hover:shadow-2xl border-t-4 border-t-amber-500',
              posStore.activeTableId === table.id
                ? 'border-x-2 border-b-2 border-amber-500 bg-gradient-to-br from-amber-500/30 via-orange-950/40 to-slate-950 shadow-2xl shadow-amber-500/30 ring-4 ring-amber-500/40 scale-[1.03] z-10'
                : table.status === 'FREE'
                ? 'border-x border-b border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:bg-slate-900 hover:border-amber-500 shadow-md shadow-amber-500/5'
                : 'border-x-2 border-b-2 border-rose-500/70 bg-gradient-to-br from-rose-500/20 via-rose-950/40 to-slate-950 ring-2 ring-rose-500/40 shadow-xl shadow-rose-500/20'
            ]"
          >
            <!-- Close button for occupied VIP rooms -->
            <button
              v-if="table.status === 'OCCUPIED'"
              @click="handleCloseTable(table.id, $event)"
              class="absolute top-3 right-3 w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center transition-all z-10 opacity-80 hover:opacity-100 shadow-md"
              title="Xonani yopish"
            >
              <X class="w-4 h-4" />
            </button>

            <!-- VIP Badge Header Tag -->
            <div class="flex items-center justify-between mb-2">
              <span class="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <Crown class="w-3 h-3 text-amber-500" /> VIP XONA
              </span>

              <span 
                :class="[
                  'text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider',
                  table.status === 'FREE' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                ]"
              >
                {{ table.status === 'FREE' ? 'BO\'SH' : 'BAND' }}
              </span>
            </div>

            <!-- Table Number & Name -->
            <div class="flex items-center space-x-3 my-2">
              <div 
                :class="[
                  'w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black font-mono shadow-md shrink-0',
                  table.status === 'OCCUPIED'
                    ? 'bg-gradient-to-br from-rose-600 to-red-600 text-white shadow-rose-500/30'
                    : 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-amber-500/30'
                ]"
              >
                {{ table.number }}
              </div>

              <div>
                <h4 class="font-black text-base text-slate-900 dark:text-white leading-tight">
                  {{ table.name }}
                </h4>
                <p class="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                  ⭐ VIP Xizmat
                </p>
              </div>
            </div>

            <!-- Bottom Content -->
            <div class="mt-auto w-full pt-2 border-t border-amber-500/20">
              <template v-if="table.status === 'FREE'">
                <div class="flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span>🟢 Xona tayyor</span>
                  <span class="text-[10px] font-mono text-amber-500">👑 VIP Lounge</span>
                </div>
              </template>

              <template v-else>
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-[10px] font-bold text-rose-600 dark:text-rose-400">
                    <span>⏱️ {{ startedAt(table) }} ({{ elapsedTime(table) }})</span>
                    <span v-if="tableCartCount(table) > 0" class="font-mono">
                      🛒 {{ tableCartCount(table) }} taom
                    </span>
                  </div>

                  <div v-if="tableSubtotal(table) > 0" class="text-xs font-mono font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20 text-right">
                    💰 {{ tableSubtotal(table).toLocaleString('uz-UZ') }} so'm
                  </div>
                </div>
              </template>
            </div>

          </button>
        </div>
      </div>

    </div>

    <!-- ── 3. BOTTOM HINT ── -->
    <div class="shrink-0 px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
      <p class="text-[11px] text-center text-slate-500 dark:text-slate-400 font-medium">
        💡 Stol / Xonaga bosing → Taom qo'shing → To'lov qiling &nbsp;|&nbsp;
        <span class="text-rose-500 font-bold">✕</span> — Stolni yopish
      </p>
    </div>

  </div>
</template>
