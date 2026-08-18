<script setup lang="ts">
import { ref, computed } from 'vue';
import { useShiftStore } from '../stores/shiftStore';
import { usePosStore } from '../stores/posStore';
import { useToastStore } from '../stores/toastStore';
import { formatMoney } from '../utils/formatters';
import { exportToExcel } from '../utils/excelExport';
import type { ShiftCashAudit } from '../types/pos';
import { 
  Receipt, 
  CheckCircle2, 
  AlertOctagon, 
  DollarSign, 
  ShieldAlert,
  Lock,
  LockOpen,
  Banknote,
  CreditCard,
  Trash2,
  X,
  Eye,
  Printer,
  TrendingUp,
  ArrowDownRight,
  FileSpreadsheet
} from 'lucide-vue-next';

const shiftStore = useShiftStore();
const posStore = usePosStore();
const toast = useToastStore();

const showCloseModal = ref(false);
const declaredCashInput = ref<number | null>(null);
const declaredCardInput = ref<number | null>(null);
const auditNotes = ref('');

const showExpenseModal = ref(false);
const expenseAmount = ref<number | null>(null);
const expenseReason = ref('');

const showOpenShiftModal = ref(false);
const initialFloatCash = ref<number | null>(200000);

const lastAuditResult = ref<ShiftCashAudit | null>(null);
const selectedAuditForModal = ref<ShiftCashAudit | null>(null);

function formatMoneyInput(e: Event): number | null {
  const target = e.target as HTMLInputElement;
  const rawValue = target.value.replace(/\D/g, ''); // Remove non-digits
  if (!rawValue) {
    target.value = '';
    return null;
  }
  // Add spaces as thousands separators
  target.value = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return parseInt(rawValue, 10);
}

function handleAddExpense() {
  if (!expenseAmount.value || !expenseReason.value.trim()) {
    toast.warning('Iltimos, xarajat summasi va sababini kiriting!');
    return;
  }
  shiftStore.addExpense(expenseAmount.value, expenseReason.value);
  toast.success(`${expenseAmount.value.toLocaleString('uz-UZ')} so'm xarajatga yozildi!`);
  expenseAmount.value = null;
  expenseReason.value = '';
  showExpenseModal.value = false;
}

const totalDeclaredSum = computed(() => {
  return (declaredCashInput.value || 0) + (declaredCardInput.value || 0);
});

// ─── Current Shift Financial Breakdown ─────────────────────────────────────────
const currentShiftCashSales = computed(() => {
  return (shiftStore.currentShiftOrders || [])
    .filter(o => o?.paymentType === 'CASH')
    .reduce((sum, o) => sum + (o?.totalAmount || 0), 0);
});

const currentShiftCardSales = computed(() => {
  return (shiftStore.currentShiftOrders || [])
    .filter(o => o?.paymentType === 'CARD')
    .reduce((sum, o) => sum + (o?.totalAmount || 0), 0);
});

const currentShiftTotalRevenue = computed(() => {
  return currentShiftCashSales.value + currentShiftCardSales.value;
});

const currentShiftExpenses = computed(() => {
  const exps = shiftStore.currentShift?.expenses;
  return Array.isArray(exps) ? exps.reduce((sum, e) => sum + (e?.amount || 0), 0) : 0;
});

const currentShiftExpectedCash = computed(() => {
  const initial = Number(shiftStore.currentShift?.initialCash) || 0;
  return Math.max(0, initial + currentShiftCashSales.value - currentShiftExpenses.value);
});

// ─── Cashier 1 (1-Qavat / Stollar) Breakdown ──────────────────────────────────
const cashier1Orders = computed(() => {
  return (shiftStore.currentShiftOrders || []).filter(o => {
    const name = (o?.cashierName || '').toLowerCase();
    return name.includes('1') || (!name.includes('2') && !name.includes('vip'));
  });
});

const cashier1Stats = computed(() => {
  const orders = cashier1Orders.value;
  const cash = orders.filter(o => o?.paymentType === 'CASH').reduce((sum, o) => sum + (o?.totalAmount || 0), 0);
  const card = orders.filter(o => o?.paymentType === 'CARD').reduce((sum, o) => sum + (o?.totalAmount || 0), 0);
  const total = cash + card;
  const count = orders.length;
  const avg = count > 0 ? Math.round(total / count) : 0;
  return { cash, card, total, count, avg };
});

// ─── Cashier 2 (2-Qavat / VIP Xonalar) Breakdown ──────────────────────────────
const cashier2Orders = computed(() => {
  return (shiftStore.currentShiftOrders || []).filter(o => {
    const name = (o?.cashierName || '').toLowerCase();
    return name.includes('2') || name.includes('vip');
  });
});

const cashier2Stats = computed(() => {
  const orders = cashier2Orders.value;
  const cash = orders.filter(o => o?.paymentType === 'CASH').reduce((sum, o) => sum + (o?.totalAmount || 0), 0);
  const card = orders.filter(o => o?.paymentType === 'CARD').reduce((sum, o) => sum + (o?.totalAmount || 0), 0);
  const total = cash + card;
  const count = orders.length;
  const avg = count > 0 ? Math.round(total / count) : 0;
  return { cash, card, total, count, avg };
});

function handleCloseShiftSubmit() {
  if (declaredCashInput.value === null && declaredCardInput.value === null) {
    toast.warning('Sanab kiritilgan summalarni kiriting!');
    return;
  }

  const result = shiftStore.closeShiftBlindReconciliation(
    declaredCashInput.value || 0,
    declaredCardInput.value || 0,
    0,
    auditNotes.value
  );

  lastAuditResult.value = result;
  showCloseModal.value = false;
  toast.success('Smena muvaffaqiyatli yopildi va Z-Report yaratildi! 🧾');
  
  // Clear inputs for next time
  declaredCashInput.value = null;
  declaredCardInput.value = null;
  auditNotes.value = '';
}

function submitOpenShift() {
  if (initialFloatCash.value === null) {
    toast.warning('Boshlang\'ich kassani kiriting!');
    return;
  }
  shiftStore.openShift(initialFloatCash.value);
  lastAuditResult.value = null;
  showOpenShiftModal.value = false;
  toast.success('Yangi smena muvaffaqiyatli ochildi!');
}

async function handleClearSalesHistory() {
  if (!confirm("Diqqat! Barcha test/fake savdolar, cheklar va smenalar tarixi 0 ga tushiriladi.\n\nTaomlar, narxlar, retseptlar va stollarga TEGILMAYDI.\n\nDavom ettirilsinmi?")) {
    return;
  }
  await posStore.clearAllSalesHistory();
  lastAuditResult.value = null;
  toast.success("Barcha test savdolar va smenalar tarixi tozalandi!");
}

function handleExportAuditsExcel() {
  const rows = (shiftStore.shiftAudits || []).map(a => [
    `#${a.id}`,
    a.createdAt,
    a.cashierName || 'Admin',
    a.initialCash || 0,
    a.totalCashSales || a.declaredCash || 0,
    a.totalCardSales || a.declaredCard || 0,
    a.totalExpenses || 0,
    (a.totalCashSales || 0) + (a.totalCardSales || a.declaredCard || 0),
    a.expectedCash || 0,
    a.declaredCash || 0,
    a.difference || 0,
    a.status === 'SHORTAGE' ? 'KAMOMAD' : a.status === 'SURPLUS' ? 'ORTIQCHA' : 'TO\'G\'RI',
    a.cashier1Stats?.total || 0,
    a.cashier2Stats?.total || 0
  ]);
  exportToExcel(
    'Doston_Smena_ZReport_Auditi',
    [
      'Audit ID', 'Smena Vaqti', 'Mas\'ul Kassir', 'Boshlang\'ich Kassa (so\'m)', 
      'Naqd Tushum (so\'m)', 'Karta Tushum (so\'m)', 'Xarajatlar (so\'m)', 'Jami Tushum (so\'m)', 
      'Kutilgan Naqd (so\'m)', 'Sanalgan Naqd (so\'m)', 'Kassa Farqi (so\'m)', 'Holat',
      '1-Qavat Tushumi (so\'m)', '2-Qavat Tushumi (so\'m)'
    ],
    rows
  );
  toast.success('Z-Reportlar tarixi Excel (.csv) formatida yuklab olindi! 📊');
}

function printAuditReceipt(audit: ShiftCashAudit) {
  selectedAuditForModal.value = audit;
  setTimeout(() => {
    window.print();
  }, 300);
}
</script>

<template>
  <div class="w-full min-h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-7 space-y-6 transition-colors duration-300">
    
    <!-- ════════════════════ HEADER BAR ════════════════════ -->
    <div class="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div class="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-indigo-500/5 via-blue-500/5 to-transparent pointer-events-none"></div>
      
      <div class="relative z-10 flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-blue-500/25 shrink-0">
          <ShieldAlert class="w-7 h-7 text-white" />
        </div>
        <div>
          <div class="flex items-center gap-3">
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Smena & Z-Report Moliyaviy Auditi
            </h2>
            <div v-if="shiftStore.isShiftOpen" class="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Smena Ochiq
            </div>
            <div v-else class="flex items-center gap-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
              <span class="w-2 h-2 rounded-full bg-rose-500"></span>
              Smena Yopiq
            </div>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Barcha naqd, terminal tushumlari, xarajatlar va Kassir 1 / Kassir 2 ning aniq hisoboti
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="relative z-10 flex flex-wrap gap-2.5 items-center">
        <button 
          v-if="shiftStore.shiftAudits && shiftStore.shiftAudits.length > 0"
          @click="handleExportAuditsExcel"
          class="bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 hover:text-white dark:text-emerald-400 dark:hover:text-white border border-emerald-500/20 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
          title="Barcha Z-Report va smenalar auditini Excel formatida yuklab olish"
        >
          <FileSpreadsheet class="w-4 h-4" />
          <span>Excelga Yuklash (.xlsx)</span>
        </button>

        <button 
          v-if="shiftStore.shiftAudits.length > 0 || (posStore.orderHistory && posStore.orderHistory.length > 0)"
          @click="handleClearSalesHistory"
          class="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
          title="Barcha test smenalar va cheklarni tozalash"
        >
          <Trash2 class="w-4 h-4" />
          <span class="hidden sm:inline">Test ma'lumotlarni tozalash</span>
          <span class="sm:hidden">Tozalash</span>
        </button>

        <button 
          v-if="shiftStore.isShiftOpen"
          @click="showExpenseModal = true"
          class="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center space-x-2 transition-all active:scale-95 border border-slate-200 dark:border-slate-700 cursor-pointer"
        >
          <DollarSign class="w-4 h-4 text-rose-500" />
          <span>Kassadan Xarajat (Chiqim)</span>
        </button>

        <button 
          v-if="shiftStore.isShiftOpen"
          @click="showCloseModal = true"
          class="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-rose-500/25 flex items-center space-x-2 transition-all active:scale-95 border border-rose-400/50 cursor-pointer"
        >
          <Lock class="w-4 h-4" />
          <span>Smenani Yopish (Z-Report)</span>
        </button>

        <button 
          v-else
          @click="showOpenShiftModal = true"
          class="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center space-x-2 transition-all active:scale-95 border border-emerald-400/50 cursor-pointer"
        >
          <LockOpen class="w-4 h-4" />
          <span>Yangi Smenani Ochish</span>
        </button>
      </div>
    </div>

    <!-- ════════════════════ 6 MAIN FINANCIAL KPI CARDS ════════════════════ -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      
      <!-- 1. Float Cash (Boshlang'ich Kassa) -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm relative overflow-hidden group hover:border-indigo-500/40 transition-all">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
            <DollarSign class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">1. Boshlang'ich</span>
        </div>
        <div class="text-xl font-black text-slate-900 dark:text-white font-mono truncate">
          {{ formatMoney(shiftStore.currentShift?.initialCash || 0) }} <span class="text-xs font-sans text-slate-500">so'm</span>
        </div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Smena ochilish qaytim puli</div>
      </div>

      <!-- 2. Cash Sales (Naqd Tushum) -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
            <Banknote class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">2. Naqd Tushum</span>
        </div>
        <div class="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono truncate">
          +{{ formatMoney(currentShiftCashSales) }} <span class="text-xs font-sans text-slate-500">so'm</span>
        </div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Naqd berilgan buyurtmalar</div>
      </div>

      <!-- 3. Card Sales (Terminal Tushum) -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition-all">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
            <CreditCard class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">3. Terminal Karta</span>
        </div>
        <div class="text-xl font-black text-blue-600 dark:text-blue-400 font-mono truncate">
          {{ formatMoney(currentShiftCardSales) }} <span class="text-xs font-sans text-slate-500">so'm</span>
        </div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Humo / Uzcard tushumi</div>
      </div>

      <!-- 4. Expenses (Xarajatlar / Chiqim) -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm relative overflow-hidden group hover:border-rose-500/40 transition-all">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
            <ArrowDownRight class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">4. Chiqim (Xarajat)</span>
        </div>
        <div class="text-xl font-black text-rose-600 dark:text-rose-400 font-mono truncate">
          -{{ formatMoney(currentShiftExpenses) }} <span class="text-xs font-sans text-slate-500">so'm</span>
        </div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{{ Array.isArray(shiftStore.currentShift?.expenses) ? shiftStore.currentShift?.expenses.length : 0 }} ta xarajat olingan</div>
      </div>

      <!-- 5. Expected Cash in Drawer (Kutilgan Naqd Pul) -->
      <div class="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/40 rounded-3xl p-5 shadow-sm relative overflow-hidden group">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
            <Banknote class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">5. Kutilgan Naqd</span>
        </div>
        <div class="text-xl font-black text-slate-900 dark:text-white font-mono truncate">
          {{ formatMoney(currentShiftExpectedCash) }} <span class="text-xs font-sans text-slate-500">so'm</span>
        </div>
        <div class="text-[10px] text-amber-700 dark:text-amber-300 font-bold mt-1">Boshlang'ich + Naqd - Chiqim</div>
      </div>

      <!-- 6. Total Revenue (Jami Savdo) -->
      <div class="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-2 border-indigo-500/40 rounded-3xl p-5 shadow-sm relative overflow-hidden group">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
            <TrendingUp class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">6. Jami Savdo</span>
        </div>
        <div class="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono truncate">
          {{ formatMoney(currentShiftTotalRevenue) }} <span class="text-xs font-sans text-slate-500">so'm</span>
        </div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{{ shiftStore.currentShiftOrders?.length || 0 }} ta chek urildi</div>
      </div>

    </div>

    <!-- ════════════════════ KASSIR 1 vs KASSIR 2 BREAKDOWN CARDS ════════════════════ -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Kassir 1 (1-Qavat / 15 ta Stol) -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center space-x-3">
            <div class="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-lg border border-amber-500/20">
              🏛️
            </div>
            <div>
              <h3 class="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Kassir 1 (1-Qavat • Stollar 1–15)</span>
                <span class="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-500/20">1-ZAL</span>
              </h3>
              <p class="text-xs text-slate-500">1-qavatdagi barcha stollardan qabul qilingan tushum</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xl font-black text-slate-900 dark:text-white font-mono">{{ formatMoney(cashier1Stats.total) }} so'm</div>
            <div class="text-[10px] text-slate-400 font-bold">{{ cashier1Stats.count }} ta buyurtma</div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Naqd Pul:</span>
            <span class="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">{{ formatMoney(cashier1Stats.cash) }} so'm</span>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Plastik Karta:</span>
            <span class="font-black text-blue-600 dark:text-blue-400 font-mono text-sm">{{ formatMoney(cashier1Stats.card) }} so'm</span>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">O'rtacha Chek:</span>
            <span class="font-black text-slate-900 dark:text-white font-mono text-sm">{{ formatMoney(cashier1Stats.avg) }} so'm</span>
          </div>
        </div>
      </div>

      <!-- Kassir 2 (2-Qavat / 6 ta VIP Xona) -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center space-x-3">
            <div class="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-lg border border-indigo-500/20">
              👑
            </div>
            <div>
              <h3 class="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Kassir 2 (2-Qavat • VIP Xonalar 1–6)</span>
                <span class="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold border border-indigo-500/20">VIP-ZAL</span>
              </h3>
              <p class="text-xs text-slate-500">2-qavatdagi VIP xonalardan qabul qilingan tushum</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xl font-black text-slate-900 dark:text-white font-mono">{{ formatMoney(cashier2Stats.total) }} so'm</div>
            <div class="text-[10px] text-slate-400 font-bold">{{ cashier2Stats.count }} ta buyurtma</div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Naqd Pul:</span>
            <span class="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">{{ formatMoney(cashier2Stats.cash) }} so'm</span>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Plastik Karta:</span>
            <span class="font-black text-blue-600 dark:text-blue-400 font-mono text-sm">{{ formatMoney(cashier2Stats.card) }} so'm</span>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">O'rtacha Chek:</span>
            <span class="font-black text-slate-900 dark:text-white font-mono text-sm">{{ formatMoney(cashier2Stats.avg) }} so'm</span>
          </div>
        </div>
      </div>

    </div>

    <!-- ════════════════════ LAST AUDIT DIFFERENCE BANNER ════════════════════ -->
    <div v-if="lastAuditResult" :class="[
      'p-6 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-lg',
      lastAuditResult.status === 'SHORTAGE' ? 'bg-gradient-to-r from-rose-500/10 to-rose-500/5 border-rose-500/30' :
      lastAuditResult.status === 'SURPLUS' ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-amber-500/30' :
      'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border-emerald-500/30'
    ]">
      <div :class="[
        'w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner',
        lastAuditResult.status === 'SHORTAGE' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' :
        lastAuditResult.status === 'SURPLUS' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
        'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
      ]">
        <AlertOctagon v-if="lastAuditResult.status === 'SHORTAGE'" class="w-8 h-8" />
        <CheckCircle2 v-else class="w-8 h-8" />
      </div>

      <div class="space-y-3 flex-1 min-w-0 w-full">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 class="font-black text-lg sm:text-xl truncate">
            <span v-if="lastAuditResult.status === 'SHORTAGE'" class="text-rose-600 dark:text-rose-400">DIQQAT: KASSADA KAMOMAD (SHORTAGE)</span>
            <span v-else-if="lastAuditResult.status === 'SURPLUS'" class="text-amber-600 dark:text-amber-400">ORTIQCHA PUL BOR (SURPLUS)</span>
            <span v-else class="text-emerald-600 dark:text-emerald-400">TIZIM VA KASSA 100% TENG (BALANCED)</span>
          </h4>
          <div class="flex items-center space-x-2">
            <span class="text-xs font-mono font-bold bg-white/50 dark:bg-black/20 px-3 py-1 rounded-lg shrink-0 border border-slate-200/50 dark:border-slate-800/50">
              Audit vaqti: {{ lastAuditResult.createdAt }}
            </span>
            <button 
              @click="selectedAuditForModal = lastAuditResult"
              class="px-3 py-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg text-xs font-bold shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-500 flex items-center space-x-1 cursor-pointer"
            >
              <Eye class="w-3.5 h-3.5 text-indigo-500" />
              <span>Z-Reportni Ochish</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white/40 dark:bg-black/20 p-4 rounded-2xl border border-slate-200/30 dark:border-slate-800/30">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Kutilgan Naqd:</span>
            <span class="font-black text-slate-900 dark:text-white font-mono text-base">{{ formatMoney(lastAuditResult.expectedCash) }} so'm</span>
          </div>
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Xarajatlar (Minus):</span>
            <span class="font-black text-rose-600 dark:text-rose-400 font-mono text-base">-{{ formatMoney(lastAuditResult.totalExpenses) }} so'm</span>
          </div>
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Kassir kiritgan:</span>
            <span class="font-black text-slate-900 dark:text-white font-mono text-base">{{ formatMoney(lastAuditResult.declaredCash) }} so'm</span>
          </div>
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Kassa Farqi (Diff):</span>
            <span :class="['font-black font-mono text-lg', (lastAuditResult.difference || 0) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400']">
              {{ (lastAuditResult.difference || 0) > 0 ? '+' : '' }}{{ formatMoney(lastAuditResult.difference) }} so'm
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════ AUDIT & Z-REPORT HISTORY TABLE ════════════════════ -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-1 shadow-sm overflow-hidden">
      <div class="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 class="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt class="w-5 h-5 text-indigo-500" />
            <span>Smenalar Auditi va Z-Report Tarixi</span>
          </h3>
          <p class="text-xs text-slate-500 mt-1">Avvalgi yopilgan barcha smenalar bo'yicha to'liq kassa hisoboti va farqlar</p>
        </div>
        <div class="text-xs text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
          Jami: {{ shiftStore.shiftAudits?.length || 0 }} ta Z-Report
        </div>
      </div>

      <div class="overflow-x-auto max-w-full">
        <!-- Empty State -->
        <div v-if="!shiftStore.shiftAudits || shiftStore.shiftAudits.length === 0" class="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div class="w-24 h-24 mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl relative">
            <Receipt class="w-10 h-10 text-slate-400" />
            <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">
              <CheckCircle2 class="w-4 h-4 text-white" />
            </div>
          </div>
          <h4 class="text-lg font-black text-slate-900 dark:text-white mb-2">Hozircha Z-Report mavjud emas</h4>
          <p class="text-sm text-slate-500 max-w-md mx-auto">
            Siz hali birorta ham smenani yopmagansiz. Smenani yopganingizdan so'ng, to'liq kassa hisoboti va Z-Report shu yerda paydo bo'ladi.
          </p>
        </div>

        <!-- Full Rich Audit Table -->
        <table v-else class="w-full text-left text-xs border-collapse min-w-[1000px]">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
              <th class="py-4 px-5 first:rounded-tl-2xl">Audit ID</th>
              <th class="py-4 px-4">Audit Vaqti</th>
              <th class="py-4 px-4">Boshlang'ich</th>
              <th class="py-4 px-4">Naqd Tushum</th>
              <th class="py-4 px-4">Karta Tushum</th>
              <th class="py-4 px-4">Xarajat</th>
              <th class="py-4 px-4">Kutilgan Naqd</th>
              <th class="py-4 px-4">Sanalgan Naqd</th>
              <th class="py-4 px-4">Kassa Farqi</th>
              <th class="py-4 px-4">Holat</th>
              <th class="py-4 px-5 last:rounded-tr-2xl text-right">Z-Report</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            <tr v-for="audit in shiftStore.shiftAudits" :key="audit.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
              <!-- ID -->
              <td class="py-4 px-5 font-bold text-slate-900 dark:text-white font-mono">{{ audit.id }}</td>
              
              <!-- Time -->
              <td class="py-4 px-4 text-slate-500 font-medium whitespace-nowrap">{{ audit.createdAt }}</td>
              
              <!-- Initial -->
              <td class="py-4 px-4 font-mono font-bold">{{ formatMoney(audit.initialCash || 0) }}</td>
              
              <!-- Cash sales -->
              <td class="py-4 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                +{{ formatMoney(audit.totalCashSales || 0) }}
              </td>
              
              <!-- Card sales -->
              <td class="py-4 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                {{ formatMoney(audit.totalCardSales || audit.declaredCard || 0) }}
              </td>
              
              <!-- Expenses -->
              <td class="py-4 px-4 font-mono font-bold text-rose-500">
                -{{ formatMoney(audit.totalExpenses || 0) }}
              </td>

              <!-- Expected cash -->
              <td class="py-4 px-4 font-mono font-bold text-slate-900 dark:text-white">
                {{ formatMoney(audit.expectedCash) }}
              </td>

              <!-- Declared cash -->
              <td class="py-4 px-4 font-mono font-bold text-slate-900 dark:text-white">
                {{ formatMoney(audit.declaredCash) }}
              </td>

              <!-- Difference -->
              <td :class="['py-4 px-4 font-mono font-black', (audit.difference || 0) < 0 ? 'text-rose-500' : (audit.difference || 0) > 0 ? 'text-amber-500' : 'text-emerald-500']">
                {{ (audit.difference || 0) > 0 ? '+' : '' }}{{ formatMoney(audit.difference) }}
              </td>

              <!-- Status badge -->
              <td class="py-4 px-4">
                <span :class="[
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border',
                  audit.status === 'SHORTAGE' ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' :
                  audit.status === 'SURPLUS' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400' :
                  'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                ]">
                  {{ audit.status === 'SHORTAGE' ? 'KAMOMAD' : audit.status === 'SURPLUS' ? 'ORTIQCHA' : 'TO\'G\'RI' }}
                </span>
              </td>

              <!-- Action button -->
              <td class="py-4 px-5 text-right">
                <button 
                  @click="selectedAuditForModal = audit"
                  class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-500 text-indigo-600 hover:text-white dark:bg-indigo-500/10 dark:hover:bg-indigo-600 dark:text-indigo-400 dark:hover:text-white font-bold rounded-xl text-xs transition active:scale-95 flex items-center space-x-1.5 ml-auto cursor-pointer"
                >
                  <Eye class="w-3.5 h-3.5" />
                  <span>Ko'rish</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ════════════════════ DETAILED Z-REPORT MODAL ════════════════════ -->
    <div 
      v-if="selectedAuditForModal" 
      class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 select-none animate-in fade-in duration-200"
    >
      <div 
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg max-h-[94vh] flex flex-col shadow-2xl overflow-hidden"
        @click.stop
      >
        <!-- Modal Header (Sticky) -->
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 shrink-0 bg-slate-50/50 dark:bg-slate-950/40">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileSpreadsheet class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                Z-REPORT #{{ selectedAuditForModal.id }}
              </h3>
              <p class="text-[11px] text-slate-500">
                Smena vaqti: {{ selectedAuditForModal.createdAt }}
              </p>
            </div>
          </div>
          <button 
            @click="selectedAuditForModal = null" 
            class="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Printable Receipt Sheet Preview (Scrollable) -->
        <div class="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-3.5">
          <div class="bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5 text-xs font-mono">
            <div class="text-center pb-2.5 border-b border-dashed border-slate-300 dark:border-slate-700">
              <h4 class="font-black text-sm text-slate-900 dark:text-white">DOSTON FAST FOOD</h4>
              <p class="text-[10px] text-slate-500 mt-0.5">SMENA YAKUNIY FISKAL Z-REPORT</p>
              <p class="text-[10px] text-slate-400">Mas'ul: {{ selectedAuditForModal.cashierName || 'Admin' }}</p>
            </div>

            <!-- Main Financials -->
            <div class="space-y-1.5">
              <div class="flex justify-between">
                <span class="text-slate-500">1. Boshlang'ich Kassa:</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ formatMoney(selectedAuditForModal.initialCash || 0) }} so'm</span>
              </div>
              <div class="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>2. Naqd Pul Tushumi:</span>
                <span>+{{ formatMoney(selectedAuditForModal.totalCashSales || selectedAuditForModal.declaredCash) }} so'm</span>
              </div>
              <div class="flex justify-between text-blue-600 dark:text-blue-400 font-bold">
                <span>3. Terminal (Humo/Uzcard):</span>
                <span>{{ formatMoney(selectedAuditForModal.totalCardSales || selectedAuditForModal.declaredCard) }} so'm</span>
              </div>
              <div class="flex justify-between text-rose-500 font-bold">
                <span>4. Chiqimlar (Xarajatlar):</span>
                <span>-{{ formatMoney(selectedAuditForModal.totalExpenses || 0) }} so'm</span>
              </div>
              <div class="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 flex justify-between font-black text-slate-900 dark:text-white text-sm">
                <span>JAMI TUSHUM:</span>
                <span>{{ formatMoney((selectedAuditForModal.totalCashSales || 0) + (selectedAuditForModal.totalCardSales || selectedAuditForModal.declaredCard || 0)) }} so'm</span>
              </div>
            </div>

            <!-- Drawer Audit Section -->
            <div class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Kutilgan Naqd Pul:</span>
                <span>{{ formatMoney(selectedAuditForModal.expectedCash) }} so'm</span>
              </div>
              <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Kassir Sanagan Pul:</span>
                <span>{{ formatMoney(selectedAuditForModal.declaredCash) }} so'm</span>
              </div>
              <div :class="['flex justify-between font-black pt-1 border-t border-slate-200 dark:border-slate-800', (selectedAuditForModal.difference || 0) < 0 ? 'text-rose-500' : 'text-emerald-500']">
                <span>Kassa Farqi (Diff):</span>
                <span>{{ (selectedAuditForModal.difference || 0) > 0 ? '+' : '' }}{{ formatMoney(selectedAuditForModal.difference) }} so'm</span>
              </div>
            </div>

            <!-- Cashier 1 & 2 Breakdown in Z-Report -->
            <div class="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-1.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Qavatlar & Kassirlar Tahlili:</span>
              
              <div class="flex justify-between">
                <span>🏛️ Kassir 1 (1-Qavat • Stollar):</span>
                <span class="font-bold">{{ formatMoney(selectedAuditForModal.cashier1Stats?.total || 0) }} so'm ({{ selectedAuditForModal.cashier1Stats?.count || 0 }} ta)</span>
              </div>
              <div class="flex justify-between">
                <span>👑 Kassir 2 (2-Qavat • VIP Xonalar):</span>
                <span class="font-bold">{{ formatMoney(selectedAuditForModal.cashier2Stats?.total || 0) }} so'm ({{ selectedAuditForModal.cashier2Stats?.count || 0 }} ta)</span>
              </div>
            </div>

            <div v-if="selectedAuditForModal.notes" class="pt-2 text-slate-500 text-[10px]">
              <span class="font-bold">Izoh:</span> {{ selectedAuditForModal.notes }}
            </div>
          </div>
        </div>

        <!-- Action Buttons (Sticky Footer) -->
        <div class="flex items-center space-x-3 p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 shrink-0">
          <button 
            @click="selectedAuditForModal = null" 
            class="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Yopish
          </button>
          <button 
            @click="printAuditReceipt(selectedAuditForModal)" 
            class="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition active:scale-95 cursor-pointer"
          >
            <Printer class="w-4 h-4" />
            <span>Z-Reportni Chop Etish</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ════════════════════ BLIND CASH RECONCILIATION MODAL ════════════════════ -->
    <div v-if="showCloseModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-2 sm:p-4 select-none animate-in fade-in duration-200">
      <div class="bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-lg max-h-[94vh] flex flex-col shadow-2xl overflow-hidden transition-all">
        
        <!-- Header (Sticky) -->
        <div class="border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 sm:py-4 shrink-0 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
          <div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-black rounded-full mb-1">
              <Receipt class="w-3 h-3 text-amber-500" />
              <span>SMENANI YOPISH & AUDIT</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-wide">Smenani Yopish (Z-Report)</h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Kassadagi sanalgan naqd va terminal tushumlarini kiriting</p>
          </div>

          <button 
            @click="showCloseModal = false" 
            class="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-3.5">
          <!-- Live Total Counter Summary Card -->
          <div class="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Jami Sanalgan Pul:</span>
              <span class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">{{ totalDeclaredSum.toLocaleString('uz-UZ') }} so'm</span>
            </div>
            <div class="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 font-black text-xs">
              Z
            </div>
          </div>

          <!-- Input Fields Grid -->
          <div class="space-y-3">
            <!-- 1. CASH INPUT -->
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Banknote class="w-3.5 h-3.5 text-emerald-500" />
                <span>Sanatilgan Naqd Pul (Kassadagi float bilan):</span>
              </label>
              <div class="relative">
                <input 
                  type="text" 
                  :value="declaredCashInput ? declaredCashInput.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''"
                  @input="declaredCashInput = formatMoneyInput($event)"
                  placeholder="Masalan: 1 450 000"
                  class="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-base sm:text-lg font-black font-mono focus:border-amber-500 focus:outline-none transition shadow-sm"
                />
                <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 pointer-events-none">SO'M</span>
              </div>
            </div>

            <!-- 2. CARD INPUT -->
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CreditCard class="w-3.5 h-3.5 text-blue-500" />
                <span>Uzcard / Humo Terminal Summasi:</span>
              </label>
              <div class="relative">
                <input 
                  type="text" 
                  :value="declaredCardInput ? declaredCardInput.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''"
                  @input="declaredCardInput = formatMoneyInput($event)"
                  placeholder="Masalan: 850 000"
                  class="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-base sm:text-lg font-black font-mono focus:border-blue-500 focus:outline-none transition shadow-sm"
                />
                <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 pointer-events-none">SO'M</span>
              </div>
            </div>

            <!-- 3. NOTES -->
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Smena Yopish Izohi (Ixtiyoriy):
              </label>
              <input 
                type="text" 
                v-model="auditNotes"
                placeholder="Masalan: 50 000 so'm maydalashga berilgan..."
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <!-- Action Buttons (Sticky Footer) -->
        <div class="flex items-center space-x-3 p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 shrink-0">
          <button 
            @click="showCloseModal = false" 
            class="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Bekor qilish
          </button>
          <button 
            @click="handleCloseShiftSubmit" 
            class="flex-1 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white py-3 rounded-xl font-black text-xs shadow-lg shadow-rose-600/25 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Receipt class="w-4 h-4" />
            <span>Z-Reportni Yopish</span>
          </button>
        </div>

      </div>
    </div>

    <!-- ════════════════════ CASH EXPENSE MODAL ════════════════════ -->
    <div v-if="showExpenseModal" class="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 select-none">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        <!-- Header (Sticky) -->
        <div class="border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 shrink-0 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
          <div>
            <div class="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-full mb-1">
              <DollarSign class="w-3 h-3" />
              <span>KASSA XARAJATI</span>
            </div>
            <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Kassadan Pul Olish (Chiqim)</h3>
          </div>
          <button @click="showExpenseModal = false" class="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body (Scrollable) -->
        <div class="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-3.5">
          <div>
            <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Olinayotgan Summa:</label>
            <input 
              type="text" 
              :value="expenseAmount ? expenseAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''"
              @input="expenseAmount = formatMoneyInput($event)"
              placeholder="Masalan: 50 000"
              class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-base sm:text-lg font-bold font-mono focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Xarajat Sababi:</label>
            <input 
              type="text" 
              v-model="expenseReason"
              placeholder="Masalan: Suv uchun, Bozordan pomidor..."
              class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-rose-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- Footer (Sticky) -->
        <div class="flex items-center space-x-3 p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 shrink-0">
          <button @click="showExpenseModal = false" class="flex-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer">
            Bekor qilish
          </button>
          <button @click="handleAddExpense" class="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/25 transition cursor-pointer">
            Tasdiqlash va Olish
          </button>
        </div>

      </div>
    </div>

    <!-- ════════════════════ OPEN NEW SHIFT MODAL ════════════════════ -->
    <div v-if="showOpenShiftModal" class="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 select-none">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        <!-- Header (Sticky) -->
        <div class="border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 shrink-0 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
          <div>
            <div class="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full mb-1">
              <LockOpen class="w-3 h-3" />
              <span>YANGI SMENA</span>
            </div>
            <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Smenani Ochish</h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">Boshlang'ich qaytim pulini (Float cash) kiriting</p>
          </div>
          <button @click="showOpenShiftModal = false" class="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body (Scrollable) -->
        <div class="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-3.5">
          <div>
            <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Boshlang'ich Kassa (Float Cash):</label>
            <input 
              type="text" 
              :value="initialFloatCash !== null ? initialFloatCash.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''"
              @input="initialFloatCash = formatMoneyInput($event)"
              placeholder="Masalan: 200 000"
              class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-base sm:text-lg font-bold font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- Footer (Sticky) -->
        <div class="flex items-center space-x-3 p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 shrink-0">
          <button @click="showOpenShiftModal = false" class="flex-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer">
            Bekor qilish
          </button>
          <button @click="submitOpenShift" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition cursor-pointer">
            Smenani Boshlash
          </button>
        </div>

      </div>
    </div>

  </div>
</template>
