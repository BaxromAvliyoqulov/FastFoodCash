<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePosStore } from '../stores/posStore';
import { useAuthStore } from '../stores/authStore';
import { 
  Grid, Plus, Save, X, Edit2, Trash2, 
  ToggleLeft, ToggleRight, LayoutDashboard
} from 'lucide-vue-next';
import { Table } from '../types/pos';

const posStore = usePosStore();
const authStore = useAuthStore();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

const isLoading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const currentTableId = ref<string | null>(null);

const form = ref({
  name: '',
  number: 1,
  isActive: true
});

onMounted(() => {
  posStore.loadTables();
});

function openAddModal() {
  form.value = { name: `Stol ${posStore.tables.length + 1}`, number: posStore.tables.length + 1, isActive: true };
  isEditing.value = false;
  currentTableId.value = null;
  showModal.value = true;
}

function openEditModal(table: Table) {
  form.value = { name: table.name, number: table.number, isActive: table.isActive };
  isEditing.value = true;
  currentTableId.value = table.id;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

async function saveTable() {
  if (!form.value.name || !form.value.number) return;
  isLoading.value = true;
  
  try {
    const method = isEditing.value ? 'PUT' : 'POST';
    const url = isEditing.value ? `${API_URL}/tables/${currentTableId.value}` : `${API_URL}/tables`;
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Xatolik yuz berdi');
    }
    
    await posStore.loadTables();
    closeModal();
  } catch (error: any) {
    alert(error.message);
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
    await posStore.loadTables();
  } catch (error) {
    console.error(error);
  }
}

async function deleteTable(id: string) {
  if (!confirm('Haqiqatan ham bu stolni o\'chirasizmi? Barcha ma\'lumotlar o\'chib ketadi!')) return;
  try {
    await fetch(`${API_URL}/tables/${id}`, { method: 'DELETE' });
    await posStore.loadTables();
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <div class="h-full flex flex-col overflow-y-auto bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="flex items-center space-x-3.5">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
          <LayoutDashboard class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-wide">Zal va Stollar Boshqaruvi</h2>
          <p class="text-xs text-slate-500 mt-0.5">Yangi stollar qo'shish, nomini o'zgartirish va vaqtincha yopib qo'yish</p>
        </div>
      </div>

      <button @click="openAddModal" class="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">
        <Plus class="w-5 h-5" />
        Yangi Stol Qo'shish
      </button>
    </div>

    <!-- Tables Grid -->
    <div class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
      <div v-for="table in posStore.tables" :key="table.id" 
        class="bg-white dark:bg-slate-900 rounded-2xl border p-4 flex flex-col items-center relative group"
        :class="table.isActive ? 'border-slate-200 dark:border-slate-800' : 'border-rose-200 opacity-70'">
        
        <div class="w-16 h-16 rounded-full flex items-center justify-center mb-3"
          :class="table.isActive ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500' : 'bg-rose-50 text-rose-500'">
          <span class="text-2xl font-black">{{ table.number }}</span>
        </div>
        
        <h3 class="font-bold text-slate-900 dark:text-white text-center">{{ table.name }}</h3>
        
        <div class="mt-4 flex items-center gap-2 w-full">
          <button @click="openEditModal(table)" class="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center">
            <Edit2 class="w-3.5 h-3.5 mr-1" /> Tahrir
          </button>
          
          <button @click="toggleActive(table)" 
            class="p-1.5 rounded-lg transition-colors"
            :class="table.isActive ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'text-rose-500 bg-rose-50 dark:bg-rose-500/10'"
            :title="table.isActive ? 'O\'chirish' : 'Yoqish'">
            <ToggleRight v-if="table.isActive" class="w-4 h-4" />
            <ToggleLeft v-else class="w-4 h-4" />
          </button>
          
          <button @click="deleteTable(table.id)" class="p-1.5 text-rose-500 bg-rose-50 dark:bg-rose-500/10 rounded-lg hover:bg-rose-100 transition-colors">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 class="font-bold text-lg text-slate-900 dark:text-white">{{ isEditing ? 'Stolni Tahrirlash' : 'Yangi Stol Qo\'shish' }}</h3>
          <button @click="closeModal" class="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1.5">Stol Raqami (Tartib)</label>
            <input v-model="form.number" type="number" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-amber-500 text-slate-900 dark:text-white font-bold" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1.5">Stol Nomi (masalan: VIP 1)</label>
            <input v-model="form.name" type="text" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-amber-500 text-slate-900 dark:text-white font-bold" />
          </div>
        </div>
        
        <div class="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex gap-3">
          <button @click="closeModal" class="flex-1 px-4 py-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">Bekor qilish</button>
          <button @click="saveTable" :disabled="isLoading" class="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25">
            <Save class="w-4 h-4" /> {{ isLoading ? 'Saqlanmoqda...' : 'Saqlash' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
