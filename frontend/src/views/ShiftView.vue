<script setup lang="ts">
import { ref, computed } from 'vue';
import { useShiftStore } from '../stores/shiftStore';
import { useToastStore } from '../stores/toastStore';
import { formatMoney } from '../utils/formatters';
import { 
  Receipt, 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  User, 
  DollarSign, 
  ShieldAlert,
  Lock,
  LockOpen,
  Banknote,
  CreditCard,
  QrCode,
  X
} from 'lucide-vue-next';

const shiftStore = useShiftStore();
const toast = useToastStore();

const showCloseModal = ref(false);
const declaredCashInput = ref<number | null>(null);
const declaredCardInput = ref<number | null>(null);
const declaredQrInput = ref<number | null>(null);
const pinError = ref('');
const auditNotes = ref('');

const showExpenseModal = ref(false);
const expenseAmount = ref<number | null>(null);
const expenseReason = ref('');

const showOpenShiftModal = ref(false);
const initialFloatCash = ref<number | null>(200000);

const lastAuditResult = ref<any | null>(null);

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
  return (declaredCashInput.value || 0) + (declaredCardInput.value || 0) + (declaredQrInput.value || 0);
});

function handleCloseShiftSubmit() {
  pinError.value = '';

  if (declaredCashInput.value === null && declaredCardInput.value === null && declaredQrInput.value === null) {
    toast.warning('Sanab kiritilgan summalarni kiriting!');
    return;
  }

  const result = shiftStore.closeShiftBlindReconciliation(
    declaredCashInput.value || 0,
    declaredCardInput.value || 0,
    declaredQrInput.value || 0,
    auditNotes.value
  );

  lastAuditResult.value = result;
  showCloseModal.value = false;
  toast.success('Smena muvaffaqiyatli yopildi va Z-Report yaratildi! 🧾');
  
  // Clear inputs for next time
  declaredCashInput.value = null;
  declaredCardInput.value = null;
  declaredQrInput.value = null;
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
</script>

<template>
  <div class="h-full w-full overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 space-y-6 sm:space-y-8 transition-colors duration-300">
    
    <!-- Header Title -->
    <div class="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <!-- Decorative gradient -->
      <div class="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-slate-100 dark:from-slate-800 to-transparent pointer-events-none"></div>
      
      <div class="relative z-10 flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <ShieldAlert class="w-6 h-6 text-white" />
        </div>
        <div>
          <div class="flex items-center gap-3">
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">Smena & Z-Report</h2>
            <div v-if="shiftStore.isShiftOpen" class="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Smena Ochiq
            </div>
            <div v-else class="flex items-center gap-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <span class="w-2 h-2 rounded-full bg-rose-500"></span>
              Smena Yopiq
            </div>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Ko'r-kassir (Blind Reconciliation) xavfsizlik protokoli faol</p>
        </div>
      </div>

      <div class="relative z-10 flex gap-3">
        <button 
          v-if="shiftStore.isShiftOpen"
          @click="showExpenseModal = true"
          class="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-3 rounded-xl font-bold text-sm shadow-sm flex items-center space-x-2 transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
        >
          <DollarSign class="w-4 h-4 text-rose-500" />
          <span class="hidden sm:inline">Kassadan Xarajat</span>
          <span class="sm:hidden">Xarajat</span>
        </button>
        <button 
          v-if="shiftStore.isShiftOpen"
          @click="showCloseModal = true"
          class="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-rose-500/30 flex items-center space-x-2 transition-all active:scale-95 border border-rose-400/50"
        >
          <Lock class="w-4 h-4" />
          <span>Smenani Yopish (Z-Report)</span>
        </button>
        <button 
          v-else
          @click="showOpenShiftModal = true"
          class="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 flex items-center space-x-2 transition-all active:scale-95 border border-emerald-400/50"
        >
          <LockOpen class="w-4 h-4" />
          <span>Yangi Smenani Ochish</span>
        </button>
      </div>
    </div>

    <!-- Active Shift Status Card -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:shadow-xl transition-all shadow-sm">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
            <User class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mas'ul Shaxs</span>
        </div>
        <div class="text-2xl font-black text-slate-900 dark:text-white mb-1 truncate">
          {{ shiftStore.currentShift?.cashierName || 'Smena Yopiq' }}
        </div>
        <div class="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
          <Clock class="w-3.5 h-3.5 text-amber-500" />
          <span>Ochilgan vaqti: <span class="font-bold text-slate-700 dark:text-slate-300">{{ shiftStore.currentShift?.openedAt || '--:--' }}</span></span>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:shadow-xl transition-all shadow-sm">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
            <DollarSign class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Float Cash</span>
        </div>
        <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mb-1 truncate">
          {{ formatMoney(shiftStore.currentShift?.initialCash) }} <span class="text-sm font-sans text-slate-500">so'm</span>
        </div>
        <div class="text-xs text-slate-500 font-medium">Smena boshlang'ich kassa qoldig'i</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:shadow-xl transition-all shadow-sm">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors"></div>
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
            <DollarSign class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jami Xarajatlar</span>
        </div>
        <div class="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mb-1 truncate">
          {{ formatMoney(shiftStore.currentShift?.expenses?.reduce((s, e) => s + e.amount, 0)) }} <span class="text-sm font-sans text-slate-500">so'm</span>
        </div>
        <div class="text-xs text-slate-500 font-medium">{{ shiftStore.currentShift?.expenses?.length || 0 }} ta xarajat kiritilgan</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:shadow-xl transition-all shadow-sm">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
            <Receipt class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Buyurtmalar</span>
        </div>
        <div class="flex items-baseline gap-2 mb-1">
          <div class="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {{ shiftStore.currentShiftOrders.length || 0 }}
          </div>
          <span class="text-sm font-bold text-slate-500">ta chek</span>
        </div>
        <div class="text-xs text-slate-500 font-medium">Joriy smenadagi tasdiqlangan buyurtmalar</div>
      </div>
    </div>

    <!-- Last Z-Report Audit Banner if generated -->
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
          <span class="text-xs font-mono font-bold bg-white/50 dark:bg-black/20 px-3 py-1 rounded-lg shrink-0 border border-slate-200/50 dark:border-slate-800/50">{{ lastAuditResult.createdAt }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white/40 dark:bg-black/20 p-4 rounded-2xl border border-slate-200/30 dark:border-slate-800/30">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Kutilgan Naqd:</span>
            <span class="font-black text-slate-900 dark:text-white font-mono text-base">{{ formatMoney(lastAuditResult.expectedCash) }} <span class="text-[10px] font-sans text-slate-500">so'm</span></span>
          </div>
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Xarajatlar (Minus):</span>
            <span class="font-black text-rose-600 dark:text-rose-400 font-mono text-base">-{{ formatMoney(lastAuditResult.totalExpenses) }} <span class="text-[10px] font-sans text-slate-500">so'm</span></span>
          </div>
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Kassir kiritgan:</span>
            <span class="font-black text-slate-900 dark:text-white font-mono text-base">{{ formatMoney(lastAuditResult.declaredCash) }} <span class="text-[10px] font-sans text-slate-500">so'm</span></span>
          </div>
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Farq (Diff):</span>
            <span :class="['font-black font-mono text-lg', lastAuditResult.difference < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400']">
              {{ lastAuditResult.difference > 0 ? '+' : '' }}{{ formatMoney(lastAuditResult.difference) }} <span class="text-[10px] font-sans">so'm</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Audit Logs Table -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-1 shadow-sm overflow-hidden">
      <div class="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800">
        <h3 class="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Receipt class="w-5 h-5 text-indigo-500" />
          <span>Smenalar Auditi va Z-Report Tarixi</span>
        </h3>
        <p class="text-xs text-slate-500 mt-1">Avvalgi yopilgan smenalar bo'yicha to'liq kassa hisoboti va farqlar</p>
      </div>

      <div class="overflow-x-auto max-w-full">
        <!-- Empty State (Beautiful and Engaging) -->
        <div v-if="shiftStore.shiftAudits.length === 0" class="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div class="w-24 h-24 mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl relative">
            <Receipt class="w-10 h-10 text-slate-400" />
            <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">
              <CheckCircle2 class="w-4 h-4 text-white" />
            </div>
          </div>
          <h4 class="text-lg font-black text-slate-900 dark:text-white mb-2">Hozircha Z-Report mavjud emas</h4>
          <p class="text-sm text-slate-500 max-w-sm mx-auto">
            Siz hali birorta ham smenani yopmagansiz. Smenani yopganingizdan so'ng, to'liq kassa hisoboti shu yerda chiroyli tarzda paydo bo'ladi.
          </p>
          <button v-if="shiftStore.isShiftOpen" @click="showCloseModal = true" class="mt-6 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline flex items-center gap-1">
            Z-Report qanday ishlashini ko'rish uchun smenani yoping <ArrowUpRight class="w-4 h-4" />
          </button>
        </div>

        <!-- Table -->
        <table v-else class="w-full text-left text-xs border-collapse min-w-[800px]">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
              <th class="py-4 px-6 first:rounded-tl-2xl">Audit ID</th>
              <th class="py-4 px-6">Audit Vaqti</th>
              <th class="py-4 px-6">Kutilgan Naqd Pul</th>
              <th class="py-4 px-6">Kassir Kiritgan Pul</th>
              <th class="py-4 px-6">Farq (Diff)</th>
              <th class="py-4 px-6 last:rounded-tr-2xl text-right">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            <tr v-for="audit in shiftStore.shiftAudits" :key="audit.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
              <td class="py-4 px-6 font-bold text-slate-900 dark:text-white">{{ audit.id }}</td>
              <td class="py-4 px-6 text-slate-500 font-medium">{{ audit.createdAt }}</td>
              <td class="py-4 px-6 font-mono font-bold">{{ audit.expectedCash.toLocaleString('uz-UZ') }} <span class="text-[10px] text-slate-400 font-sans">so'm</span></td>
              <td class="py-4 px-6 font-mono font-bold">{{ audit.declaredCash.toLocaleString('uz-UZ') }} <span class="text-[10px] text-slate-400 font-sans">so'm</span></td>
              <td :class="['py-4 px-6 font-mono font-black', audit.difference < 0 ? 'text-rose-500' : 'text-emerald-500']">
                {{ audit.difference > 0 ? '+' : '' }}{{ audit.difference.toLocaleString('uz-UZ') }} <span class="text-[10px] opacity-70 font-sans">so'm</span>
              </td>
              <td class="py-4 px-6 text-right">
                <span :class="[
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border',
                  audit.status === 'SHORTAGE' ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' :
                  audit.status === 'SURPLUS' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400' :
                  'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                ]">
                  {{ audit.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- BLIND CASH RECONCILIATION MODAL (INTERACTIVE & MODERN) -->
    <div v-if="showCloseModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div class="bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-6 transition-all">
        
        <!-- Header -->
        <div class="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black rounded-full mb-2">
              <Receipt class="w-3.5 h-3.5 text-amber-500" />
              <span>SMENANI YOPISH & AUDIT</span>
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-wide">Smenani Yopish (Z-Report)</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kassadagi sanalgan naqd va terminal tushumlarini kiriting</p>
          </div>

          <button 
            @click="showCloseModal = false"
            class="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Live Total Counter Summary Card -->
        <div class="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span class="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Jami Sanalgan Pul:</span>
            <span class="text-2xl font-black text-slate-900 dark:text-white font-mono">{{ totalDeclaredSum.toLocaleString('uz-UZ') }} so'm</span>
          </div>
          <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 font-black text-sm">
            Z
          </div>
        </div>

        <!-- Input Fields Grid -->
        <div class="space-y-4">
          <!-- 1. CASH INPUT -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Banknote class="w-4 h-4 text-emerald-500" />
              <span>Sanatilgan Naqd Pul (Kassadagi float bilan):</span>
            </label>
            <div class="relative">
              <input 
                type="text" 
                :value="declaredCashInput ? declaredCashInput.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''"
                @input="declaredCashInput = formatMoneyInput($event)"
                placeholder="Masalan: 1 450 000"
                class="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-lg font-black font-mono focus:border-amber-500 focus:outline-none transition shadow-sm"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">SO'M</span>
            </div>
          </div>

          <!-- 2. CARD INPUT -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CreditCard class="w-4 h-4 text-blue-500" />
              <span>Uzcard / Humo Terminal Summasi:</span>
            </label>
            <div class="relative">
              <input 
                type="text" 
                :value="declaredCardInput ? declaredCardInput.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''"
                @input="declaredCardInput = formatMoneyInput($event)"
                placeholder="Masalan: 850 000"
                class="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-lg font-black font-mono focus:border-blue-500 focus:outline-none transition shadow-sm"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">SO'M</span>
            </div>
          </div>

          <!-- 3. QR INPUT -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <QrCode class="w-4 h-4 text-purple-500" />
              <span>Click / Payme & QR To'lovlar:</span>
            </label>
            <div class="relative">
              <input 
                type="text" 
                :value="declaredQrInput ? declaredQrInput.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''"
                @input="declaredQrInput = formatMoneyInput($event)"
                placeholder="Masalan: 320 000"
                class="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-lg font-black font-mono focus:border-purple-500 focus:outline-none transition shadow-sm"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">SO'M</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center space-x-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button 
            @click="showCloseModal = false" 
            class="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3.5 rounded-2xl font-bold text-xs transition cursor-pointer"
          >
            Bekor qilish
          </button>
          <button 
            @click="handleCloseShiftSubmit" 
            class="flex-1 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white py-3.5 rounded-2xl font-black text-xs shadow-lg shadow-rose-600/25 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Receipt class="w-4 h-4" />
            <span>Z-Reportni Yopish</span>
          </button>
        </div>

      </div>
    </div>

    <!-- CASH EXPENSE MODAL -->
    <div v-if="showExpenseModal" class="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl space-y-6">
        
        <div class="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-full mb-2">
            <DollarSign class="w-3.5 h-3.5" />
            <span>KASSA XARAJATI</span>
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">Kassadan Pul Olish</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Xarajat qilingan summani va uning sababini kiriting (Z-Reportda hisobga olinadi)</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Olinayotgan Summa:</label>
            <input 
              type="text" 
              :value="expenseAmount ? expenseAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''"
              @input="expenseAmount = formatMoneyInput($event)"
              placeholder="Masalan: 50 000"
              class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-lg font-bold font-mono focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Xarajat Sababi:</label>
            <input 
              type="text" 
              v-model="expenseReason"
              placeholder="Masalan: Suv uchun, Bozordan pomidor..."
              class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-rose-500 focus:outline-none"
            />
          </div>
        </div>

        <div class="flex items-center space-x-3 pt-3">
          <button @click="showExpenseModal = false" class="flex-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3.5 rounded-xl font-bold text-sm transition">
            Bekor qilish
          </button>
          <button @click="handleAddExpense" class="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-rose-600/25 transition">
            Tasdiqlash va Olish
          </button>
        </div>

      </div>
    </div>

    <!-- OPEN NEW SHIFT MODAL -->
    <div v-if="showOpenShiftModal" class="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl space-y-6">
        
        <div class="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full mb-2">
            <LockOpen class="w-3.5 h-3.5" />
            <span>YANGI SMENA</span>
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">Smenani Ochish</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Kassadagi boshlang'ich qaytim pulini (Float cash) kiriting</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Boshlang'ich Kassa (Float Cash):</label>
            <input 
              type="text" 
              :value="initialFloatCash !== null ? initialFloatCash.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''"
              @input="initialFloatCash = formatMoneyInput($event)"
              placeholder="Masalan: 200 000"
              class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-lg font-bold font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div class="flex items-center space-x-3 pt-3">
          <button @click="showOpenShiftModal = false" class="flex-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3.5 rounded-xl font-bold text-sm transition">
            Bekor qilish
          </button>
          <button @click="submitOpenShift" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/25 transition">
            Smenani Boshlash
          </button>
        </div>

      </div>
    </div>

  </div>
</template>
