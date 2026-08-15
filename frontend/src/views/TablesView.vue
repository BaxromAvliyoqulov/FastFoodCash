<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePosStore } from '../stores/posStore';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { 
  Plus, Save, X, Edit2, Trash2, 
  ToggleLeft, ToggleRight, LayoutGrid,
  Utensils, Sparkles, Crown
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
const activeFilter = ref<'ALL' | 'FREE' | 'OCCUPIED' | 'INACTIVE'>('ALL');

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

function isVipTable(table: Table): boolean {
  const name = (table.name || '').toLowerCase();
  return name.includes('xona') || name.includes('vip') || table.number >= 16;
}

// Filtered Tables List
const filteredTables = computed(() => {
  return posStore.tables.filter(table => {
    if (activeFilter.value === 'FREE') return table.isActive && getTableState(table) === 'FREE';
    if (activeFilter.value === 'OCCUPIED') return table.isActive && getTableState(table) === 'OCCUPIED';
    if (activeFilter.value === 'INACTIVE') return !table.isActive;
    return true;
  });
});

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
      toast.success("Stol ma'lumotlari yangilandi!");
    } else {
      await fetch(`${API_URL}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.value)
      });
      toast.success("Yangi stol muvaffaqiyatli qo'shildi!");
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

const tableToDelete = ref<Table | null>(null);

function requestDeleteTable(table: Table) {
  tableToDelete.value = table;
}

async function confirmDeleteTable() {
  if (!tableToDelete.value) return;
  const table = tableToDelete.value;
  try {
    await fetch(`${API_URL}/tables/${table.id}`, {
      method: 'DELETE'
    });
    toast.success(`${table.name || table.number + '-Stol'} muvaffaqiyatli o'chirildi!`);
    await posStore.loadTables();
  } catch (error) {
    console.error('Delete table error:', error);
    toast.error("Stolni o'chirishda xatolik yuz berdi");
  } finally {
    tableToDelete.value = null;
  }
}

function handleSelectTableForOrder(table: Table) {
  if (!table.isActive) {
    toast.warning("Bu stol holati o'chirilgan!");
    return;
  }
  posStore.setActiveTable(table.id);
  toast.success(`Stol #${table.number} tanlandi. Kassa bo'limiga o'tilmoqda...`);
  window.dispatchEvent(new CustomEvent('change-tab-event', { detail: 'pos' }));
}
</script>

<template>
  <div class="w-full min-h-full bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 sm:px-8 space-y-6 text-slate-900 dark:text-slate-100 transition-colors duration-300">
    
    <!-- ── Top Header Banner & Live Metrics ── -->
    <div class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
      <div class="absolute -right-10 -top-10 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="flex items-center space-x-4 relative z-10">
        <div class="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 shrink-0">
          <LayoutGrid class="w-7 h-7" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">
              Zal & Stollar Boshqaruvi
            </h2>
            <span class="text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              LIVE STATUS MONITORING
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Stollar holatini real-vaqtda nazorat qilish, band va bo'sh stollarni boshqarish
          </p>
        </div>
      </div>

      <!-- Quick KPI Counters -->
      <div class="flex flex-wrap items-center gap-2.5 relative z-10">
        <div class="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <span class="text-xs font-bold text-slate-400">Jami:</span>
          <span class="text-sm font-black font-mono text-slate-900 dark:text-white">{{ totalTablesCount }} ta</span>
        </div>

        <div class="px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-black">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs">🟢 Bo'sh:</span>
          <span class="text-sm font-mono">{{ freeTablesCount }} ta</span>
        </div>

        <div class="px-4 py-2 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 font-black">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          <span class="text-xs">🔴 Band:</span>
          <span class="text-sm font-mono">{{ occupiedTablesCount }} ta</span>
        </div>

        <button 
          v-if="authStore.isAdmin" 
          @click="openAddModal" 
          class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black px-5 py-2.5 rounded-2xl flex items-center space-x-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all text-xs cursor-pointer ml-auto"
        >
          <Plus class="w-4.5 h-4.5" />
          <span>Yangi Stol Qo'shish</span>
        </button>
      </div>
    </div>

    <!-- ── Filter Tabs Bar ── -->
    <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        <button 
          @click="activeFilter = 'ALL'"
          :class="[
            'px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap',
            activeFilter === 'ALL'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          ]"
        >
          Barchasi ({{ totalTablesCount }})
        </button>

        <button 
          @click="activeFilter = 'FREE'"
          :class="[
            'px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
            activeFilter === 'FREE'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          ]"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>🟢 Bo'sh Stollar ({{ freeTablesCount }})</span>
        </button>

        <button 
          @click="activeFilter = 'OCCUPIED'"
          :class="[
            'px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
            activeFilter === 'OCCUPIED'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          ]"
        >
          <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span>🔴 Band Stollar ({{ occupiedTablesCount }})</span>
        </button>

        <button 
          @click="activeFilter = 'INACTIVE'"
          :class="[
            'px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
            activeFilter === 'INACTIVE'
              ? 'bg-slate-700 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          ]"
        >
          <span>🔒 Nofaol ({{ inactiveTablesCount }})</span>
        </button>
      </div>

      <span class="hidden sm:inline text-xs font-bold text-slate-400">
        💡 Stol ustiga bosing: Kassaga biriktiriladi
      </span>
    </div>

    <!-- ── VIBRANT GREEN & RED STATUS CARDS GRID ── -->
    <div class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
      
      <div 
        v-for="table in filteredTables" 
        :key="table.id"
        @click="handleSelectTableForOrder(table)"
        :class="[
          'rounded-3xl border p-5 flex flex-col justify-between relative group transition-all duration-300 shadow-md cursor-pointer select-none overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl',
          !table.isActive 
            ? 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60 grayscale' 
            : getTableState(table) === 'OCCUPIED'
            ? 'bg-rose-500/10 dark:bg-rose-950/30 border-rose-500/60 ring-2 ring-rose-500/30 shadow-rose-500/15'
            : 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/50 dark:border-emerald-500/30 hover:border-emerald-500 shadow-emerald-500/10'
        ]"
      >
        <!-- ── Top Status Header Bar ── -->
        <div class="flex items-center justify-between border-b pb-3"
          :class="getTableState(table) === 'OCCUPIED' ? 'border-rose-500/20' : 'border-emerald-500/20'">
          
          <!-- Status Pill Badge -->
          <div class="flex items-center gap-1.5">
            <template v-if="!table.isActive">
              <span class="w-2 h-2 rounded-full bg-slate-400"></span>
              <span class="text-[10px] font-black uppercase text-slate-400 tracking-wider">NOFAOL</span>
            </template>

            <template v-else-if="getTableState(table) === 'OCCUPIED'">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span class="text-[11px] font-black uppercase text-rose-600 dark:text-rose-400 tracking-wider flex items-center gap-1">
                🔴 BAND
              </span>
            </template>

            <template v-else>
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                🟢 BO'SH
              </span>
            </template>
          </div>

          <!-- VIP or Table Number Tag -->
          <div class="flex items-center gap-1">
            <span v-if="isVipTable(table)" class="text-[10px] font-black uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-amber-500/30">
              <Crown class="w-3 h-3 text-amber-500" /> VIP
            </span>
            <span class="text-xs font-mono font-black text-slate-400">#{{ table.number }}</span>
          </div>

        </div>

        <!-- ── Center Table Visual & Name ── -->
        <div class="my-5 flex flex-col items-center justify-center text-center space-y-2.5">
          
          <!-- Table Circle Badge -->
          <div 
            :class="[
              'w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 font-black text-2xl font-mono',
              !table.isActive 
                ? 'bg-slate-200 text-slate-500 dark:bg-slate-800' 
                : getTableState(table) === 'OCCUPIED'
                ? 'bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 text-white shadow-rose-600/40 ring-4 ring-rose-500/20'
                : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-emerald-500/30 ring-4 ring-emerald-500/20'
            ]"
          >
            {{ table.number }}
          </div>

          <!-- Table Name & Status Message -->
          <div>
            <h3 class="font-black text-base text-slate-900 dark:text-white tracking-wide">
              {{ table.name }}
            </h3>

            <!-- Active Bill Sum for Occupied -->
            <p v-if="getTableState(table) === 'OCCUPIED' && getTableOrderSum(table) > 0" class="text-xs font-mono font-black text-rose-600 dark:text-rose-400 mt-1 bg-rose-500/10 px-3 py-1 rounded-xl border border-rose-500/20">
              💰 {{ getTableOrderSum(table).toLocaleString('uz-UZ') }} so'm
            </p>

            <p v-else-if="getTableState(table) === 'OCCUPIED'" class="text-xs font-bold text-rose-600 dark:text-rose-400 mt-1">
              Zakaz jarayonda...
            </p>

            <p v-else-if="table.isActive" class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              🟢 Joy tayyor (Bo'sh)
            </p>

            <p v-else class="text-xs text-slate-400 mt-1">
              Xizmat ko'rsatilmaydi
            </p>
          </div>

        </div>

        <!-- ── Bottom Actions Footer ── -->
        <div class="pt-3 border-t flex items-center justify-between gap-1.5" 
          :class="getTableState(table) === 'OCCUPIED' ? 'border-rose-500/20' : 'border-emerald-500/20'"
          @click.stop>
          
          <template v-if="authStore.isAdmin">
            <button 
              @click.stop="openEditModal(table)" 
              class="flex-1 bg-white/80 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-sm border border-slate-200 dark:border-slate-700"
            >
              <Edit2 class="w-3.5 h-3.5 text-amber-500" /> 
              <span>Tahrir</span>
            </button>
            
            <button 
              @click.stop="toggleActive(table)" 
              class="p-2 rounded-xl transition cursor-pointer border shadow-sm"
              :class="table.isActive ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/30' : 'text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'"
              :title="table.isActive ? 'Nofaol qilish' : 'Yoqish'"
            >
              <ToggleRight v-if="table.isActive" class="w-4 h-4 text-emerald-500" />
              <ToggleLeft v-else class="w-4 h-4 text-slate-400" />
            </button>
            
            <button 
              @click.stop="requestDeleteTable(table)" 
              class="p-2 text-rose-500 bg-rose-50 dark:bg-rose-500/10 rounded-xl hover:bg-rose-500 hover:text-white transition cursor-pointer border border-rose-500/20 shadow-sm"
              title="O'chirish"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </template>

          <template v-else>
            <button 
              @click.stop="handleSelectTableForOrder(table)"
              :class="[
                'w-full py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 text-white',
                getTableState(table) === 'OCCUPIED' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
              ]"
            >
              <Utensils class="w-4 h-4" />
              <span>{{ getTableState(table) === 'OCCUPIED' ? 'Zakazni Ochish' : 'Zakaz Boshlash' }}</span>
            </button>
          </template>

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

    <!-- ── DELETE CONFIRMATION MODAL ── -->
    <Teleport to="body">
      <div 
        v-if="tableToDelete" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
          <div class="flex items-center space-x-3 text-rose-500">
            <div class="w-11 h-11 rounded-2xl bg-rose-500/15 flex items-center justify-center shrink-0">
              <Trash2 class="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 class="font-black text-base text-slate-900 dark:text-white">Stolni o'chirish</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Haqiqatan ham bu stolni o'chirmoqchimisiz?</p>
            </div>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <strong>{{ tableToDelete.name || tableToDelete.number + '-Stol' }}</strong> butunlay o'chiriladi.
          </p>
          <div class="flex items-center justify-end space-x-2 pt-2">
            <button 
              @click="tableToDelete = null"
              class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Bekor qilish
            </button>
            <button 
              @click="confirmDeleteTable"
              class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/25 transition"
            >
              Ha, o'chirish
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
