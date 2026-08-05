<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePosStore } from '../stores/posStore';
import { useToastStore } from '../stores/toastStore';
import { 
  Package, 
  AlertTriangle,
  Layers,
  ArrowDownToLine,
  CheckCircle2,
  TrendingDown
} from 'lucide-vue-next';

const posStore = usePosStore();
const toast = useToastStore();

onMounted(() => {
  posStore.checkLowStockAlerts(toast);
});

// Qidiruv uchun
const searchQuery = ref('');

const filteredIngredients = computed(() => {
  if (!searchQuery.value) return posStore.ingredients;
  return posStore.ingredients.filter(ing => 
    ing.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

function getStockStatus(current: number, min: number | undefined) {
  if (!min) return { label: 'Joyida', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
  if (current <= min) return { label: 'Tugamoqda', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30 shadow-[0_0_10px_rgba(225,29,72,0.3)]' };
  if (current <= min * 1.5) return { label: 'O\'rtacha', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
  return { label: 'Yetarli', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
}
</script>

<template>
  <div class="h-[calc(100vh-65px)] overflow-y-auto bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 space-y-6 sm:space-y-8 transition-colors duration-300">
    
    <!-- Header Title -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">Ombor Zaxiralari (Warehouse)</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">Restorandagi joriy mahsulotlar qoldig'i va holati</p>
      </div>

      <button 
        @click="toast.info('Yangi mahsulot qabul qilish oynasi tez kunda qo\'shiladi!')"
        class="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 flex items-center space-x-2 transition active:scale-95"
      >
        <ArrowDownToLine class="w-4 h-4" />
        <span>Yangi Mahsulot Qabul Qilish (Kirim)</span>
      </button>
    </div>

    <!-- Audit Radar Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm dark:shadow-xl relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition"></div>
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold relative z-10">
          <span>Jami Mahsulot Turlari</span>
          <Layers class="w-4 h-4 text-indigo-500" />
        </div>
        <div class="text-xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono relative z-10">
          {{ posStore.ingredients.length }} xil
        </div>
        <div class="text-[11px] text-slate-500 relative z-10">Tizimda ro'yxatga olingan mahsulotlar</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm dark:shadow-xl relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition"></div>
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold relative z-10">
          <span>Tugayotgan Mahsulotlar</span>
          <AlertTriangle class="w-4 h-4 text-rose-500" />
        </div>
        <div class="text-xl sm:text-3xl font-black text-rose-500 dark:text-rose-400 font-mono relative z-10">
          {{ posStore.lowStockIngredients.length }} ta
        </div>
        <div class="text-[11px] text-slate-500 relative z-10">Zaxirasi minimal darajadan past bo'lganlar</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm dark:shadow-xl relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition"></div>
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold relative z-10">
          <span>Sog'lom Zaxiralar</span>
          <CheckCircle2 class="w-4 h-4 text-emerald-500" />
        </div>
        <div class="text-xl sm:text-3xl font-black text-emerald-500 dark:text-emerald-400 font-mono relative z-10">
          {{ posStore.ingredients.length - posStore.lowStockIngredients.length }} ta
        </div>
        <div class="text-[11px] text-slate-500 relative z-10">Zaxirasi yetarli bo'lgan mahsulotlar</div>
      </div>

    </div>

    <!-- Inventory Table -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 class="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Package class="w-5 h-5 text-indigo-500" />
          <span>Hozirgi Ombor Qoldig'i</span>
        </h3>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Mahsulot qidirish..." 
          class="w-full sm:w-64 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none transition-all dark:text-white placeholder:text-slate-400"
        />
      </div>

      <div class="overflow-x-auto max-w-full pb-10">
        <table class="w-full text-left text-xs border-separate border-spacing-y-3 min-w-[700px]">
          <thead>
            <tr class="text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold text-[10px] px-4">
              <th class="pb-2 px-4 font-semibold">Mahsulot Nomi</th>
              <th class="pb-2 px-4 font-semibold text-center">O'lchov</th>
              <th class="pb-2 px-4 font-semibold text-center">Minimal Chegara</th>
              <th class="pb-2 px-4 font-semibold text-center">Hozirgi Qoldiq</th>
              <th class="pb-2 px-4 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody class="font-mono text-slate-700 dark:text-slate-300">
            <tr v-for="ing in filteredIngredients" :key="ing.id" 
                class="bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-md group rounded-2xl">
              
              <!-- Nomi -->
              <td class="py-4 px-4 font-bold text-slate-900 dark:text-white font-sans text-sm rounded-l-2xl border-y border-l border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700/50">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-200/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-colors">
                    <Package class="w-4 h-4" />
                  </div>
                  <span>{{ ing.name }}</span>
                </div>
              </td>
              
              <!-- Birlik -->
              <td class="py-4 px-4 text-slate-500 dark:text-slate-400 font-semibold text-center border-y border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700/50">
                <span class="bg-slate-200/50 dark:bg-slate-700/50 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest">{{ ing.unit }}</span>
              </td>
              
              <!-- Minimal Chegara -->
              <td class="py-4 px-4 text-center border-y border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700/50">
                <span class="text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                  Min: <span class="text-slate-600 dark:text-slate-300">{{ ing.minThreshold || 0 }}</span>
                </span>
              </td>
              
              <!-- Hozirgi Qoldiq -->
              <td class="py-4 px-4 text-center border-y border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700/50">
                <div class="flex items-center justify-center gap-2">
                  <span class="text-xl font-black" :class="ing.currentStock <= (ing.minThreshold || 0) ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(225,29,72,0.4)]' : 'text-slate-800 dark:text-white'">
                    {{ ing.currentStock.toFixed(0) }}
                  </span>
                  <TrendingDown v-if="ing.currentStock <= (ing.minThreshold || 0)" class="w-4 h-4 text-rose-500 animate-pulse" />
                </div>
              </td>

              <!-- Status -->
              <td class="py-4 px-4 text-center rounded-r-2xl border-y border-r border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700/50">
                <span 
                  class="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border shadow-sm"
                  :class="getStockStatus(ing.currentStock, ing.minThreshold).color"
                >
                  {{ getStockStatus(ing.currentStock, ing.minThreshold).label }}
                </span>
              </td>
            </tr>
            
            <tr v-if="filteredIngredients.length === 0">
              <td colspan="5" class="py-10 text-center text-slate-500 dark:text-slate-400">
                Mahsulot topilmadi
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
