<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { usePosStore } from '../stores/posStore';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import ReceiptModal from '../components/ReceiptModal.vue';
import type { Order } from '../types/pos';
import { formatMoney, formatTime, formatDateTime } from '../utils/formatters';
import { exportToExcel } from '../utils/excelExport';
import { 
  ClipboardList, 
  Search,
  CalendarDays,
  Banknote,
  QrCode,
  CreditCard,
  Utensils,
  Printer,
  Eye,
  Trash2,
  X,
  User,
  Filter,
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-vue-next';

const posStore = usePosStore();
const authStore = useAuthStore();
const toast = useToastStore();

const isRefreshing = ref(false);
async function handleRefreshHistory() {
  isRefreshing.value = true;
  await posStore.fetchOrders();
  toast.success('Savdo tarixi muvaffaqiyatli yangilandi! 📊', 2000);
  isRefreshing.value = false;
}

onMounted(() => {
  posStore.fetchOrders();
});

const searchQuery = ref('');
const selectedDateFilter = ref<'ALL' | 'TODAY' | 'YESTERDAY' | 'MONTH'>('ALL');
const selectedPaymentFilter = ref<'ALL' | 'CASH' | 'CARD' | 'CLICK_PAYME'>('ALL');
const selectedCashierFilter = ref<string>('ALL');

// ─── Kassalar ro'yxati (orderHistory dan dinamik) ────────────────────────────
const cashierList = computed(() => {
  if (!Array.isArray(posStore.orderHistory)) return [];
  const names = new Set(posStore.orderHistory.map(o => o?.cashierName).filter(Boolean));
  return Array.from(names);
});

// ─── Kassalar kesimida hisobot (Faqat bekor qilinmagan haqiqiy savdolar) ─────
const cashierStats = computed(() => {
  const all = Array.isArray(posStore.orderHistory) ? posStore.orderHistory : [];
  return cashierList.value.map(name => {
    // Bekor qilingan buyurtmalar (CANCELLED) hisobotga qo'shilmaydi!
    const orders = all.filter(o => o?.cashierName === name && o?.status !== 'CANCELLED');
    const totalRevenue = orders.reduce((s, o) => s + (o?.totalAmount || 0), 0);
    const cashRevenue = orders.filter(o => o?.paymentType === 'CASH').reduce((s, o) => s + (o?.totalAmount || 0), 0);
    const cardRevenue = orders.filter(o => o?.paymentType === 'CARD').reduce((s, o) => s + (o?.totalAmount || 0), 0);
    const qrRevenue = orders.filter(o => o?.paymentType === 'CLICK_PAYME').reduce((s, o) => s + (o?.totalAmount || 0), 0);
    const avgTicket = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
    const topProduct = (() => {
      const freq: Record<string, number> = {};
      orders.forEach(o => o?.items?.forEach(i => { 
        let pName = i?.product?.name;
        if (!pName || pName.startsWith('prod-')) {
          const foundProd = posStore.products.find(p => p.id === (i?.product?.id || (i as any)?.productId));
          pName = foundProd?.name || 'Lavash';
        }
        freq[pName] = (freq[pName] || 0) + (i.quantity || 1); 
      }));
      const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
      return top ? top[0] : '—';
    })();
    return { name, orderCount: orders.length, totalRevenue, cashRevenue, cardRevenue, qrRevenue, avgTicket, topProduct };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);
});

const maxCashierRevenue = computed(() => Math.max(...cashierStats.value.map(c => c.totalRevenue), 1));

// Modal states
const selectedOrderForModal = ref<Order | null>(null);
const isDetailModalOpen = ref(false);

const orderForPrint = ref<Order | null>(null);
const isReceiptModalOpen = ref(false);

const filteredOrders = computed(() => {
  if (!Array.isArray(posStore.orderHistory)) return [];
  let result = posStore.orderHistory.filter(o => o && o.id);
  
  // Agar oddiy kassir bo'lsa — faqat o'z savdolarini ko'radi (Xar biriga o'zini ko'rinadi)
  if (!authStore.isAdmin) {
    const myName = (authStore.user?.fullName || '').toLowerCase().trim();
    const myId = authStore.user?.id;
    result = result.filter(o => {
      const cName = (o.cashierName || '').toLowerCase().trim();
      if (myId && (o as any).cashierId === myId) return true;
      if (myName && (cName.includes(myName) || myName.includes(cName))) return true;
      return false;
    });
  } else {
    // Admin uchun alohida kassir filtri
    if (selectedCashierFilter.value !== 'ALL') {
      result = result.filter(o => o.cashierName === selectedCashierFilter.value);
    }
  }

  // Date filtering
  const now = new Date();
  const todayStr = now.toDateString();
  
  if (selectedDateFilter.value === 'TODAY') {
    result = result.filter(o => {
      try { return new Date(o.createdAt).toDateString() === todayStr; } catch { return false; }
    });
  } else if (selectedDateFilter.value === 'YESTERDAY') {
    const yest = new Date();
    yest.setDate(now.getDate() - 1);
    const yestStr = yest.toDateString();
    result = result.filter(o => {
      try { return new Date(o.createdAt).toDateString() === yestStr; } catch { return false; }
    });
  } else if (selectedDateFilter.value === 'MONTH') {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    result = result.filter(o => {
      try {
        const d = new Date(o.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      } catch { return false; }
    });
  }

  // Payment type filtering
  if (selectedPaymentFilter.value !== 'ALL') {
    result = result.filter(o => o.paymentType === selectedPaymentFilter.value);
  }

  // Search query
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(o => 
      (o.id || '').toLowerCase().includes(q) || 
      (o.orderNumber || 0).toString().includes(q) ||
      (o.cashierName || '').toLowerCase().includes(q)
    );
  }
  
  return [...result].reverse();
});

const totalSalesAmount = computed(() => 
  filteredOrders.value
    .filter(o => o?.status !== 'CANCELLED')
    .reduce((sum, o) => sum + (o?.totalAmount || 0), 0)
);

const totalOrders = computed(() => 
  filteredOrders.value.filter(o => o?.status !== 'CANCELLED').length
);

function getPaymentIcon(type: string) {
  switch(type) {
    case 'CASH': return Banknote;
    case 'CLICK_PAYME': return QrCode;
    case 'CARD': return CreditCard;
    default: return Banknote;
  }
}

function getPaymentColor(type: string) {
  switch(type) {
    case 'CASH': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    case 'CLICK_PAYME': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    case 'CARD': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    default: return 'text-slate-500 bg-slate-500/10 border-slate-500/30';
  }
}

function openOrderDetails(order: Order) {
  selectedOrderForModal.value = order;
  isDetailModalOpen.value = true;
}

function closeOrderDetails() {
  isDetailModalOpen.value = false;
  selectedOrderForModal.value = null;
}

function triggerReprintReceipt(order: Order) {
  orderForPrint.value = order;
  isReceiptModalOpen.value = true;
  toast.success(`Buyurtma #${order.orderNumber} cheki chop etishga yuborildi!`);
}

// Cancel order state
const cancellingOrder = ref<Order | null>(null);
const cancelReason = ref('Mijoz rad etdi');
const customReason = ref('');
const isCancellingLoading = ref(false);

const cancelPresets = [
  'Mijoz rad etdi',
  'Adashib kiritildi',
  'Kassa xatosi',
  'Taom tugab qolgan',
  'Boshqa sabab'
];

function promptCancelOrder(order: Order) {
  if (!authStore.isAdmin) {
    toast.error('Faqat Menejer yoki Admin buyurtmani bekor qila oladi!');
    return;
  }
  cancellingOrder.value = order;
  cancelReason.value = 'Mijoz rad etdi';
  customReason.value = '';
}

async function confirmCancelOrder() {
  if (!cancellingOrder.value) return;
  const order = cancellingOrder.value;
  const finalReason = cancelReason.value === 'Boshqa sabab' 
    ? (customReason.value.trim() || 'Menejer bekori') 
    : cancelReason.value;

  isCancellingLoading.value = true;
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${API_URL}/orders/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        managerId: authStore.user?.id || 'admin',
        reason: finalReason
      })
    });
    const body = await res.json();
    if (res.ok && body.success) {
      const idx = posStore.orderHistory.findIndex(o => o.id === order.id);
      if (idx > -1) {
        posStore.orderHistory[idx].status = 'CANCELLED';
      }
      toast.success(`Buyurtma #${order.orderNumber} bekor qilindi!`);
      closeOrderDetails();
      cancellingOrder.value = null;
    } else {
      toast.error(body.error || 'Buyurtmani bekor qilishda xatolik');
    }
  } catch (error: any) {
    console.error(error);
    const idx = posStore.orderHistory.findIndex(o => o.id === order.id);
    if (idx > -1) {
      posStore.orderHistory[idx].status = 'CANCELLED';
    }
    toast.success(`Buyurtma #${order.orderNumber} bekor qilindi (Lokal)!`);
    closeOrderDetails();
    cancellingOrder.value = null;
  } finally {
    isCancellingLoading.value = false;
  }
}

async function handleClearSalesHistory() {
  if (!confirm("Diqqat! Barcha test/fake savdolar, cheklar va smenalar tarixi 0 ga tushiriladi.\n\nTaomlar, narxlar, retseptlar va stollarga TEGILMAYDI.\n\nDavom ettirilsinmi?")) {
    return;
  }
  await posStore.clearAllSalesHistory();
  toast.success("Barcha test savdolar tarixi tozalandi! Kassa yangi mijozga 100% tayyor.");
}

function handleExportSalesExcel() {
  const rows = filteredOrders.value.map(o => [
    `#${o.orderNumber}`,
    o.id,
    new Date(o.createdAt).toLocaleString('uz-UZ'),
    o.cashierName || 'Admin',
    o.paymentType,
    o.status === 'CANCELLED' ? 'BEKOR QILINGAN' : 'MUVAFFAQIYATLI',
    o.totalAmount,
    o.items?.map(i => `${i.product?.name} (x${i.quantity})`).join('; ') || ''
  ]);
  exportToExcel(
    'Doston_Savdo_Tarixi',
    ['Chek No', 'Buyurtma ID', 'Sana va Vaqt', 'Kassir', 'To\'lov Turi', 'Holat', 'Summa (so\'m)', 'Tarkibi'],
    rows
  );
  toast.success('Savdo tarixi Excel (.csv) formatida yuklab olindi! 📊');
}
</script>

<template>
  <div class="h-full w-full overflow-y-auto bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 space-y-6 sm:space-y-8 transition-colors duration-300">
    
    <!-- Header Title -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">
            {{ authStore.isAdmin ? 'Savdo Tarixi & Cheklar Audit' : 'Mening Savdo Tarixim' }}
          </h2>
          <span 
            v-if="!authStore.isAdmin"
            class="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300"
          >
            👤 {{ authStore.user?.fullName || 'Kassir' }}
          </span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {{ authStore.isAdmin ? 'Barcha kassalar bo\'yicha yopilgan cheklar, detallar va qayta chop etish' : 'Siz chiqargan cheklar ro\'yxati va qayta chop etish' }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="handleRefreshHistory"
          :disabled="isRefreshing"
          class="bg-indigo-500/10 hover:bg-indigo-500 text-indigo-600 hover:text-white dark:text-indigo-400 dark:hover:text-white border border-indigo-500/20 font-bold px-3.5 py-2 rounded-2xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
          title="Serverdan eng so'nggi barcha buyurtmalar tarixini yuklab olish"
        >
          <RefreshCw :class="['w-4 h-4', isRefreshing ? 'animate-spin' : '']" />
          <span>{{ isRefreshing ? 'Yangilanmoqda...' : 'Yangilash' }}</span>
        </button>

        <button 
          v-if="posStore.orderHistory.length > 0"
          @click="handleExportSalesExcel"
          class="bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 hover:text-white dark:text-emerald-400 dark:hover:text-white border border-emerald-500/20 font-bold px-3.5 py-2 rounded-2xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
          title="Barcha filtrlangan savdo tarixini Excel formatida yuklab olish"
        >
          <FileSpreadsheet class="w-4 h-4" />
          <span>Excelga Yuklash (.xlsx)</span>
        </button>

        <button 
          v-if="authStore.isAdmin && posStore.orderHistory.length > 0"
          @click="handleClearSalesHistory"
          class="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 font-bold px-3.5 py-2 rounded-2xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
          title="Mijozga topshirishdan oldin barcha test savdolarni tozalash (Tovar va retseptlarga tegilmaydi)"
        >
          <Trash2 class="w-4 h-4" />
          <span>Test savdolarni tozalash</span>
        </button>
      </div>
    </div>

    <!-- Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm dark:shadow-xl relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition"></div>
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold relative z-10">
          <span>{{ authStore.isAdmin ? 'Filtrlangan Buyurtmalar' : 'Mening Cheklarim Soni' }}</span>
          <ClipboardList class="w-4 h-4 text-indigo-500" />
        </div>
        <div class="text-xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono relative z-10">
          {{ totalOrders }} ta
        </div>
        <div class="text-[11px] text-slate-500 relative z-10">Tanlangan filter bo'yicha cheklar soni</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm dark:shadow-xl relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition"></div>
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold relative z-10">
          <span>{{ authStore.isAdmin ? 'Filtrlangan Jami Savdo' : 'Mening Kassam Tushumi' }}</span>
          <Banknote class="w-4 h-4 text-emerald-500" />
        </div>
        <div class="text-xl sm:text-3xl font-black text-emerald-500 dark:text-emerald-400 font-mono relative z-10">
          {{ formatMoney(totalSalesAmount) }} so'm
        </div>
        <div class="text-[11px] text-slate-500 relative z-10">Tanlangan filter bo'yicha tushum summasi</div>
      </div>
    </div>

    <!-- ══════════════════ KASSALAR KESIMIDA HISOBOT (Faqat Admin uchun) ══════════════════ -->
    <div v-if="authStore.isAdmin && cashierStats.length > 0" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl">
      <!-- Section header -->
      <div class="flex items-center justify-between mb-5">
        <div>
          <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span class="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <User class="w-3.5 h-3.5 text-white" />
            </span>
            Kassalar Kesimida Hisobot
          </h3>
          <p class="text-[11px] text-slate-500 mt-0.5">Har bir kassir bo'yicha savdo tahlili</p>
        </div>
        <!-- Cashier filter chips -->
        <div class="flex items-center gap-1.5 flex-wrap justify-end">
          <button @click="selectedCashierFilter = 'ALL'" :class="['px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all', selectedCashierFilter === 'ALL' ? 'bg-violet-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200']">
            Barchasi
          </button>
          <button v-for="name in cashierList" :key="name" @click="selectedCashierFilter = name" :class="['px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all', selectedCashierFilter === name ? 'bg-violet-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200']">
            {{ name }}
          </button>
        </div>
      </div>

      <!-- Cashier cards grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        <div
          v-for="(stat, i) in cashierStats"
          :key="stat.name"
          class="relative overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer hover:border-violet-500/40 hover:-translate-y-0.5 hover:shadow-lg"
          :class="selectedCashierFilter === stat.name
            ? 'border-violet-500/50 bg-violet-500/5 dark:bg-violet-500/8 shadow-md shadow-violet-500/10'
            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'"
          @click="selectedCashierFilter = selectedCashierFilter === stat.name ? 'ALL' : stat.name"
        >
          <!-- Rank badge -->
          <div class="absolute top-3 right-3">
            <span :class="['text-[10px] font-black px-1.5 py-0.5 rounded-lg', i === 0 ? 'bg-amber-500 text-white' : i === 1 ? 'bg-slate-400 text-white' : i === 2 ? 'bg-orange-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500']">
              #{{ i + 1 }}
            </span>
          </div>

          <div class="p-4">
            <!-- Cashier name & avatar -->
            <div class="flex items-center gap-3 mb-4">
              <div :class="['w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-lg', i === 0 ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30' : i === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-500/20' : 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/20']">
                {{ stat.name[0]?.toUpperCase() }}
              </div>
              <div class="min-w-0">
                <p class="font-black text-sm text-slate-900 dark:text-white truncate">{{ stat.name }}</p>
                <p class="text-[10px] text-slate-500">{{ stat.orderCount }} ta buyurtma</p>
              </div>
            </div>

            <!-- Revenue -->
            <div class="mb-3">
              <div class="flex items-end justify-between mb-1.5">
                <span class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Jami Tushum</span>
                <span class="text-xs font-black text-slate-900 dark:text-white font-mono">{{ formatMoney(stat.totalRevenue) }} so'm</span>
              </div>
              <!-- Progress bar relative to top cashier -->
              <div class="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="i === 0 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-violet-500 to-purple-500'"
                  :style="`width: ${Math.round((stat.totalRevenue / maxCashierRevenue) * 100)}%`"
                ></div>
              </div>
            </div>

            <!-- Stats row -->
            <div class="grid grid-cols-3 gap-2 mb-3">
              <div class="bg-amber-500/10 dark:bg-amber-500/8 rounded-xl p-2 text-center">
                <p class="text-[9px] text-amber-600 dark:text-amber-500 font-bold uppercase mb-0.5">Naqd</p>
                <p class="text-xs font-black text-slate-800 dark:text-white font-mono">{{ (stat.cashRevenue / 1000).toFixed(0) }}k</p>
              </div>
              <div class="bg-blue-500/10 dark:bg-blue-500/8 rounded-xl p-2 text-center">
                <p class="text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase mb-0.5">Karta</p>
                <p class="text-xs font-black text-slate-800 dark:text-white font-mono">{{ (stat.cardRevenue / 1000).toFixed(0) }}k</p>
              </div>
              <div class="bg-emerald-500/10 dark:bg-emerald-500/8 rounded-xl p-2 text-center">
                <p class="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-0.5">QR</p>
                <p class="text-xs font-black text-slate-800 dark:text-white font-mono">{{ (stat.qrRevenue / 1000).toFixed(0) }}k</p>
              </div>
            </div>

            <!-- Avg ticket & top product -->
            <div class="flex items-center justify-between text-[11px] border-t border-slate-200 dark:border-slate-700 pt-2.5 mt-2.5">
              <div>
                <span class="text-slate-500">O'rtacha chek: </span>
                <span class="font-black text-slate-700 dark:text-slate-300 font-mono">{{ formatMoney(stat.avgTicket) }}</span>
              </div>
              <div class="text-right max-w-[120px]">
                <span class="text-slate-500">Top taom: </span>
                <span class="font-bold text-violet-600 dark:text-violet-400 truncate block">{{ stat.topProduct }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="cashierStats.length === 0" class="text-center py-12 text-slate-500">
        <User class="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p class="text-sm font-bold">Hali buyurtmalar yo'q</p>
      </div>
    </div>


    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm dark:shadow-xl">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        <!-- Date Filters -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Filter class="w-3.5 h-3.5" /> Sana:
          </span>
          <button 
            @click="selectedDateFilter = 'ALL'"
            :class="['px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0', selectedDateFilter === 'ALL' ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200']"
          >
            Barchasi
          </button>
          <button 
            @click="selectedDateFilter = 'TODAY'"
            :class="['px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0', selectedDateFilter === 'TODAY' ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200']"
          >
            Bugun
          </button>
          <button 
            @click="selectedDateFilter = 'YESTERDAY'"
            :class="['px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0', selectedDateFilter === 'YESTERDAY' ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200']"
          >
            Kecha
          </button>
          <button 
            @click="selectedDateFilter = 'MONTH'"
            :class="['px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0', selectedDateFilter === 'MONTH' ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200']"
          >
            Shu Oy
          </button>
        </div>

        <!-- Payment Type Filters & Search -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button 
              @click="selectedPaymentFilter = 'ALL'"
              :class="['px-2.5 py-1 rounded-xl text-xs font-bold font-sans transition-all', selectedPaymentFilter === 'ALL' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500']"
            >
              Hamma To'lov
            </button>
            <button 
              @click="selectedPaymentFilter = 'CASH'"
              :class="['px-2.5 py-1 rounded-xl text-xs font-bold font-sans transition-all', selectedPaymentFilter === 'CASH' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500']"
            >
              Naqd
            </button>
            <button 
              @click="selectedPaymentFilter = 'CARD'"
              :class="['px-2.5 py-1 rounded-xl text-xs font-bold font-sans transition-all', selectedPaymentFilter === 'CARD' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500']"
            >
              Karta
            </button>
            <button 
              @click="selectedPaymentFilter = 'CLICK_PAYME'"
              :class="['px-2.5 py-1 rounded-xl text-xs font-bold font-sans transition-all', selectedPaymentFilter === 'CLICK_PAYME' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500']"
            >
              Click
            </button>
          </div>

          <div class="relative w-full sm:w-64">
            <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Buyurtma yoki kassir qidirish..." 
              class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none transition-all dark:text-white placeholder:text-slate-400"
            />
          </div>
        </div>

      </div>
    </div>

    <!-- History Table -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarDays class="w-5 h-5 text-indigo-500" />
          <span>Barcha Buyurtmalar Ro'yxati (Batafsil ko'rish uchun tanlang)</span>
        </h3>
      </div>

      <div class="overflow-x-auto max-w-full pb-10">
        <table class="w-full text-left text-xs border-separate border-spacing-y-3 min-w-[850px]">
          <thead>
            <tr class="text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold text-[10px] px-4">
              <th class="pb-2 px-4 font-semibold">Buyurtma No / Vaqt</th>
              <th class="pb-2 px-4 font-semibold">Kassir</th>
              <th class="pb-2 px-4 font-semibold">Tarkibi</th>
              <th class="pb-2 px-4 font-semibold text-center">To'lov Turi</th>
              <th class="pb-2 px-4 font-semibold text-right">Summa</th>
              <th class="pb-2 px-4 font-semibold text-center">Amallar</th>
            </tr>
          </thead>
          <tbody class="font-mono text-slate-700 dark:text-slate-300">
            <tr 
              v-for="order in filteredOrders" 
              :key="order.id" 
              @click="openOrderDetails(order)"
              class="bg-slate-50 dark:bg-slate-800/40 hover:bg-amber-500/5 dark:hover:bg-amber-500/10 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md group rounded-2xl border border-transparent hover:border-amber-500/30"
            >
              
              <!-- Buyurtma Info -->
              <td class="py-4 px-4 font-bold text-slate-900 dark:text-white font-sans text-sm rounded-l-2xl">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                    <span class="text-xs font-black">#{{ order.orderNumber }}</span>
                  </div>
                  <div>
                    <div class="text-[10px] text-slate-500 dark:text-slate-400 font-normal mb-0.5">ID: {{ order.id.split('-')[0] }}...</div>
                    <div class="text-xs font-semibold text-amber-600 dark:text-amber-400">{{ formatTime(order.createdAt) }}</div>
                  </div>
                </div>
              </td>
              
              <!-- Kassir -->
              <td class="py-4 px-4 text-slate-500 dark:text-slate-400 font-semibold font-sans">
                <div class="flex items-center gap-1.5">
                  <User class="w-3.5 h-3.5 text-slate-400" />
                  <span>{{ order.cashierName }}</span>
                </div>
              </td>
              
              <!-- Tarkibi -->
              <td class="py-4 px-4">
                <div class="flex items-center gap-1.5 flex-wrap max-w-xs">
                  <span v-for="item in order.items" :key="item.id" class="bg-slate-200/50 dark:bg-slate-700/50 px-2 py-1 rounded-md text-[10px] font-sans text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Utensils class="w-2.5 h-2.5" />
                    {{ item.product.name }} (x{{ item.quantity }})
                  </span>
                </div>
              </td>
              
              <!-- To'lov Turi -->
              <td class="py-4 px-4 text-center">
                <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border shadow-sm" :class="getPaymentColor(order.paymentType)">
                  <component :is="getPaymentIcon(order.paymentType)" class="w-3.5 h-3.5" />
                  <span>{{ order.paymentType === 'CASH' ? 'Naqd Pul' : order.paymentType === 'CLICK_PAYME' ? 'Click' : order.paymentType }}</span>
                </div>
              </td>

              <!-- Summa & Status -->
              <td class="py-4 px-4 text-right">
                <div v-if="order.status === 'CANCELLED'" class="flex flex-col items-end">
                  <span class="inline-flex items-center gap-1 px-2 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase rounded-md border border-rose-500/20 mb-1">Bekor qilingan</span>
                  <span class="line-through text-slate-400 text-sm sm:text-base font-black">{{ formatMoney(order.totalAmount) }}</span>
                </div>
                <div v-else class="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                  {{ formatMoney(order.totalAmount) }} <span class="text-[10px] font-bold text-slate-500">so'm</span>
                </div>
              </td>

              <!-- Action Buttons -->
              <td class="py-4 px-4 text-center rounded-r-2xl" @click.stop>
                <div class="flex items-center justify-center space-x-1.5">
                  <button 
                    @click="openOrderDetails(order)"
                    title="Batafsil Ko'rish"
                    class="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-500 transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                  <button 
                    @click="triggerReprintReceipt(order)"
                    title="Chekni Qayta Chop Etish"
                    class="p-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <Printer class="w-4 h-4" />
                  </button>
                  <button 
                    v-if="authStore.isAdmin && order.status !== 'CANCELLED'"
                    @click="promptCancelOrder(order)"
                    title="Tezkor Bekor Qilish"
                    class="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>

            </tr>
            
            <tr v-if="filteredOrders.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-500 dark:text-slate-400 font-sans space-y-2">
                <ClipboardList class="w-10 h-10 mx-auto text-slate-400 opacity-50" />
                <p class="font-bold">Buyurtmalar topilmadi</p>
                <p class="text-xs">Tanlangan filter yoki qidiruv mos kelmadi</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ORDER DETAILS MODAL -->
    <Teleport to="body">
      <div 
        v-if="isDetailModalOpen && selectedOrderForModal" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transition-colors">
          
          <!-- Modal Header -->
          <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                #{{ selectedOrderForModal.orderNumber }}
              </div>
              <div>
                <h3 class="font-bold text-base text-slate-900 dark:text-white">Buyurtma Detallari</h3>
                <p class="text-xs text-slate-500">ID: {{ selectedOrderForModal.id }}</p>
              </div>
            </div>
            <button @click="closeOrderDetails" class="p-2 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            
            <!-- Meta Grid -->
            <div class="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 text-xs">
              <div>
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Vaqti</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ formatDateTime(selectedOrderForModal.createdAt) }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Kassir</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ selectedOrderForModal.cashierName }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[10px] uppercase font-bold">To'lov Turi</span>
                <span class="font-bold uppercase text-amber-600 dark:text-amber-400">{{ selectedOrderForModal.paymentType }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                <span class="font-bold text-emerald-500">MUVAFFAQIYATLI</span>
              </div>
            </div>

            <!-- Items Table -->
            <div class="space-y-3">
              <h4 class="font-bold text-xs uppercase tracking-wider text-slate-400">Buyurtma Tarkibi</h4>
              <div class="space-y-2">
                <div 
                  v-for="item in selectedOrderForModal.items" 
                  :key="item.id"
                  class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs font-mono"
                >
                  <div class="flex items-center space-x-3">
                    <img :src="item.product.imageUrl" class="w-10 h-10 object-cover rounded-lg shrink-0" />
                    <div>
                      <div class="font-bold font-sans text-slate-900 dark:text-white">{{ item.product.name }}</div>
                      <div class="text-[10px] text-slate-500 font-sans">
                        {{ formatMoney(item.unitPrice) }} so'm × {{ item.quantity }} ta
                      </div>
                      <div v-if="item.selectedModifiers && item.selectedModifiers.length" class="text-[9px] text-amber-500 italic font-sans">
                        + {{ item.selectedModifiers.map(m => m.name).join(', ') }}
                      </div>
                    </div>
                  </div>
                  <div class="font-black text-slate-900 dark:text-white">
                    {{ formatMoney(item.totalPrice) }} so'm
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Totals -->
            <div class="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2 text-xs font-mono">
              <div class="flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                <span>Jami Summa:</span>
                <span class="text-amber-500">{{ formatMoney(selectedOrderForModal.totalAmount) }} so'm</span>
              </div>
              <div class="flex justify-between text-slate-500">
                <span>Berilgan pul:</span>
                <span>{{ formatMoney(selectedOrderForModal.paidAmount ?? selectedOrderForModal.totalAmount) }} so'm</span>
              </div>
              <div class="flex justify-between text-emerald-500 font-bold">
                <span>Qaytim:</span>
                <span>{{ formatMoney(selectedOrderForModal.changeAmount ?? 0) }} so'm</span>
              </div>
            </div>

          </div>

          <!-- Modal Footer Actions -->
          <div class="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex space-x-3">
            <button 
              @click="triggerReprintReceipt(selectedOrderForModal)"
              class="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/25 transition active:scale-95 text-xs"
            >
              <Printer class="w-4 h-4" />
              <span>Chekni Qayta Chop Etish</span>
            </button>
            <button 
              v-if="authStore.isAdmin && selectedOrderForModal.status !== 'CANCELLED'"
              @click="promptCancelOrder(selectedOrderForModal)"
              class="px-4 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-bold py-3 rounded-2xl transition active:scale-95 text-xs flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 class="w-4 h-4" />
              <span>Bekor Qilish</span>
            </button>
          </div>

        </div>
      </div>
    </Teleport>

    <!-- CUSTOM CANCEL ORDER MODAL (Replaces browser prompt) -->
    <Teleport to="body">
      <div 
        v-if="cancellingOrder" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <div 
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
          @click.stop
        >
          <div class="flex items-center space-x-3 text-rose-500">
            <div class="w-12 h-12 rounded-2xl bg-rose-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle class="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h3 class="font-black text-lg text-slate-900 dark:text-white">
                #{{ cancellingOrder.orderNumber }} Buyurtmani Bekor Qilish
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Summa: {{ formatMoney(cancellingOrder.totalAmount) }} so'm
              </p>
            </div>
          </div>

          <div class="space-y-3">
            <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Bekor qilish sababini tanlang:
            </label>

            <!-- Quick reason chips -->
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="preset in cancelPresets"
                :key="preset"
                type="button"
                @click="cancelReason = preset"
                :class="[
                  'py-2 px-3 rounded-xl text-xs font-bold transition text-left cursor-pointer border',
                  cancelReason === preset
                    ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/25'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-400'
                ]"
              >
                {{ preset }}
              </button>
            </div>

            <!-- Custom reason input if "Boshqa sabab" -->
            <div v-if="cancelReason === 'Boshqa sabab'" class="pt-1">
              <input
                v-model="customReason"
                type="text"
                placeholder="Sababni batafsil yozing..."
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              @click="cancellingOrder = null"
              class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs cursor-pointer"
            >
              Ortga
            </button>
            <button
              type="button"
              @click="confirmCancelOrder"
              :disabled="isCancellingLoading"
              class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-black shadow-lg shadow-rose-500/25 hover:from-rose-600 hover:to-red-700 transition text-xs flex items-center space-x-2 cursor-pointer"
            >
              <Trash2 class="w-4 h-4" />
              <span>{{ isCancellingLoading ? 'Bekor qilinmoqda...' : 'Bekor Qilishni Tasdiqlash' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- REPRINT RECEIPT MODAL -->
    <ReceiptModal 
      :isOpen="isReceiptModalOpen" 
      :order="orderForPrint" 
      @close="isReceiptModalOpen = false" 
    />

  </div>
</template>
