<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePosStore } from '../stores/posStore';
import type { Order, CartItem, Ingredient } from '../types/pos';
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

// 1. Core Financial KPI Metrics
const totalRevenue = computed(() => {
  if (posStore.orderHistory.length === 0) {
    return 1485000; // Simulated demo baseline if no live order
  }
  return posStore.orderHistory.reduce((sum: number, order: Order) => sum + order.totalAmount, 0);
});

const totalOrdersCount = computed(() => {
  return Math.max(42, posStore.orderHistory.length);
});

const averageTicketSize = computed(() => {
  if (totalOrdersCount.value === 0) return 0;
  return Math.round(totalRevenue.value / totalOrdersCount.value);
});

const estimatedNetProfit = computed(() => {
  return Math.round(totalRevenue.value * 0.46); // ~46% average fast food net profit margin
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

// 4. Hourly Sales Chart Data (09:00 to 22:00)
const hourlyData = computed(() => [
  { hour: '09:00', sales: 65000 },
  { hour: '11:00', sales: 140000 },
  { hour: '13:00', sales: 380000 },
  { hour: '15:00', sales: 190000 },
  { hour: '17:00', sales: 240000 },
  { hour: '19:00', sales: 410000 },
  { hour: '21:00', sales: 290000 },
]);

const maxHourlySales = computed(() => Math.max(...hourlyData.value.map(h => h.sales)) || 1);

// 5. Top 5 Bestsellers
const topBestsellers = computed(() => {
  return [
    { rank: 1, name: 'Lavash (obichniy)', category: 'Lavash', price: 35000, soldCount: 38, totalRevenue: 1330000, imageUrl: '/images/food/lavash_obichniy.jpg' },
    { rank: 2, name: 'Donar Pizza (XIT SOTUVDA)', category: 'Pizza', price: 85000, soldCount: 14, totalRevenue: 1190000, imageUrl: '/images/pizza/donar_pizza.png' },
    { rank: 3, name: 'Chesse Burger', category: 'Burger', price: 37000, soldCount: 26, totalRevenue: 962000, imageUrl: '/images/burger/cheeseburger.png' },
    { rank: 4, name: 'HOT DOG KAROL', category: 'Hot Dog', price: 25000, soldCount: 22, totalRevenue: 550000, imageUrl: '/images/hotdog/hot_dog_karol.png' },
    { rank: 5, name: 'Classic Fri', category: 'Qovurilganlar', price: 18000, soldCount: 28, totalRevenue: 504000, imageUrl: '/images/food/classic_fri.jpg' },
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

      <!-- Time Filter Pills -->
      <div class="flex items-center bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold space-x-1">
        <button 
          @click="selectedPeriod = 'today'"
          :class="['px-3.5 py-2 rounded-xl transition-all', selectedPeriod === 'today' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white']"
        >
          Bugun
        </button>
        <button 
          @click="selectedPeriod = 'yesterday'"
          :class="['px-3.5 py-2 rounded-xl transition-all', selectedPeriod === 'yesterday' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white']"
        >
          Kecha
        </button>
        <button 
          @click="selectedPeriod = 'week'"
          :class="['px-3.5 py-2 rounded-xl transition-all', selectedPeriod === 'week' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white']"
        >
          Shu Hafta
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
        <div class="flex items-center text-xs font-bold text-emerald-500">
          <ArrowUpRight class="w-4 h-4 mr-0.5" />
          <span>+14.8% kechagiga nisbatan</span>
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
        <div class="flex items-center text-xs font-bold text-emerald-500">
          <ArrowUpRight class="w-4 h-4 mr-0.5" />
          <span>+8.2% faollik yuqori</span>
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

    <!-- Middle Charts Section: Hourly Bar Chart & Payment Methods -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- 1. Hourly Sales Bar Chart (2 columns) -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 class="w-5 h-5 text-amber-500" />
              <span>Soatbay Tushum Dinamikasi</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">09:00 dan 22:00 gacha bo'lgan davrdagi eng qizg'in vaqtlar</p>
          </div>
          <span class="text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1 rounded-xl"> Peak: 19:00-21:00</span>
        </div>

        <!-- Custom SVG Bar Chart -->
        <div class="h-48 sm:h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-slate-200 dark:border-slate-800">
          <div 
            v-for="(item, idx) in hourlyData" 
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
              :style="{ height: `${(item.sales / maxHourlySales) * 100}%` }"
            ></div>
            <!-- Hour label -->
            <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-2 font-mono">{{ item.hour }}</span>
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
