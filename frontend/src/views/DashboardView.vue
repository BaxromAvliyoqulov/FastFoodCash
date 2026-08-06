<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePosStore } from '../stores/posStore';
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
    const data = await res.json();
    if (data.success) {
      dashboardStats.value = data;
    }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
  } finally {
    loadingStats.value = false;
  }
}

onMounted(() => {
  fetchDashboardStats();
});

// ─── 1. BOSH SAHIFA STATISTIKASI (KARTALAR) ───────────────────────────────

const totalRevenue = computed(() => dashboardStats.value.totalRevenue || 0);
const totalOrdersCount = computed(() => dashboardStats.value.totalOrders || 0);
const averageTicketSize = computed(() => dashboardStats.value.averageOrderValue || 0);

const estimatedNetProfit = computed(() => {
  return Math.round(totalRevenue.value * 0.46); // ~46% average fast food net profit margin
});

// Period Multipliers to make the demo data interactive when switching tabs
const periodMultiplier = computed(() => {
  switch (selectedPeriod.value) {
    case 'today': return 1;
    case 'yesterday': return 0.85; // Kecha sal kamroq bo'lgan
    case 'week': return 6.8; // Haftalik
    case 'month': return 28.5; // Oylik
    default: return 1;
  }
});

// Dynamic Comparison Text & Growth Percentages
const comparisonData = computed(() => {
  switch (selectedPeriod.value) {
    case 'today': return { text: 'kechagiga nisbatan', revVal: 14.8, revPos: true, ordVal: 8.2, ordPos: true };
    case 'yesterday': return { text: 'oldingi kunga nisbatan', revVal: 3.2, revPos: false, ordVal: 1.5, ordPos: false };
    case 'week': return { text: 'oldingi haftaga nisbatan', revVal: 12.4, revPos: true, ordVal: 9.1, ordPos: true };
    case 'month': return { text: 'oldingi oyga nisbatan', revVal: 22.5, revPos: true, ordVal: 15.3, ordPos: true };
    default: return { text: 'oldingi davrga nisbatan', revVal: 0, revPos: true, ordVal: 0, ordPos: true };
  }
});

// 2. Category Sales Distribution
const categorySalesDistribution = computed(() => {
  const map: Record<string, { name: string; total: number; count: number }> = {};
  
  posStore.products.forEach(p => {
    if (!map[p.categoryName]) {
      map[p.categoryName] = { name: p.categoryName, total: 0, count: 0 };
    }
  });

  // Calculate from order history or demo distribution
  posStore.orderHistory.forEach((order: Order) => {
    order.items.forEach((item: CartItem) => {
      if (map[item.product.categoryName]) {
        map[item.product.categoryName].total += item.totalPrice;
        map[item.product.categoryName].count += item.quantity;
      }
    });
  });

  // Fallback demo values if fresh store
  if (Object.values(map).every(v => v.total === 0)) {
    map['Lavash'] = { name: 'Lavash', total: 420000, count: 12 };
    map['Burger'] = { name: 'Burger', total: 380000, count: 10 };
    map['Pizza'] = { name: 'Pizza', total: 320000, count: 4 };
    map['Hot Dog'] = { name: 'Hot Dog', total: 180000, count: 8 };
    map['Shirinliklar'] = { name: 'Shirinliklar', total: 185000, count: 7 };
  }

  const list = Object.values(map).sort((a, b) => b.total - a.total);
  const grandTotal = list.reduce((sum, c) => sum + c.total, 0) || 1;
  return list.map(c => ({ ...c, percentage: Math.round((c.total / grandTotal) * 100) }));
});

// 3. Payment Methods Breakdown (CASH, CARD, CLICK_PAYME, DELIVERY_PARTNER)
const paymentBreakdown = computed(() => {
  let cash = 0, card = 0, clickPayme = 0, delivery = 0;
  
  if (posStore.orderHistory.length > 0) {
    posStore.orderHistory.forEach((o: Order) => {
      if (o.paymentType === 'CASH') cash += o.totalAmount;
      else if (o.paymentType === 'CARD') card += o.totalAmount;
      else if (o.paymentType === 'CLICK_PAYME') clickPayme += o.totalAmount;
      else if (o.paymentType === 'DELIVERY_PARTNER') delivery += o.totalAmount;
    });
  } else {
    cash = 850000;
    card = 350000;
    clickPayme = 185000;
    delivery = 100000;
  }

  const total = (cash + card + clickPayme + delivery) || 1;
  return [
    { label: 'Naqd Pul', amount: cash, percentage: Math.round((cash / total) * 100), color: '#f59e0b', icon: Banknote },
    { label: 'Plastik Karta (Humo/Uzcard)', amount: card, percentage: Math.round((card / total) * 100), color: '#3b82f6', icon: CreditCard },
    { label: 'Click & Payme Online', amount: clickPayme, percentage: Math.round((clickPayme / total) * 100), color: '#06b6d4', icon: Smartphone },
    { label: 'Dostavka Hamkorlar', amount: delivery, percentage: Math.round((delivery / total) * 100), color: '#10b981', icon: Truck },
  ];
});

// 4. Dynamic Chart Data based on selected period
const chartData = computed(() => {
  if (selectedPeriod.value === 'week') {
    return [
      { label: 'Du', sales: 1200000 },
      { label: 'Se', sales: 1450000 },
      { label: 'Ch', sales: 1300000 },
      { label: 'Pa', sales: 1800000 },
      { label: 'Ju', sales: 2400000 },
      { label: 'Sh', sales: 2900000 },
      { label: 'Ya', sales: 2600000 },
    ].map(item => ({ ...item, sales: Math.round(item.sales * (periodMultiplier.value / 6.8)) }));
  } else if (selectedPeriod.value === 'month') {
    return [
      { label: '1-hafta', sales: 9500000 },
      { label: '2-hafta', sales: 11200000 },
      { label: '3-hafta', sales: 10800000 },
      { label: '4-hafta', sales: 12500000 },
    ].map(item => ({ ...item, sales: Math.round(item.sales * (periodMultiplier.value / 28.5)) }));
  } else {
    // Today or Yesterday (Hourly)
    return [
      { label: '09:00', sales: 65000 },
      { label: '11:00', sales: 140000 },
      { label: '13:00', sales: 380000 },
      { label: '15:00', sales: 190000 },
      { label: '17:00', sales: 240000 },
      { label: '19:00', sales: 410000 },
      { label: '21:00', sales: 290000 },
    ].map(item => ({ ...item, sales: Math.round(item.sales * periodMultiplier.value) }));
  }
});

const maxChartSales = computed(() => Math.max(...chartData.value.map(h => h.sales)) || 1);

// Mini Comparison Graph Data (Current vs Previous)
const comparisonGraph = computed(() => {
  const current = totalRevenue.value;
  const growthFactor = comparisonData.value.revPos 
    ? (100 + comparisonData.value.revVal) / 100 
    : (100 - comparisonData.value.revVal) / 100;
  const previous = Math.round(current / (growthFactor || 1));
  const max = Math.max(current, previous);
  return {
    current,
    previous,
    currentPct: Math.round((current / max) * 100),
    previousPct: Math.round((previous / max) * 100)
  };
});

// 5. Top 10 Bestsellers
const topBestsellers = computed(() => {
  if (dashboardStats.value.topItems.length > 0) return dashboardStats.value.topItems;
  return [
    { rank: 1, name: 'Lavash (obichniy)', category: 'Lavash', price: 35000, soldCount: Math.round(38 * periodMultiplier.value), totalRevenue: Math.round(1330000 * periodMultiplier.value), imageUrl: '/images/food/lavash_obichniy.jpg' },
    { rank: 2, name: 'Donar Pizza (XIT SOTUVDA)', category: 'Pizza', price: 85000, soldCount: Math.round(14 * periodMultiplier.value), totalRevenue: Math.round(1190000 * periodMultiplier.value), imageUrl: '/images/pizza/donar_pizza.png' },
    { rank: 3, name: 'Chesse Burger', category: 'Burger', price: 37000, soldCount: Math.round(26 * periodMultiplier.value), totalRevenue: Math.round(962000 * periodMultiplier.value), imageUrl: '/images/burger/cheeseburger.png' },
    { rank: 4, name: 'HOT DOG KAROL', category: 'Hot Dog', price: 25000, soldCount: Math.round(22 * periodMultiplier.value), totalRevenue: Math.round(550000 * periodMultiplier.value), imageUrl: '/images/hotdog/hot_dog_karol.png' },
    { rank: 5, name: 'Classic Fri', category: 'Qovurilganlar', price: 18000, soldCount: Math.round(28 * periodMultiplier.value), totalRevenue: Math.round(504000 * periodMultiplier.value), imageUrl: '/images/food/classic_fri.jpg' },
    { rank: 6, name: 'Coca-Cola 0.5L', category: 'Ichimliklar', price: 8000, soldCount: Math.round(55 * periodMultiplier.value), totalRevenue: Math.round(440000 * periodMultiplier.value), imageUrl: '/images/drinks/coca_cola.jpg' },
    { rank: 7, name: 'Tandir Lavash (Mol go\'shtli)', category: 'Lavash', price: 42000, soldCount: Math.round(10 * periodMultiplier.value), totalRevenue: Math.round(420000 * periodMultiplier.value), imageUrl: '/images/food/lavash_obichniy.jpg' },
    { rank: 8, name: 'KFC Tovuq Qanotlari', category: 'Qovurilganlar', price: 35000, soldCount: Math.round(11 * periodMultiplier.value), totalRevenue: Math.round(385000 * periodMultiplier.value), imageUrl: '/images/food/classic_fri.jpg' },
    { rank: 9, name: 'Assorti Pizza', category: 'Pizza', price: 75000, soldCount: Math.round(5 * periodMultiplier.value), totalRevenue: Math.round(375000 * periodMultiplier.value), imageUrl: '/images/pizza/donar_pizza.png' },
    { rank: 10, name: 'Choy Qora (Choynak)', category: 'Ichimliklar', price: 5000, soldCount: Math.round(45 * periodMultiplier.value), totalRevenue: Math.round(225000 * periodMultiplier.value), imageUrl: '/images/drinks/coca_cola.jpg' },
  ];
});

// 6. Low Stock Ingredients Warning Widget
const lowStockIngredients = computed(() => {
  return posStore.ingredients.filter((ing: Ingredient) => ing.currentStock <= 50);
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
          {{ totalRevenue.toLocaleString('uz-UZ') }} <span class="text-xs font-sans text-slate-500">so'm</span>
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
          {{ averageTicketSize.toLocaleString('uz-UZ') }} <span class="text-xs font-sans text-slate-500">so'm</span>
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
          {{ estimatedNetProfit.toLocaleString('uz-UZ') }} <span class="text-xs font-sans text-slate-500">so'm</span>
        </div>
        <div class="flex items-center text-xs font-bold text-emerald-500">
          <span>O'rtacha 46% restoran marjasi</span>
        </div>
      </div>
    </div>

    <!-- Middle Charts Section: Dynamic Bar Chart & Comparison Mini-Graph -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- 1. Dynamic Sales Bar Chart (2 columns) -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
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

        <!-- Custom SVG Bar Chart -->
        <div class="h-48 sm:h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-slate-200 dark:border-slate-800">
          <div 
            v-for="(item, idx) in chartData" 
            :key="idx" 
            class="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
          >
            <!-- Tooltip -->
            <div class="absolute -top-8 bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-10">
              {{ item.sales.toLocaleString('uz-UZ') }} so'm
            </div>

            <!-- Bar -->
            <div 
              class="w-full max-w-[42px] bg-gradient-to-t from-amber-500 to-orange-500 rounded-t-xl group-hover:brightness-110 transition-all duration-500 shadow-md shadow-amber-500/20"
              :style="{ height: `${(item.sales / maxChartSales) * 100}%` }"
            ></div>
            <!-- Dynamic Label -->
            <span class="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-2 font-mono truncate max-w-full px-1">{{ item.label }}</span>
          </div>
        </div>

        <!-- Category Sales Bar Breakdown Widget -->
        <div class="pt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div v-for="cat in categorySalesDistribution.slice(0, 5)" :key="cat.name" class="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
            <div class="text-[10px] text-slate-500 truncate">{{ cat.name }}</div>
            <div class="font-mono font-bold text-slate-900 dark:text-white">{{ (cat.total / 1000).toFixed(0) }}k so'm</div>
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
