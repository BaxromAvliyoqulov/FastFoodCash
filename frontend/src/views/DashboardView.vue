<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePosStore } from '../stores/posStore';
import type { Order, CartItem, Ingredient } from '../types/pos';
import { BarChart2 } from 'lucide-vue-next';

// Components
import StatCards from '../components/dashboard/StatCards.vue';
import SalesChart from '../components/dashboard/SalesChart.vue';
import TopBestsellers from '../components/dashboard/TopBestsellers.vue';
import LowStockAlert from '../components/dashboard/LowStockAlert.vue';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

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
      const body = await res.json();
      if (body.success) {
        dashboardStats.value = body.data;
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
  if (dashboardStats.value.totalRevenue > 0 && selectedPeriod.value === 'today') return dashboardStats.value.totalRevenue;
  return filteredHistory.value.reduce((sum, o) => sum + o.totalAmount, 0);
});

const totalOrdersCount = computed(() => {
  if (dashboardStats.value.totalOrders > 0 && selectedPeriod.value === 'today') return dashboardStats.value.totalOrders;
  return filteredHistory.value.length;
});

const averageTicketSize = computed(() => {
  if (totalOrdersCount.value === 0) return 0;
  return Math.round(totalRevenue.value / totalOrdersCount.value);
});

const estimatedNetProfit = computed(() => {
  return Math.round(totalRevenue.value * 0.46); // 46% yashirin marja taxmini
});

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
    { label: 'Naqd Pul', amount: cash, percentage: Math.round((cash / total) * 100), color: '#f59e0b', icon: 'Banknote' },
    { label: 'Plastik Karta (Humo/Uzcard)', amount: card, percentage: Math.round((card / total) * 100), color: '#3b82f6', icon: 'CreditCard' },
    { label: 'Click & Payme Online', amount: clickPayme, percentage: Math.round((clickPayme / total) * 100), color: '#06b6d4', icon: 'Smartphone' },
    { label: 'Dostavka Hamkorlar', amount: delivery, percentage: Math.round((delivery / total) * 100), color: '#10b981', icon: 'Truck' },
  ];
});

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

const topBestsellers = computed(() => {
  if (dashboardStats.value.topItems.length > 0 && selectedPeriod.value === 'today') return dashboardStats.value.topItems;
  
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

      <!-- Time Filter Pills -->
      <div class="flex items-center bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold space-x-1">
        <button 
          @click="selectedPeriod = 'yesterday'"
          :class="['px-3.5 py-2 rounded-xl transition-all', selectedPeriod === 'yesterday' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white']"
        >Kecha</button>
        <button 
          @click="selectedPeriod = 'today'"
          :class="['px-3.5 py-2 rounded-xl transition-all', selectedPeriod === 'today' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white']"
        >Bugun</button>
        <button 
          @click="selectedPeriod = 'week'"
          :class="['px-3.5 py-2 rounded-xl transition-all', selectedPeriod === 'week' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white']"
        >Shu Hafta</button>
        <button 
          @click="selectedPeriod = 'month'"
          :class="['px-3.5 py-2 rounded-xl transition-all', selectedPeriod === 'month' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white']"
        >Shu Oy</button>
      </div>
    </div>

    <!-- 4 Main Financial KPI Metric Cards -->
    <StatCards 
      :totalRevenue="totalRevenue"
      :totalOrdersCount="totalOrdersCount"
      :averageTicketSize="averageTicketSize"
      :estimatedNetProfit="estimatedNetProfit"
      :comparisonData="comparisonData"
    />

    <!-- Middle Charts Section -->
    <SalesChart 
      :selectedPeriod="selectedPeriod"
      :comparisonData="comparisonData"
      :comparisonGraph="comparisonGraph"
      :maxChartSales="maxChartSales"
      :chartData="chartData"
      :categorySalesDistribution="categorySalesDistribution"
      :paymentBreakdown="paymentBreakdown"
    />

    <!-- Bottom Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <TopBestsellers :topBestsellers="topBestsellers" />
      <LowStockAlert :lowStockIngredients="lowStockIngredients" />
    </div>

  </div>
</template>
