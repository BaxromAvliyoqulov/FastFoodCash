<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePosStore } from '../stores/posStore';
import { formatMoney } from '../utils/formatters';
import type { Order, CartItem, Ingredient } from '../types/pos';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Award, 
  AlertTriangle, 
  PieChart as PieIcon, 
  BarChart2, 
  ArrowUpRight,
  Flame,
  Layers,
  CreditCard,
  Banknote,
  Smartphone,
  Truck
} from 'lucide-vue-next';

const posStore = usePosStore();
const selectedPeriod = ref<'today' | 'yesterday' | 'week' | 'month'>('today');

const dashboardStats = ref({
  totalRevenue: 0,
  totalOrders: 0,
  averageOrderValue: 0,
  topItems: [] as any[]
});
const loadingStats = ref(false);

async function fetchDashboardStats() {
  try {
    loadingStats.value = true;
    const res = await fetch(`${API_URL}/stats/dashboard`);
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        dashboardStats.value = data;
      }
    }
  } catch (error) {
    console.warn('Backend API unreachable, using local dashboard calculation:', error);
  } finally {
    loadingStats.value = false;
  }
}

onMounted(() => {
  fetchDashboardStats();
});

// ─── 1. BOSH SAHIFA STATISTIKASI (KARTALAR) ───────────────────────────────

const now = new Date();
const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
const yesterdayStart = todayStart - 86400000;
const weekStart = todayStart - 6 * 86400000;
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

const filteredHistory = computed(() => {
  return posStore.orderHistory.filter(o => {
    const d = new Date(o.createdAt).getTime();
    switch (selectedPeriod.value) {
      case 'today': return d >= todayStart;
      case 'yesterday': return d >= yesterdayStart && d < todayStart;
      case 'week': return d >= weekStart;
      case 'month': return d >= monthStart;
      default: return true;
    }
  });
});

const previousHistory = computed(() => {
  return posStore.orderHistory.filter(o => {
    const d = new Date(o.createdAt).getTime();
    switch (selectedPeriod.value) {
      case 'today': return d >= yesterdayStart && d < todayStart;
      case 'yesterday': return d >= yesterdayStart - 86400000 && d < yesterdayStart;
      case 'week': return d >= weekStart - 7 * 86400000 && d < weekStart;
      case 'month': 
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
        return d >= prevMonthStart && d < monthStart;
      default: return false;
    }
  });
});

const totalRevenue = computed(() => {
  if (dashboardStats.value.totalRevenue > 0) return dashboardStats.value.totalRevenue;
  return filteredHistory.value.reduce((sum, o) => sum + o.totalAmount, 0);
});

const totalOrdersCount = computed(() => {
  if (dashboardStats.value.totalOrders > 0) return dashboardStats.value.totalOrders;
  return filteredHistory.value.length;
});

const averageTicketSize = computed(() => {
  if (totalOrdersCount.value === 0) return 0;
  return Math.round(totalRevenue.value / totalOrdersCount.value);
});

const estimatedNetProfit = computed(() => {
  return Math.round(totalRevenue.value * 0.46); // 46% yashirin marja taxmini
});

// Dynamic Comparison Text & Growth Percentages
const comparisonData = computed(() => {
  const prevRev = previousHistory.value.reduce((sum, o) => sum + o.totalAmount, 0);
  const prevOrd = previousHistory.value.length;
  
  const revDiff = totalRevenue.value - prevRev;
  const ordDiff = totalOrdersCount.value - prevOrd;
  
  const revPct = prevRev > 0 ? (Math.abs(revDiff) / prevRev) * 100 : 0;
  const ordPct = prevOrd > 0 ? (Math.abs(ordDiff) / prevOrd) * 100 : 0;
  
  let text = 'oldingi davrga nisbatan';
  if (selectedPeriod.value === 'today') text = 'kechagiga nisbatan';
  if (selectedPeriod.value === 'yesterday') text = 'oldingi kunga nisbatan';
  if (selectedPeriod.value === 'week') text = 'oldingi haftaga nisbatan';
  if (selectedPeriod.value === 'month') text = 'oldingi oyga nisbatan';
  
  return { 
    text, 
    revVal: Number(revPct.toFixed(1)), 
    revPos: revDiff >= 0, 
    ordVal: Number(ordPct.toFixed(1)), 
    ordPos: ordDiff >= 0 
  };
});

// 2. Category Sales Distribution
const categorySalesDistribution = computed(() => {
  const map: Record<string, { name: string; total: number; count: number }> = {};
  
  posStore.products.forEach(p => {
    if (!map[p.categoryName]) {
      map[p.categoryName] = { name: p.categoryName, total: 0, count: 0 };
    }
  });

  filteredHistory.value.forEach((order: Order) => {
    order.items.forEach((item: CartItem) => {
      if (map[item.product.categoryName]) {
        map[item.product.categoryName].total += item.totalPrice;
        map[item.product.categoryName].count += item.quantity;
      } else {
        map[item.product.categoryName] = { name: item.product.categoryName, total: item.totalPrice, count: item.quantity };
      }
    });
  });

  const list = Object.values(map).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const grandTotal = list.reduce((sum, c) => sum + c.total, 0) || 1;
  return list.map(c => ({ ...c, percentage: Math.round((c.total / grandTotal) * 100) }));
});

// 3. Payment Methods Breakdown
const paymentBreakdown = computed(() => {
  let cash = 0, card = 0, clickPayme = 0, delivery = 0;
  
  filteredHistory.value.forEach((o: Order) => {
    if (o.paymentType === 'CASH') cash += o.totalAmount;
    else if (o.paymentType === 'CARD') card += o.totalAmount;
    else if (o.paymentType === 'CLICK_PAYME') clickPayme += o.totalAmount;
    else if (o.paymentType === 'DELIVERY_PARTNER') delivery += o.totalAmount;
  });

  const total = (cash + card + clickPayme + delivery) || 1;
  return [
    { label: 'Naqd Pul', amount: cash, percentage: Math.round((cash / total) * 100), color: '#f59e0b', icon: Banknote },
    { label: 'Plastik Karta (Humo/Uzcard)', amount: card, percentage: Math.round((card / total) * 100), color: '#3b82f6', icon: CreditCard },
    { label: 'Click & Payme Online', amount: clickPayme, percentage: Math.round((clickPayme / total) * 100), color: '#06b6d4', icon: Smartphone },
    { label: 'Dostavka Hamkorlar', amount: delivery, percentage: Math.round((delivery / total) * 100), color: '#10b981', icon: Truck },
  ];
});

// 4. Dynamic Chart Data
const chartData = computed(() => {
  const map: Record<string, number> = {};
  
  if (selectedPeriod.value === 'week') {
    const days = ['Yak', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
    [1, 2, 3, 4, 5, 6, 0].forEach(d => map[days[d]] = 0);
    filteredHistory.value.forEach(o => {
      const day = days[new Date(o.createdAt).getDay()];
      map[day] += o.totalAmount;
    });
    return [1, 2, 3, 4, 5, 6, 0].map(d => ({ label: days[d], sales: map[days[d]] }));
  } else if (selectedPeriod.value === 'month') {
    [1, 2, 3, 4].forEach(w => map[`${w}-hafta`] = 0);
    filteredHistory.value.forEach(o => {
      const date = new Date(o.createdAt).getDate();
      const week = Math.ceil(date / 7) > 4 ? 4 : Math.ceil(date / 7);
      map[`${week}-hafta`] += o.totalAmount;
    });
    return [1, 2, 3, 4].map(w => ({ label: `${w}-hafta`, sales: map[`${w}-hafta`] }));
  } else {
    for (let i = 9; i <= 23; i += 2) map[`${i.toString().padStart(2, '0')}:00`] = 0;
    filteredHistory.value.forEach(o => {
      let hour = new Date(o.createdAt).getHours();
      hour = hour % 2 !== 0 ? hour : hour - 1; 
      if (hour < 9) hour = 9;
      if (hour > 23) hour = 23;
      const key = `${hour.toString().padStart(2, '0')}:00`;
      if (map[key] !== undefined) map[key] += o.totalAmount;
    });
    return Object.keys(map).map(k => ({ label: k, sales: map[k] }));
  }
});

const maxChartSales = computed(() => Math.max(...chartData.value.map(h => h.sales)) || 1);

// Mini Comparison Graph Data
const comparisonGraph = computed(() => {
  const current = totalRevenue.value;
  const previous = previousHistory.value.reduce((sum, o) => sum + o.totalAmount, 0);
  const max = Math.max(current, previous) || 1;
  return {
    current,
    previous,
    currentPct: current === 0 && previous === 0 ? 0 : Math.round((current / max) * 100),
    previousPct: current === 0 && previous === 0 ? 0 : Math.round((previous / max) * 100)
  };
});

// 5. Top 10 Bestsellers (REAL DATA ONLY)
const topBestsellers = computed(() => {
  if (dashboardStats.value.topItems.length > 0) return dashboardStats.value.topItems;
  
  const map: Record<string, { name: string; category: string; price: number; soldCount: number; totalRevenue: number; imageUrl: string }> = {};
  
  filteredHistory.value.forEach((order: Order) => {
    order.items.forEach((item: CartItem) => {
      if (!map[item.product.id]) {
        map[item.product.id] = {
          name: item.product.name,
          category: item.product.categoryName,
          price: item.product.price,
          soldCount: 0,
          totalRevenue: 0,
          imageUrl: item.product.imageUrl || ''
        };
      }
      map[item.product.id].soldCount += item.quantity;
      map[item.product.id].totalRevenue += item.totalPrice;
    });
  });

  const list = Object.values(map).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10);
  return list.map((item, index) => ({ ...item, rank: index + 1 }));
});

// 6. Low Stock Ingredients Warning Widget
const lowStockIngredients = computed(() => {
  return posStore.ingredients.filter((ing: Ingredient) => ing.currentStock <= (ing.minThreshold || 50));
});
</script>

<template>
  <div class="h-full flex flex-col overflow-y-auto bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 space-y-6 transition-colors duration-300">
    
    <!-- Top Dashboard Bar -->
    <div class="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div>
        <div class="flex items-center space-x-2">
          <div class="p-2 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <BarChart2 class="w-6 h-6" />
          </div>
          <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-wide">
            Boshqaruv Paneli & Bosh Analitika
          </h2>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">DOSTON BURGER tushumi, top taomlar va ombor hisoboti</p>
      </div>

      <!-- Time Filter Pills (Fixed Order: Kecha, Bugun, Hafta, Oy) -->
      <div class="flex items-center bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold space-x-1">
        <button 
          @click="selectedPeriod = 'yesterday'"
          :class="['px-3.5 py-2 rounded-xl transition-all', selectedPeriod === 'yesterday' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white']"
        >
          Kecha
        </button>
        <button 
          @click="selectedPeriod = 'today'"
          :class="['px-3.5 py-2 rounded-xl transition-all', selectedPeriod === 'today' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white']"
        >
          Bugun
        </button>
        <button 
          @click="selectedPeriod = 'week'"
          :class="['px-3.5 py-2 rounded-xl transition-all', selectedPeriod === 'week' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white']"
        >
          Shu Hafta
        </button>
        <button 
          @click="selectedPeriod = 'month'"
          :class="['px-3.5 py-2 rounded-xl transition-all', selectedPeriod === 'month' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white']"
        >
          Shu Oy
        </button>
      </div>
    </div>

    <!-- 4 Main Financial KPI Metric Cards -->
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

    <!-- Middle Charts Section: Dynamic Bar Chart & Comparison Mini-Graph -->
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
                  <component :is="pay.icon" class="w-4 h-4 text-amber-500" />
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

    <!-- Bottom Section: Top 5 Bestselling Foods & Low Stock Warning -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Top 5 Bestselling Foods (2 columns) -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Flame class="w-5 h-5 text-amber-500" />
              <span>Eng Ko'p Sotilgan Top Taomlar (Bestsellers)</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Ega bo'lingan sotuvlar soni va tushum hajmi bo'yicha</p>
          </div>
        </div>

        <div class="space-y-3">
          <div 
            v-for="item in topBestsellers" 
            :key="item.name"
            class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 hover:border-amber-500/40 transition-all"
          >
            <div class="flex items-center space-x-3 min-w-0">
              <!-- Rank Badge -->
              <span 
                :class="[
                  'w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0',
                  item.rank === 1 ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' :
                  item.rank === 2 ? 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white' :
                  item.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                ]"
              >
                #{{ item.rank }}
              </span>

              <!-- Food Image & Name -->
              <img :src="item.imageUrl" :alt="item.name" class="w-11 h-11 rounded-xl object-cover shrink-0 bg-slate-200" />
              <div class="min-w-0">
                <div class="font-bold text-xs text-slate-900 dark:text-white truncate">{{ item.name }}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400">{{ item.category }} • {{ item.price.toLocaleString('uz-UZ') }} so'm</div>
              </div>
            </div>

            <!-- Units & Revenue -->
            <div class="text-right shrink-0 ml-3">
              <div class="font-black text-xs text-amber-600 dark:text-amber-400 font-mono">{{ item.totalRevenue.toLocaleString('uz-UZ') }} so'm</div>
              <div class="text-[10px] text-slate-500 font-medium">{{ item.soldCount }} ta sotildi</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Low Stock Warning Panel (1 column) -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle class="w-5 h-5 text-rose-500" />
              <span>Ombor Qoldig'i (Low Stock Alert)</span>
            </h3>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Kam qolgan va to'ldirilishi kerak bo'lgan masalliqlar</p>

          <div v-if="lowStockIngredients.length" class="space-y-3">
            <div 
              v-for="ing in lowStockIngredients" 
              :key="ing.id"
              class="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs"
            >
              <div class="flex justify-between font-bold text-slate-900 dark:text-white mb-1">
                <span>{{ ing.name }}</span>
                <span class="text-rose-500 font-mono">{{ ing.currentStock }} {{ ing.unit }}</span>
              </div>
              <div class="w-full bg-rose-200 dark:bg-rose-950/60 h-2 rounded-full overflow-hidden">
                <div 
                  class="bg-rose-500 h-full rounded-full transition-all duration-300"
                  :style="{ width: `${Math.min(100, (ing.currentStock / 100) * 100)}%` }"
                ></div>
              </div>
            </div>
          </div>

          <div v-else class="p-6 text-center text-slate-400 text-xs font-medium">
            Barcha masalliqlar omborda yetarli darajada mavjud! ✅
          </div>
        </div>

        <div class="mt-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 text-xs flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span class="flex items-center gap-1.5"><Layers class="w-4 h-4 text-amber-500" /> Avto-spisaniya faol</span>
          <span class="font-bold text-emerald-500">100% Avtomatik</span>
        </div>
      </div>

    </div>

  </div>
</template>
