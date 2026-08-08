<script setup lang="ts">
import { BarChart2, Layers, PieChart as PieIcon, CreditCard, Banknote, Smartphone, Truck } from 'lucide-vue-next';
import { formatMoney } from '../../utils/formatters';

defineProps<{
  selectedPeriod: 'today' | 'yesterday' | 'week' | 'month';
  comparisonData: { text: string };
  comparisonGraph: { previousPct: number; previous: number; currentPct: number; current: number };
  maxChartSales: number;
  chartData: { label: string; sales: number }[];
  categorySalesDistribution: { name: string; total: number; percentage: number }[];
  paymentBreakdown: { label: string; amount: number; percentage: number; color: string; icon: string }[];
}>();

// Resolve Icon Component Dynamically if needed, but since we passed icon as string in original, 
// let's map them internally or just use the passed icons if we passed components.
// For simplicity, we assume paymentBreakdown comes with icon names and we map them.
const getIcon = (name: string) => {
  switch(name) {
    case 'Banknote': return Banknote;
    case 'CreditCard': return CreditCard;
    case 'Smartphone': return Smartphone;
    case 'Truck': return Truck;
    default: return Banknote;
  }
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
    
    <!-- 1. Dynamic Sales Bar Chart (2 columns) -->
    <div class="lg:col-span-2 xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 class="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 class="w-5 h-5 text-amber-500" />
            <span>{{ selectedPeriod === 'week' ? 'Haftalik' : selectedPeriod === 'month' ? 'Oylik' : 'Soatbay' }} Tushum Dinamikasi</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Tanlangan davrga ko'ra barcha tushumlar tarixi
          </p>
        </div>
        
        <!-- Mini Comparison Widget: Current vs Previous -->
        <div class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 w-full sm:w-56 shrink-0">
          <div class="text-[10px] font-bold text-slate-500 uppercase mb-2">Solishtirma ({{ comparisonData.text.split(' ')[0] }})</div>
          
          <div class="space-y-2">
            <!-- Previous Period Bar -->
            <div class="flex items-center gap-2 text-[10px]">
              <span class="w-10 text-slate-400">Oldingi</span>
              <div class="flex-1 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div class="bg-slate-400 h-full rounded-full transition-all duration-700" :style="{ width: `${comparisonGraph.previousPct}%` }"></div>
              </div>
              <span class="w-14 text-right font-mono text-slate-500">{{ (comparisonGraph.previous / 1000000).toFixed(1) }}M</span>
            </div>
            
            <!-- Current Period Bar -->
            <div class="flex items-center gap-2 text-[10px] font-bold">
              <span class="w-10 text-amber-500">Joriy</span>
              <div class="flex-1 bg-amber-500/20 h-1.5 rounded-full overflow-hidden">
                <div class="bg-amber-500 h-full rounded-full transition-all duration-700" :style="{ width: `${comparisonGraph.currentPct}%` }"></div>
              </div>
              <span class="w-14 text-right font-mono text-amber-500">{{ (comparisonGraph.current / 1000000).toFixed(1) }}M</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Custom SVG Bar Chart with Y-axis & Grid -->
      <div class="relative h-56 sm:h-64 mt-6 mb-6">
        <!-- Y-axis Grid Lines -->
        <div class="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
           <div class="border-b border-dashed border-slate-200 dark:border-slate-700/50 w-full relative flex-1">
              <span class="absolute -left-2 -top-2.5 -translate-x-full text-[9px] text-slate-400 font-mono">{{ formatMoney(maxChartSales) }}</span>
           </div>
           <div class="border-b border-dashed border-slate-200 dark:border-slate-700/50 w-full relative flex-1">
              <span class="absolute -left-2 -top-2.5 -translate-x-full text-[9px] text-slate-400 font-mono">{{ formatMoney(maxChartSales * 0.75) }}</span>
           </div>
           <div class="border-b border-dashed border-slate-200 dark:border-slate-700/50 w-full relative flex-1">
              <span class="absolute -left-2 -top-2.5 -translate-x-full text-[9px] text-slate-400 font-mono">{{ formatMoney(maxChartSales * 0.5) }}</span>
           </div>
           <div class="border-b border-dashed border-slate-200 dark:border-slate-700/50 w-full relative flex-1">
              <span class="absolute -left-2 -top-2.5 -translate-x-full text-[9px] text-slate-400 font-mono">{{ formatMoney(maxChartSales * 0.25) }}</span>
           </div>
           <div class="border-b border-slate-300 dark:border-slate-600 w-full relative h-0">
              <span class="absolute -left-2 -top-2.5 -translate-x-full text-[9px] text-slate-400 font-mono">0</span>
           </div>
        </div>

        <div class="absolute inset-0 flex items-end justify-between gap-2 sm:gap-4 pl-14 pr-2 pb-7">
          <div 
            v-for="(item, idx) in chartData" 
            :key="idx" 
            class="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
          >
            <!-- Tooltip -->
            <div class="absolute -top-10 bg-slate-900 dark:bg-slate-800 border border-slate-700 text-white text-[10px] font-mono px-2.5 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-20">
              {{ formatMoney(item.sales) }} so'm
            </div>

            <!-- Bar -->
            <div 
              class="w-full max-w-[42px] bg-gradient-to-t from-amber-500 to-orange-500 rounded-t-lg group-hover:brightness-110 group-hover:from-amber-400 transition-all duration-500 shadow-sm shadow-amber-500/20 relative z-10"
              :style="{ height: `${maxChartSales > 0 ? (item.sales / maxChartSales) * 100 : 0}%`, minHeight: item.sales > 0 ? '4px' : '0px' }"
            ></div>
            <!-- Dynamic Label -->
            <span class="absolute -bottom-6 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono truncate px-1 whitespace-nowrap">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Sales Vertical Widget -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        <h3 class="font-black text-base text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <Layers class="w-5 h-5 text-violet-500" />
          <span>Toifalar Bo'yicha</span>
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-5">Eng xaridorgir kategoriyalar ulushi</p>
        
        <div class="space-y-4">
          <div v-if="categorySalesDistribution.length === 0" class="text-center py-8 text-slate-400 text-xs">
            Sotuvlar mavjud emas
          </div>
          <div v-for="(cat, i) in categorySalesDistribution.slice(0, 5)" :key="cat.name" class="space-y-1.5">
             <div class="flex justify-between items-center text-xs font-bold">
               <span class="text-slate-900 dark:text-white truncate pr-2">{{ cat.name }}</span>
               <span class="font-mono text-slate-600 dark:text-slate-300 shrink-0">{{ (cat.total / 1000).toFixed(0) }}k so'm ({{ cat.percentage }}%)</span>
             </div>
             <div class="w-full bg-slate-100 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden">
               <div class="h-full rounded-full transition-all duration-500" 
                    :class="i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-blue-500' : i === 2 ? 'bg-emerald-500' : i === 3 ? 'bg-violet-500' : 'bg-rose-500'" 
                    :style="{ width: `${cat.percentage}%` }">
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Payment Methods Breakdown (1 column) -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        <h3 class="font-black text-base text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <PieIcon class="w-5 h-5 text-amber-500" />
          <span>To'lov Turlari Ulushi</span>
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-5">Naqd, Plastik Karta va Online ulushi</p>

        <div class="space-y-4">
          <div v-for="pay in paymentBreakdown" :key="pay.label" class="space-y-1.5">
            <div class="flex justify-between items-center text-xs font-bold">
              <div class="flex items-center space-x-2">
                <component :is="getIcon(pay.icon)" class="w-4 h-4 text-amber-500" />
                <span class="text-slate-900 dark:text-white">{{ pay.label }}</span>
              </div>
              <span class="font-mono text-slate-600 dark:text-slate-300">{{ pay.amount.toLocaleString('uz-UZ') }} so'm ({{ pay.percentage }}%)</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-500"
                :style="{ width: `${pay.percentage}%`, backgroundColor: pay.color }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
