<script setup lang="ts">
import { ref } from 'vue';
import { useShiftStore } from '../stores/shiftStore';
import { usePosStore } from '../stores/posStore';
import { 
  Receipt, 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  User, 
  DollarSign, 
  ShieldAlert,
  Lock,
  LockOpen
} from 'lucide-vue-next';

const shiftStore = useShiftStore();
const posStore = usePosStore();

const showCloseModal = ref(false);
const declaredCashInput = ref<number | null>(null);
const declaredCardInput = ref<number | null>(null);
const declaredQrInput = ref<number | null>(null);
const auditNotes = ref('');

const lastAuditResult = ref<any | null>(null);

function handleCloseShiftSubmit() {
  if (declaredCashInput.value === null || declaredCardInput.value === null || declaredQrInput.value === null) {
    alert('Barcha sanab kiritilgan tushumlarni to\'liq to\'ldiring!');
    return;
  }

  const result = shiftStore.closeShiftBlindReconciliation(
    declaredCashInput.value,
    declaredCardInput.value,
    declaredQrInput.value,
    auditNotes.value
  );

  lastAuditResult.value = result;
  showCloseModal.value = false;
}

function handleOpenNewShift() {
  const initial = prompt('Kassadagi boshlang\'ich naqd pul (Float Cash) summasini kiriting:', '200000');
  if (initial) {
    shiftStore.openShift(parseFloat(initial));
    lastAuditResult.value = null;
  }
}
</script>

<template>
  <div class="h-[calc(100vh-65px)] overflow-y-auto bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 space-y-6 sm:space-y-8 transition-colors duration-300">
    
    <!-- Header Title -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">Smena Boshqaruvi & Z-Report Audit</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">Ko'r-kassir (Blind Reconciliation) usulida kassa balansi va kam-ko'st auditi</p>
      </div>

      <div v-if="shiftStore.isShiftOpen">
        <button 
          @click="showCloseModal = true"
          class="bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/25 flex items-center space-x-2 transition active:scale-95"
        >
          <Lock class="w-4 h-4" />
          <span>Smenani Yopish va Z-Report Olish</span>
        </button>
      </div>
      <div v-else>
        <button 
          @click="handleOpenNewShift"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 flex items-center space-x-2 transition active:scale-95"
        >
          <LockOpen class="w-4 h-4" />
          <span>Yangi Smenani Ochish</span>
        </button>
      </div>
    </div>

    <!-- Active Shift Status Card -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl">
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
          <span>Joriylashtirilgan Kassir</span>
          <User class="w-4 h-4 text-amber-500" />
        </div>
        <div class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
          {{ shiftStore.currentShift?.cashierName || 'Smena Yopiq' }}
        </div>
        <div class="text-xs text-slate-500 flex items-center gap-1 font-mono">
          <Clock class="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          <span>Ochilgan vaqti: {{ shiftStore.currentShift?.openedAt || '-' }}</span>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl">
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
          <span>Boshlang'ich Kassa Pul (Float Cash)</span>
          <DollarSign class="w-4 h-4 text-emerald-500" />
        </div>
        <div class="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
          {{ (shiftStore.currentShift?.initialCash || 0).toLocaleString('uz-UZ') }} so'm
        </div>
        <div class="text-[11px] text-slate-500">Smena ochilishida kassirga berilgan qaytim pullar</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl">
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
          <span>Smena Sotuvlari Soni</span>
          <Receipt class="w-4 h-4 text-blue-500" />
        </div>
        <div class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
          {{ posStore.orderHistory.length }} ta chek
        </div>
        <div class="text-[11px] text-slate-500">Bugungi real-vaqtda urilgan kassa sotuvlari</div>
      </div>

    </div>

    <!-- Last Z-Report Audit Banner if generated -->
    <div v-if="lastAuditResult" :class="[
      'p-5 sm:p-6 rounded-3xl border flex items-start space-x-4 animate-in fade-in duration-300',
      lastAuditResult.status === 'SHORTAGE' ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300' :
      lastAuditResult.status === 'SURPLUS' ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-300' :
      'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
    ]">
      <AlertOctagon v-if="lastAuditResult.status === 'SHORTAGE'" class="w-8 h-8 text-rose-500 shrink-0 mt-1" />
      <CheckCircle2 v-else class="w-8 h-8 text-emerald-500 shrink-0 mt-1" />

      <div class="space-y-2 flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
            Smena Z-Report Audit Natijasi: 
            <span v-if="lastAuditResult.status === 'SHORTAGE'" class="text-rose-500">KAMCHILIK DETEKT SHTATDA! (SHORTAGE)</span>
            <span v-else-if="lastAuditResult.status === 'SURPLUS'" class="text-amber-500">ORTIQCHA PUL BOR (SURPLUS)</span>
            <span v-else class="text-emerald-500">TIZIM VA KASSA 100% TENG (BALANCED)</span>
          </h4>
          <span class="text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0 ml-2">{{ lastAuditResult.createdAt }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-sm font-mono">
          <div>
            <span class="text-xs text-slate-500 dark:text-slate-400 block">Kutilayotgan Kassa Naqd Balansi:</span>
            <span class="font-bold text-slate-900 dark:text-white">{{ lastAuditResult.expectedCash.toLocaleString('uz-UZ') }} so'm</span>
          </div>
          <div>
            <span class="text-xs text-slate-500 dark:text-slate-400 block">Kassir Sanab Kiritgan Pul:</span>
            <span class="font-bold text-slate-900 dark:text-white">{{ lastAuditResult.declaredCash.toLocaleString('uz-UZ') }} so'm</span>
          </div>
          <div>
            <span class="text-xs text-slate-500 dark:text-slate-400 block">Audit Farqi (Diff):</span>
            <span :class="['font-extrabold text-base', lastAuditResult.difference < 0 ? 'text-rose-500' : 'text-emerald-500']">
              {{ lastAuditResult.difference.toLocaleString('uz-UZ') }} so'm
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Audit Logs Table -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert class="w-5 h-5 text-amber-500" />
          <span>Smenalar Auditi va Z-Report Tarixi</span>
        </h3>
      </div>

      <div class="overflow-x-auto max-w-full">
        <table class="w-full text-left text-xs border-collapse min-w-[600px]">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <th class="py-3 px-4">Audit ID</th>
              <th class="py-3 px-4">Audit Vaqti</th>
              <th class="py-3 px-4">Kutilgan Naqd Pul</th>
              <th class="py-3 px-4">Kassir Kiritgan Pul</th>
              <th class="py-3 px-4">Farq (Shortage/Surplus)</th>
              <th class="py-3 px-4">Audit Statusi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-slate-700 dark:text-slate-300">
            <tr v-for="audit in shiftStore.shiftAudits" :key="audit.id" class="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition">
              <td class="py-3.5 px-4 font-bold text-amber-600 dark:text-amber-400">{{ audit.id }}</td>
              <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400">{{ audit.createdAt }}</td>
              <td class="py-3.5 px-4 text-slate-900 dark:text-white font-semibold">{{ audit.expectedCash.toLocaleString('uz-UZ') }} so'm</td>
              <td class="py-3.5 px-4 text-slate-900 dark:text-white font-semibold">{{ audit.declaredCash.toLocaleString('uz-UZ') }} so'm</td>
              <td :class="['py-3.5 px-4 font-extrabold', audit.difference < 0 ? 'text-rose-500' : 'text-emerald-500']">
                {{ audit.difference.toLocaleString('uz-UZ') }} so'm
              </td>
              <td class="py-3.5 px-4">
                <span :class="[
                  'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                  audit.status === 'SHORTAGE' ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400' :
                  audit.status === 'SURPLUS' ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' :
                  'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                ]">
                  {{ audit.status }}
                </span>
              </td>
            </tr>

            <tr v-if="shiftStore.shiftAudits.length === 0">
              <td colspan="6" class="py-8 text-center text-slate-400 dark:text-slate-500 font-sans">
                Hozircha smena auditlari mavjud emas. Smenani yopganingizda Z-Report shu yerda paydo bo'ladi.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- BLIND CASH RECONCILIATION MODAL -->
    <div v-if="showCloseModal" class="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-6">
        
        <div class="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full mb-2">
            <Lock class="w-3.5 h-3.5" />
            <span>KO'R-KASSIR AUDIT REJIMIY</span>
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">Smenani Yopish (Z-Report Audit)</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Kassadagi haqiqiy naqd pul va terminal cheklari summasini sanab kiriting</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kassada Sanalgan Haqiqiy Naqd Pul (Naqd kassa + float):</label>
            <input 
              type="number" 
              v-model="declaredCashInput"
              placeholder="Masalan: 1450000"
              class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-lg font-bold font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Uzcard/Humo POS Terminal Summasi:</label>
            <input 
              type="number" 
              v-model="declaredCardInput"
              placeholder="Masalan: 850000"
              class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-lg font-bold font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Click/Payme & QR To'lovlar Summasi:</label>
            <input 
              type="number" 
              v-model="declaredQrInput"
              placeholder="Masalan: 320000"
              class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-lg font-bold font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div class="flex items-center space-x-3 pt-3">
          <button @click="showCloseModal = false" class="flex-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3.5 rounded-xl font-bold text-sm transition">
            Bekor qilish
          </button>
          <button @click="handleCloseShiftSubmit" class="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-rose-600/25 transition">
            Z-Report Auditini Olish
          </button>
        </div>

      </div>
    </div>

  </div>
</template>
