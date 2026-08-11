<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePosStore } from '../stores/posStore';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { 
  Plus, Save, X, Edit2, Trash2, 
  ToggleRight,
  Utensils, Sparkles, Crown, Armchair,
  ArrowUpRight, MapPin, Grid, Layers
} from 'lucide-vue-next';
import { Table } from '../types/pos';

const posStore = usePosStore();
const authStore = useAuthStore();
const toast = useToastStore();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

const isLoading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const currentTableId = ref<string | null>(null);

// Interactive View States
const viewMode = ref<'MAP' | 'GRID'>('MAP');
const activeZone = ref<'ALL' | 'MAIN' | 'VIP' | 'TERRACE'>('ALL');
const activeFilter = ref<'ALL' | 'FREE' | 'OCCUPIED' | 'INACTIVE'>('ALL');
const selectedDetailTable = ref<Table | null>(null);

const form = ref({
  name: '',
  number: 1
});

onMounted(() => {
  posStore.loadTables();
});

// Computed Table Metrics
const totalTablesCount = computed(() => posStore.tables.length);

const freeTablesCount = computed(() => {
  return posStore.tables.filter(t => t.isActive && getTableState(t) === 'FREE').length;
});

const occupiedTablesCount = computed(() => {
  return posStore.tables.filter(t => t.isActive && getTableState(t) === 'OCCUPIED').length;
});

const inactiveTablesCount = computed(() => {
  return posStore.tables.filter(t => !t.isActive).length;
});

// Helper to determine real table state (FREE vs OCCUPIED)
function getTableState(table: Table): 'FREE' | 'OCCUPIED' {
  const isSelected = posStore.activeTableId === table.id;
  const hasCart = (table.cart && table.cart.length > 0) || (isSelected && posStore.cart.length > 0);
  const isOccupiedStatus = table.status === 'OCCUPIED';
  
  if (hasCart || isOccupiedStatus) {
    return 'OCCUPIED';
  }
  return 'FREE';
}

function getTableOrderSum(table: Table): number {
  const cartSum = (table.cart || []).reduce((sum, item) => sum + item.totalPrice, 0);
  if (posStore.activeTableId === table.id) {
    return cartSum + posStore.cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }
  return cartSum;
}

function getTableItemCount(table: Table): number {
  const cartCount = (table.cart || []).reduce((sum, item) => sum + item.quantity, 0);
  if (posStore.activeTableId === table.id) {
    return cartCount + posStore.cart.reduce((sum, item) => sum + item.quantity, 0);
  }
  return cartCount;
}

function getTableZone(table: Table): 'MAIN' | 'VIP' | 'TERRACE' {
  const name = (table.name || '').toLowerCase();
  if (name.includes('xona') || name.includes('vip') || table.number >= 16) {
    return 'VIP';
  }
  if (name.includes('terasa') || name.includes('veranda') || name.includes('bosh')) {
    return 'TERRACE';
  }
  return 'MAIN';
}

// Filtered Tables List
const filteredTables = computed(() => {
  return posStore.tables.filter(table => {
    // Zone filter
    if (activeZone.value !== 'ALL' && getTableZone(table) !== activeZone.value) {
      return false;
    }
    // Status filter
    if (activeFilter.value === 'FREE') return table.isActive && getTableState(table) === 'FREE';
    if (activeFilter.value === 'OCCUPIED') return table.isActive && getTableState(table) === 'OCCUPIED';
    if (activeFilter.value === 'INACTIVE') return !table.isActive;
    return true;
  });
});

const mainZoneTables = computed(() => filteredTables.value.filter(t => getTableZone(t) === 'MAIN'));
const vipZoneTables = computed(() => filteredTables.value.filter(t => getTableZone(t) === 'VIP'));

function openAddModal() {
  isEditing.value = false;
  currentTableId.value = null;
  form.value = { name: `Stol #${posStore.tables.length + 1}`, number: posStore.tables.length + 1 };
  showModal.value = true;
}

function openEditModal(table: Table) {
  isEditing.value = true;
  currentTableId.value = table.id;
  form.value = { name: table.name, number: table.number };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

async function handleSaveTable() {
  if (!form.value.name.trim()) return;
  isLoading.value = true;

  try {
    if (isEditing.value && currentTableId.value) {
      await fetch(`${API_URL}/tables/${currentTableId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.value)
      });
      toast.success("Stol ma'lumotlari yangilandi! ✨");
    } else {
      await fetch(`${API_URL}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.value)
      });
      toast.success("Yangi stol muvaffaqiyatli qo'shildi! 🚀");
    }
    await posStore.loadTables();
    closeModal();
  } catch (error) {
    console.error('Save table error:', error);
    toast.error("Stolni saqlashda xatolik yuz berdi");
  } finally {
    isLoading.value = false;
  }
}

async function toggleActive(table: Table) {
  try {
    await fetch(`${API_URL}/tables/${table.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !table.isActive })
    });
    toast.info(`Stol holati ${!table.isActive ? 'yoqildi' : 'o\'chirildi'}`);
    await posStore.loadTables();
  } catch (error) {
    console.error('Toggle table active error:', error);
  }
}

async function deleteTable(tableId: string) {
  if (!confirm("Stolni o'chirishga ishonchingiz komilmi?")) return;
  try {
    await fetch(`${API_URL}/tables/${tableId}`, {
      method: 'DELETE'
    });
    toast.success("Stol o'chirildi!");
    await posStore.loadTables();
  } catch (error) {
    console.error('Delete table error:', error);
  }
}

function handleSelectTableForOrder(table: Table) {
  if (!table.isActive) {
    toast.warning("Bu stol holati o'chirilgan!");
    return;
  }
  posStore.setActiveTable(table.id);
  toast.success(`Stol #${table.number} tanlandi. Kassa bo'limiga o'tilmoqda... 🛒`);
  window.dispatchEvent(new CustomEvent('change-tab-event', { detail: 'pos' }));
}

function openTableDrawer(table: Table, event: Event) {
  event.stopPropagation();
  selectedDetailTable.value = table;
}
</script>

<template>
  <div class="w-full min-h-full bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 sm:px-8 space-y-6 text-slate-900 dark:text-slate-100 transition-colors duration-300">
    
    <!-- ── 1. UNIQ HEADER BANNER (Spatial Mode Switcher & Stats) ── -->
    <div class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
      <div class="absolute -right-10 -top-10 w-64 h-64 bg-gradient-to-br from-amber-500/15 via-purple-500/15 to-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div class="flex items-center space-x-4 relative z-10">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/30 shrink-0">
          <Armchair class="w-7 h-7" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">
              Zal & Stollar 2D Spatial Floor Plan
            </h2>
            <span class="text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              INTERACTIVE SPATIAL 3.0
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Restoran va VIP xonalarining interaktiv xaritasi, o'rindiqlar joylashuvi va zakazlar boshqaruvi
          </p>
        </div>
      </div>

      <!-- Mode Switcher & Actions -->
      <div class="flex flex-wrap items-center gap-3 relative z-10">
        
        <!-- View Mode Segmented Control -->
        <div class="flex items-center bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button 
            @click="viewMode = 'MAP'"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer',
              viewMode === 'MAP'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <MapPin class="w-4 h-4" />
            <span>📐 Zal Sxemasi (Floor Plan)</span>
          </button>
          
          <button 
            @click="viewMode = 'GRID'"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer',
              viewMode === 'GRID'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <Grid class="w-4 h-4" />
            <span>🎴 Master Grid Rejimi</span>
          </button>
        </div>

        <button 
          v-if="authStore.isAdmin" 
          @click="openAddModal" 
          class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black px-5 py-3 rounded-2xl flex items-center space-x-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all text-xs cursor-pointer ml-auto"
        >
          <Plus class="w-4.5 h-4.5" />
          <span>Yangi Stol Qo'shish</span>
        </button>
      </div>
    </div>

    <!-- ── 2. ZONAL FILTER TABS & SUMMARY COUNTERS ── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
      
      <!-- Zone Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        <button 
          @click="activeZone = 'ALL'"
          :class="[
            'px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2',
            activeZone === 'ALL'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          ]"
        >
          <Layers class="w-4 h-4 text-amber-500" />
          <span>Barcha Hududlar ({{ totalTablesCount }})</span>
        </button>

        <button 
          @click="activeZone = 'MAIN'"
          :class="[
            'px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2',
            activeZone === 'MAIN'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          ]"
        >
          <Armchair class="w-4 h-4 text-indigo-500" />
          <span>🏛️ Asosiy Zal (15 stol)</span>
        </button>

        <button 
          @click="activeZone = 'VIP'"
          :class="[
            'px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2',
            activeZone === 'VIP'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          ]"
        >
          <Crown class="w-4 h-4 text-amber-400" />
          <span>👑 VIP Kabinetlar (6 xona)</span>
        </button>
      </div>

      <!-- State Pill Filters -->
      <div class="flex items-center gap-2">
        <button 
          @click="activeFilter = activeFilter === 'FREE' ? 'ALL' : 'FREE'"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer',
            activeFilter === 'FREE' ? 'bg-emerald-600 text-white font-black' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
          ]"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Bo'sh: {{ freeTablesCount }}</span>
        </button>

        <button 
          @click="activeFilter = activeFilter === 'OCCUPIED' ? 'ALL' : 'OCCUPIED'"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer',
            activeFilter === 'OCCUPIED' ? 'bg-rose-600 text-white font-black' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
          ]"
        >
          <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span>Band: {{ occupiedTablesCount }}</span>
        </button>

        <button 
          @click="activeFilter = activeFilter === 'INACTIVE' ? 'ALL' : 'INACTIVE'"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer',
            activeFilter === 'INACTIVE' ? 'bg-slate-700 text-white font-black' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30'
          ]"
        >
          <span class="w-2 h-2 rounded-full bg-slate-400"></span>
          <span>Nofaol: {{ inactiveTablesCount }}</span>
        </button>
      </div>

    </div>

    <!-- ── 3. MODE A: INTERACTIVE 2D FLOOR PLAN SPATIAL MAP ── -->
    <div v-if="viewMode === 'MAP'" class="space-y-8 animate-in fade-in duration-300">
      
      <!-- ZONE 1: ASOSIY ZAL (MAIN DINING HALL) -->
      <div v-if="activeZone === 'ALL' || activeZone === 'MAIN'" class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 relative overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
              <Armchair class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-black text-lg text-slate-900 dark:text-white">🏛️ ASOSIY ZAL (MAIN DINING AREA)</h3>
              <p class="text-xs text-slate-500">Fast-food kassa va umumiy zal stollarining interaktiv xaritasi</p>
            </div>
          </div>
          <span class="text-xs font-bold font-mono bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full">
            {{ mainZoneTables.length }} ta Stol
          </span>
        </div>

        <!-- SPATIAL MAP GRID -->
        <div class="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-8 py-2">
          
          <div 
            v-for="table in mainZoneTables" 
            :key="table.id"
            @click="handleSelectTableForOrder(table)"
            :class="[
              'relative p-6 rounded-3xl transition-all duration-300 flex flex-col items-center justify-center cursor-pointer select-none border group hover:scale-105 active:scale-95 shadow-lg',
              !table.isActive 
                ? 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-50 grayscale'
                : getTableState(table) === 'OCCUPIED'
                ? 'bg-gradient-to-b from-rose-500/15 via-rose-500/5 to-slate-900/90 border-rose-500/60 ring-2 ring-rose-500/40 shadow-rose-500/20'
                : 'bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-slate-900/90 border-emerald-500/50 ring-1 ring-emerald-500/30 shadow-emerald-500/15'
            ]"
          >
            <!-- SPATIAL CHAIRS GEOMETRY (Visual Chairs positioned around table) -->
            <div :class="['absolute -top-3.5 w-10 h-3.5 rounded-t-xl border-2 transition-all', getTableState(table) === 'OCCUPIED' ? 'bg-rose-500 border-rose-400 shadow-md shadow-rose-500/50' : 'bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/40']"></div>
            <div :class="['absolute -bottom-3.5 w-10 h-3.5 rounded-b-xl border-2 transition-all', getTableState(table) === 'OCCUPIED' ? 'bg-rose-500 border-rose-400 shadow-md shadow-rose-500/50' : 'bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/40']"></div>
            <div :class="['absolute -left-3.5 h-10 w-3.5 rounded-l-xl border-2 transition-all', getTableState(table) === 'OCCUPIED' ? 'bg-rose-500 border-rose-400 shadow-md shadow-rose-500/50' : 'bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/40']"></div>
            <div :class="['absolute -right-3.5 h-10 w-3.5 rounded-r-xl border-2 transition-all', getTableState(table) === 'OCCUPIED' ? 'bg-rose-500 border-rose-400 shadow-md shadow-rose-500/50' : 'bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/40']"></div>

            <!-- FLOATING BILL SUM BADGE (For Occupied) -->
            <div 
              v-if="getTableState(table) === 'OCCUPIED' && getTableOrderSum(table) > 0"
              class="absolute -top-4 bg-gradient-to-r from-rose-600 to-red-600 text-white font-mono font-black text-[11px] px-3 py-1 rounded-full shadow-lg border border-rose-300/40 animate-bounce"
            >
              💰 {{ getTableOrderSum(table).toLocaleString('uz-UZ') }} so'm
            </div>

            <!-- TABLE CENTER BADGE -->
            <div class="space-y-1 text-center py-2">
              <div class="text-[10px] font-black uppercase tracking-widest text-slate-400">STOL</div>
              <div class="text-3xl font-black font-mono text-slate-900 dark:text-white leading-none">
                #{{ table.number }}
              </div>
              <div class="text-xs font-bold text-slate-700 dark:text-slate-300">
                {{ table.name }}
              </div>
              <div v-if="getTableState(table) === 'OCCUPIED' && getTableItemCount(table) > 0" class="text-[10px] font-bold text-rose-500 dark:text-rose-400">
                🛒 {{ getTableItemCount(table) }} ta taom
              </div>
            </div>

            <!-- HOVER ACTION BADGE -->
            <div class="mt-2 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl transition" :class="getTableState(table) === 'OCCUPIED' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'">
              {{ getTableState(table) === 'OCCUPIED' ? 'ZAKAZNI OCHISH' : 'ZAKAZ OLISH' }}
            </div>

            <!-- Admin Options Button -->
            <button 
              v-if="authStore.isAdmin"
              @click.stop="openTableDrawer(table, $event)"
              class="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Variantlar"
            >
              <Sparkles class="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      <!-- ZONE 2: VIP KABINETLAR & XONALAR -->
      <div v-if="activeZone === 'ALL' || activeZone === 'VIP'" class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-amber-500/30 dark:border-amber-500/20 shadow-sm space-y-5 relative overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Crown class="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 class="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>👑 VIP KABINETLAR & LOUNGE XONALAR</span>
                <span class="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full font-black">LUXURY ZONE</span>
              </h3>
              <p class="text-xs text-slate-500">Alohida yopiq VIP kabinetlar va mehmonlar o'rinlari</p>
            </div>
          </div>
          <span class="text-xs font-bold font-mono bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full">
            {{ vipZoneTables.length }} ta VIP Xona
          </span>
        </div>

        <!-- VIP LOUNGE CARDS GRID -->
        <div class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 py-2">
          
          <div 
            v-for="table in vipZoneTables" 
            :key="table.id"
            @click="handleSelectTableForOrder(table)"
            :class="[
              'relative p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between cursor-pointer select-none border group hover:scale-[1.03] active:scale-95 shadow-xl min-h-[160px]',
              !table.isActive 
                ? 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-50 grayscale'
                : getTableState(table) === 'OCCUPIED'
                ? 'bg-gradient-to-br from-rose-900/90 via-slate-900 to-slate-950 border-rose-500 ring-2 ring-rose-500/40 text-white shadow-rose-500/20'
                : 'bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 border-amber-500/50 ring-1 ring-amber-500/30 text-white shadow-amber-500/10'
            ]"
          >
            <!-- VIP Crown Floating Badge -->
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase tracking-widest">
                <Crown class="w-3 h-3 text-amber-400" /> VIP KABINET
              </span>

              <span :class="['text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full', getTableState(table) === 'OCCUPIED' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white']">
                {{ getTableState(table) === 'OCCUPIED' ? 'BAND' : 'BO\'SH' }}
              </span>
            </div>

            <!-- VIP Table Title & Amount -->
            <div class="my-3 space-y-1 text-center">
              <h4 class="text-2xl font-black text-white tracking-wide font-mono">
                {{ table.name }}
              </h4>
              <div v-if="getTableState(table) === 'OCCUPIED' && getTableOrderSum(table) > 0" class="text-sm font-black font-mono text-rose-400">
                💰 {{ getTableOrderSum(table).toLocaleString('uz-UZ') }} so'm
              </div>
              <div v-else class="text-xs font-bold text-amber-400/80">
                ⭐ Lux xizmat ko'rsatishga tayyor
              </div>
            </div>

            <!-- Bottom Action CTA -->
            <div class="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span class="text-[11px] text-slate-400 font-medium">Klik qiling: Xonaga kassa ochish</span>
              <ArrowUpRight class="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>

    </div>

    <!-- ── 4. MODE B: FUTURISTIC MASTER GRID VIEW ── -->
    <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-6 animate-in fade-in duration-300">
      
      <div 
        v-for="table in filteredTables" 
        :key="table.id"
        @click="handleSelectTableForOrder(table)"
        :class="[
          'rounded-3xl border p-5 flex flex-col justify-between relative group transition-all duration-300 shadow-md cursor-pointer select-none overflow-hidden hover:scale-[1.03] hover:-translate-y-1.5 hover:shadow-2xl',
          !table.isActive 
            ? 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60 grayscale' 
            : getTableState(table) === 'OCCUPIED'
            ? 'bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/50 shadow-rose-500/10 ring-2 ring-rose-500/30'
            : 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/40 shadow-emerald-500/10 ring-1 ring-emerald-500/20'
        ]"
      >
        <!-- Top Status Indicator Bar -->
        <div class="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/80 pb-3">
          <div class="flex items-center gap-1.5">
            <template v-if="!table.isActive">
              <span class="w-2 h-2 rounded-full bg-slate-400"></span>
              <span class="text-[10px] font-black uppercase text-slate-400 tracking-wider">NOFAOL</span>
            </template>

            <template v-else-if="getTableState(table) === 'OCCUPIED'">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span class="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">BAND</span>
            </template>

            <template v-else>
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">BO'SH</span>
            </template>
          </div>

          <div class="text-[11px] font-mono font-extrabold text-slate-400">
            #{{ table.number }}
          </div>
        </div>

        <!-- Center Interactive Table Badge & Details -->
        <div class="my-4 flex flex-col items-center justify-center text-center space-y-2">
          <div 
            :class="[
              'w-18 h-18 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 font-black text-2xl font-mono',
              !table.isActive 
                ? 'bg-slate-200 text-slate-500 dark:bg-slate-800' 
                : getTableState(table) === 'OCCUPIED'
                ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/30'
                : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-emerald-500/20'
            ]"
          >
            {{ table.number }}
          </div>

          <div>
            <h3 class="font-black text-base text-slate-900 dark:text-white tracking-wide">
              {{ table.name }}
            </h3>
            <p v-if="getTableState(table) === 'OCCUPIED' && getTableOrderSum(table) > 0" class="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400 mt-0.5">
              💰 {{ getTableOrderSum(table).toLocaleString('uz-UZ') }} so'm
            </p>
            <p v-else-if="table.isActive" class="text-[11px] text-slate-400 mt-0.5 font-medium">
              Joy tayyor
            </p>
          </div>
        </div>

        <!-- Bottom Action CTA -->
        <div class="pt-3 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between gap-1.5" @click.stop>
          <button 
            @click.stop="handleSelectTableForOrder(table)"
            :class="[
              'flex-1 py-2 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95',
              getTableState(table) === 'OCCUPIED'
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
            ]"
          >
            <Utensils class="w-3.5 h-3.5" />
            <span>{{ getTableState(table) === 'OCCUPIED' ? 'Zakazni Ochish' : 'Zakaz Boshlash' }}</span>
          </button>
        </div>
      </div>

    </div>

    <!-- ── TABLE DRAWER / QUICK OPTIONS MODAL FOR ADMIN ── -->
    <div v-if="selectedDetailTable" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-5">
        
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <Armchair class="w-5 h-5 text-amber-500" />
            <h3 class="font-black text-lg text-slate-900 dark:text-white">
              {{ selectedDetailTable.name }} Sozlamalari
            </h3>
          </div>
          <button @click="selectedDetailTable = null" class="p-1.5 rounded-xl text-slate-400 hover:text-white">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3">
          <button 
            @click="handleSelectTableForOrder(selectedDetailTable); selectedDetailTable = null;"
            class="w-full py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Utensils class="w-4 h-4" />
            <span>Kassada Ushbu Stolga Zakaz Urish</span>
          </button>

          <button 
            @click="openEditModal(selectedDetailTable); selectedDetailTable = null;"
            class="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Edit2 class="w-4 h-4 text-amber-500" />
            <span>Stol Nomini Tahrirlash</span>
          </button>

          <button 
            @click="toggleActive(selectedDetailTable); selectedDetailTable = null;"
            class="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <ToggleRight class="w-4 h-4 text-emerald-500" />
            <span>{{ selectedDetailTable.isActive ? 'Stolni O\'chirish (Nofaol qilish)' : 'Stolni Yoqish' }}</span>
          </button>

          <button 
            @click="deleteTable(selectedDetailTable.id); selectedDetailTable = null;"
            class="w-full py-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 class="w-4 h-4" />
            <span>Stolni Butunlay O'chirish</span>
          </button>
        </div>

      </div>
    </div>

    <!-- ── EDIT / ADD TABLE MODAL ── -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl space-y-0">
        
        <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
          <div class="flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-amber-500" />
            <h3 class="font-black text-base text-slate-900 dark:text-white">
              {{ isEditing ? 'Stolni Tahrirlash' : 'Yangi Stol Qo\'shish' }}
            </h3>
          </div>
          <button @click="closeModal" class="p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Stol Raqami (Tartib):</label>
            <input 
              v-model="form.number" 
              type="number" 
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-amber-500 text-slate-900 dark:text-white font-black font-mono text-lg" 
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Stol Nomi (masalan: VIP 1, Stol 5):</label>
            <input 
              v-model="form.name" 
              type="text" 
              placeholder="Masalan: Stol #5"
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-amber-500 text-slate-900 dark:text-white font-bold text-sm" 
            />
          </div>
        </div>
        
        <div class="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex gap-3">
          <button @click="closeModal" class="flex-1 px-4 py-3 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition cursor-pointer">
            Bekor qilish
          </button>
          <button @click="handleSaveTable" :disabled="isLoading" class="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer">
            <Save class="w-4 h-4" /> 
            <span>{{ isLoading ? 'Saqlanmoqda...' : 'Saqlash' }}</span>
          </button>
        </div>

      </div>
    </div>

  </div>
</template>
