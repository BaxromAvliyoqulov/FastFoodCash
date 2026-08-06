<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { usePosStore } from '../stores/posStore';
import type { Table } from '../types/pos';
import { Users, ChevronRight, Clock, X, DoorOpen } from 'lucide-vue-next';

const posStore = usePosStore();

const emit = defineEmits<{
  (e: 'table-selected', tableId: string): void;
}>();

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

// Qancha vaqt o'tgani (masalan: "23 daqiqa" yoki "1s 5d")
function elapsedTime(table: Table): string {
  if (!table.openedAt) return '';
  const ms = now.value - table.openedAt;
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;

  if (hours > 0) return `${hours}s ${remMins}d`;
  if (mins > 0) return `${mins} daqiqa`;
  return `${totalSec} soniya`;
}

// Boshlanish vaqti (masalan: "17:15")
function startedAt(table: Table): string {
  if (!table.openedAt) return '';
  return new Date(table.openedAt).toLocaleTimeString('uz-UZ', {
    hour: '2-digit', minute: '2-digit'
  });
}

// Stol jami summasi
function tableSubtotal(table: Table): number {
  return table.cart.reduce((s, i) => s + i.totalPrice, 0);
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
    `${table.number}-Stolni yopmoqchimisiz?\n` +
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
  <div class="h-full flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="shrink-0 px-4 pt-4 pb-3 border-b border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Users class="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h2 class="font-extrabold text-sm text-slate-900 dark:text-white">Zal — Stol Xaritasi</h2>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">Stol bosing → buyurtma kiriting</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
            🟢 {{ posStore.tables.filter(t => t.status === 'FREE').length }} bo'sh
          </span>
          <span class="text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-xl">
            🟡 {{ posStore.tables.filter(t => t.status === 'OCCUPIED').length }} band
          </span>
        </div>
      </div>
    </div>

    <!-- Table Grid -->
    <div class="flex-1 overflow-y-auto p-4">
      <div class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
        <button
          v-for="table in posStore.tables.filter(t => t.isActive)"
          :key="table.id"
          @click="selectTable(table)"
          :class="[
            'relative flex flex-col rounded-3xl border-2 p-4 text-left transition-all duration-200 cursor-pointer group overflow-hidden min-h-[140px]',
            posStore.activeTableId === table.id
              ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 shadow-[0_0_25px_rgba(245,158,11,0.3)] scale-[1.03] ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-950 z-10'
              : table.status === 'FREE'
                ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-300 hover:shadow-lg hover:-translate-y-1'
                : 'border-amber-400/80 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 hover:border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-[1.01]'
          ]"
        >
          <!-- Close button for occupied tables -->
          <button
            v-if="table.status === 'OCCUPIED'"
            @click="handleCloseTable(table.id, $event)"
            class="absolute top-2.5 right-2.5 w-7 h-7 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white flex items-center justify-center transition-all z-10 opacity-0 group-hover:opacity-100"
          >
            <X class="w-4 h-4" />
          </button>

          <!-- Table number and status -->
          <div class="flex items-start gap-3 w-full mb-3" :class="table.status === 'OCCUPIED' ? 'pr-6' : ''">
            <div
              :class="[
                'w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black transition-colors shrink-0',
                posStore.activeTableId === table.id || table.status === 'OCCUPIED'
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-inner'
              ]"
            >
              {{ table.number }}
            </div>
            <div class="min-w-0 pt-0.5">
              <p class="font-extrabold text-sm text-slate-900 dark:text-white leading-none truncate">{{ table.name || `${table.number}-Stol` }}</p>
              <div
                :class="[
                  'text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 inline-flex items-center gap-1.5',
                  table.status === 'FREE'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                ]"
              >
                <span :class="['w-1.5 h-1.5 rounded-full', table.status === 'FREE' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse']"></span>
                <span>{{ table.status === 'FREE' ? 'Bo\'sh' : 'Band (Zaynit)' }}</span>
              </div>
            </div>
          </div>

          <!-- Bottom content fixed at bottom -->
          <div class="mt-auto w-full">
            <template v-if="table.status === 'FREE'">
              <div class="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 mt-auto">
                <DoorOpen class="w-4 h-4" />
                <span>Buyurtma yo'q</span>
              </div>
            </template>
            <template v-else>
              <div class="flex items-center justify-between gap-1 w-full">
                <div class="flex flex-col min-w-0">
                  <div class="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 truncate">
                    <Clock class="w-3.5 h-3.5 shrink-0" />
                    <span class="truncate">{{ startedAt(table) }} – <span class="tabular-nums">{{ elapsedTime(table) }}</span></span>
                  </div>
                  <div class="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {{ table.cart.length > 0 ? table.cart.length + ' ta taom savatda' : 'Savat bo\'sh' }}
                  </div>
                </div>
                <div v-if="tableSubtotal(table) > 0" class="text-sm font-black text-amber-600 dark:text-amber-400 font-mono shrink-0 ml-1">
                  {{ (tableSubtotal(table) / 1000).toFixed(0) }}k
                </div>
              </div>
            </template>
          </div>

          <!-- Hover arrow -->
          <div class="absolute bottom-3 right-3 opacity-0 group-hover:opacity-60 transition-opacity">
            <ChevronRight class="w-4 h-4 text-amber-500" />
          </div>
        </button>
      </div>
    </div>

    <!-- Bottom hint -->
    <div class="shrink-0 px-4 py-2.5 border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30">
      <p class="text-[11px] text-center text-slate-400 dark:text-slate-600">
        Stol bosing → taom qo'shing → to'lov → stol ochiq qoladi &nbsp;|&nbsp;
        <span class="text-rose-400">✕</span> — stolni yopish (mijoz ketganda)
      </p>
    </div>
  </div>
</template>
