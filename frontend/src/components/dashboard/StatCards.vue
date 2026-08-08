<script setup lang="ts">
import { formatMoney } from '../../utils/formatters';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Award,
  ArrowUpRight
} from 'lucide-vue-next';

defineProps<{
  totalRevenue: number;
  totalOrdersCount: number;
  averageTicketSize: number;
  estimatedNetProfit: number;
  comparisonData: {
    text: string;
    revVal: number;
    revPos: boolean;
    ordVal: number;
    ordPos: boolean;
  };
}>();
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- 1. Revenue Card -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
      <div class="flex justify-between items-start mb-3">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Umumiy Tushum</span>
        <div class="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
          <DollarSign class="w-5 h-5" />
        </div>
      </div>
      <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono mb-2">
        {{ formatMoney(totalRevenue) }} <span class="text-xs font-sans text-slate-500">so'm</span>
      </div>
      <div :class="['flex items-center text-xs font-bold', comparisonData.revPos ? 'text-emerald-500' : 'text-rose-500']">
        <ArrowUpRight v-if="comparisonData.revPos" class="w-4 h-4 mr-0.5" />
        <TrendingUp v-else class="w-4 h-4 mr-0.5 transform rotate-180" />
        <span>{{ comparisonData.revPos ? '+' : '-' }}{{ comparisonData.revVal }}% {{ comparisonData.text }}</span>
      </div>
    </div>

    <!-- 2. Orders Count Card -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
      <div class="flex justify-between items-start mb-3">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Buyurtmalar Soni</span>
        <div class="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
          <ShoppingBag class="w-5 h-5" />
        </div>
      </div>
      <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono mb-2">
        {{ totalOrdersCount }} <span class="text-xs font-sans text-slate-500">ta buyurtma</span>
      </div>
      <div :class="['flex items-center text-xs font-bold', comparisonData.ordPos ? 'text-emerald-500' : 'text-rose-500']">
        <ArrowUpRight v-if="comparisonData.ordPos" class="w-4 h-4 mr-0.5" />
        <TrendingUp v-else class="w-4 h-4 mr-0.5 transform rotate-180" />
        <span>{{ comparisonData.ordPos ? '+' : '-' }}{{ comparisonData.ordVal }}% {{ comparisonData.text }}</span>
      </div>
    </div>

    <!-- 3. Average Ticket Card -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
      <div class="flex justify-between items-start mb-3">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">O'rtacha Chek</span>
        <div class="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center">
          <TrendingUp class="w-5 h-5" />
        </div>
      </div>
      <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono mb-2">
        {{ formatMoney(averageTicketSize) }} <span class="text-xs font-sans text-slate-500">so'm</span>
      </div>
      <div class="flex items-center text-xs font-bold text-cyan-500">
        <span>Stabil mijoz savati</span>
      </div>
    </div>

    <!-- 4. Estimated Profit Card -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
      <div class="flex justify-between items-start mb-3">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sof Foyda (Est. 46%)</span>
        <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
          <Award class="w-5 h-5" />
        </div>
      </div>
      <div class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono mb-2">
        {{ formatMoney(estimatedNetProfit) }} <span class="text-xs font-sans text-slate-500">so'm</span>
      </div>
      <div class="flex items-center text-xs font-bold text-emerald-500">
        <span>O'rtacha 46% restoran marjasi</span>
      </div>
    </div>
  </div>
</template>
