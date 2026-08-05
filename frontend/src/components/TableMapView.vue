<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { usePosStore } from '../stores/posStore';
import type { Table } from '../types/pos';
import { Users, ShoppingBag, ChevronRight, Clock, X, DoorOpen } from 'lucide-vue-next';

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
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <div
          v-for="table in posStore.tables"
          :key="table.id"
          @click="selectTable(table)"
          :class="[
            'relative flex flex-col rounded-3xl border-2 p-4 text-left transition-all duration-200 cursor-pointer group overflow-hidden',
            posStore.activeTableId === table.id
              ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 shadow-xl shadow-amber-500/20 scale-[1.01]'
              : table.status === 'FREE'
                ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-300 hover:shadow-lg'
                : 'border-amber-400/60 bg-amber-50 dark:bg-amber-500/5 hover:border-amber-500 hover:shadow-xl shadow-md shadow-amber-500/10'
          ]"
        >
          <!-- Pulsing dot for active table -->
          <div
            v-if="posStore.activeTableId === table.id"
            class="absolute top-3 left-3 w-2 h-2 rounded-full bg-amber-500 animate-pulse"
          />

          <!-- Close button (faqat band stolda) -->
          <button
            v-if="table.status === 'OCCUPIED'"
            @click="handleCloseTable(table.id, $event)"
            class="absolute top-2.5 right-2.5 w-6 h-6 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white flex items-center justify-center transition-all z-10"
            title="Stolni yopish"
          >
            <X class="w-3.5 h-3.5" />
          </button>

          <!-- Table number -->
          <div class="flex items-center gap-2 mb-3" :class="table.status === 'OCCUPIED' ? 'pr-6' : ''">
            <div
              :class="[
                'w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner transition-colors shrink-0',
                table.status === 'FREE'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              ]"
            >
              {{ table.number }}
            </div>
            <div>
              <p class="font-extrabold text-sm text-slate-900 dark:text-white leading-none">{{ table.number }}-Stol</p>
              <!-- Status badge -->
              <span
                :class="[
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 inline-block',
                  table.status === 'FREE'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                ]"
              >
                {{ table.status === 'FREE' ? '🟢 Bo\'sh' : '🟡 Band' }}
              </span>
            </div>
          </div>

          <!-- FREE state -->
          <template v-if="table.status === 'FREE'">
            <div class="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-600 mt-auto">
              <DoorOpen class="w-3.5 h-3.5" />
              <span>Buyurtma yo'q</span>
            </div>
          </template>

          <!-- OCCUPIED state -->
          <template v-else>
            <!-- Real-time timer -->
            <div class="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 mb-1">
              <Clock class="w-3 h-3 shrink-0" />
              <span>{{ startedAt(table) }} dan — </span>
              <span class="text-amber-500 dark:text-amber-300 tabular-nums">{{ elapsedTime(table) }}</span>
            </div>

            <!-- Cart items count -->
            <div v-if="table.cart.length > 0" class="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              <ShoppingBag class="w-3 h-3 shrink-0" />
              <span>{{ table.cart.length }} taom savatlangan</span>
            </div>
            <div v-else class="text-[11px] text-slate-400 dark:text-slate-600 mb-1">
              Savat bo'sh — taom qo'shing
            </div>

            <!-- Current cart subtotal -->
            <p v-if="tableSubtotal(table) > 0" class="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
              {{ tableSubtotal(table).toLocaleString('uz-UZ') }} <span class="text-[10px] font-bold">so'm</span>
            </p>

            <!-- Total paid in session -->
            <div v-if="table.totalPaid > 0" class="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              ✅ To'langan: {{ table.totalPaid.toLocaleString('uz-UZ') }} so'm
            </div>

            <!-- Waiter note -->
            <p v-if="table.waiterNote" class="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 italic truncate">
              "{{ table.waiterNote }}"
            </p>
          </template>

          <!-- Hover arrow -->
          <div class="absolute bottom-3 right-3 opacity-0 group-hover:opacity-60 transition-opacity">
            <ChevronRight class="w-4 h-4 text-amber-500" />
          </div>
        </div>
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
