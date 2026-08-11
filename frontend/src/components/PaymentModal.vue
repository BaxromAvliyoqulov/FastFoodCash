<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PaymentType } from '../types/pos';
import { X, Banknote, QrCode, CheckCircle2, AlertTriangle } from 'lucide-vue-next';

const props = defineProps<{
  totalAmount: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success', paymentType: PaymentType, paidAmount: number): void;
}>();

const selectedPaymentType = ref<PaymentType>('CASH');
const paidAmountInput = ref<number>(props.totalAmount);

const diffAmount = computed(() => {
  return (paidAmountInput.value || 0) - props.totalAmount;
});

const isSufficient = computed(() => diffAmount.value >= 0);

// Quick Cash Buttons
const quickAmounts = computed(() => {
  const roundedUp = Math.ceil(props.totalAmount / 10000) * 10000;
  const list = Array.from(new Set([
    props.totalAmount, 
    roundedUp, 
    50000, 
    100000, 
    200000
  ])).filter(a => a >= props.totalAmount);
  return list;
});

function addQuickCash(delta: number) {
  paidAmountInput.value = (paidAmountInput.value || 0) + delta;
}

function selectExactAmount(amount: number) {
  paidAmountInput.value = amount;
}

function handleComplete() {
  if (selectedPaymentType.value === 'CASH' && (paidAmountInput.value || 0) < props.totalAmount) {
    alert('Kiritilgan naqd pul jami summadan kam bo\'lishi mumkin emas!');
    return;
  }
  emit('success', selectedPaymentType.value, paidAmountInput.value || props.totalAmount);
}
</script>

<template>
  <div class="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-slate-100 transition-colors">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>To'lovni Qabul Qilish</span>
            <span class="text-xs bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">KASSA</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">To'lov turini tanlang va naqd qaytimni tekshiring</p>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Payment Type Selector Grid -->
      <div class="grid grid-cols-2 gap-3">
        <button 
          @click="selectedPaymentType = 'CASH'; paidAmountInput = totalAmount"
          :class="[
            'p-4 rounded-2xl border flex items-center space-x-3 transition-all duration-200 cursor-pointer',
            selectedPaymentType === 'CASH' 
              ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-lg shadow-amber-500/10 scale-[1.02]'
              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
          ]"
        >
          <div :class="['p-2 rounded-xl', selectedPaymentType === 'CASH' ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-900 text-slate-500']">
            <Banknote class="w-5 h-5" />
          </div>
          <div class="text-left">
            <div class="text-sm font-bold">Naqd Pul</div>
            <div class="text-[10px] opacity-70">Cash in drawer</div>
          </div>
        </button>

        <button 
          @click="selectedPaymentType = 'CLICK_PAYME'; paidAmountInput = totalAmount"
          :class="[
            'p-4 rounded-2xl border flex items-center space-x-3 transition-all duration-200 cursor-pointer',
            selectedPaymentType === 'CLICK_PAYME' 
              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-lg shadow-emerald-500/10 scale-[1.02]'
              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
          ]"
        >
          <div :class="['p-2 rounded-xl', selectedPaymentType === 'CLICK_PAYME' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-900 text-slate-500']">
            <QrCode class="w-5 h-5" />
          </div>
          <div class="text-left">
            <div class="text-sm font-bold">Click / Payme</div>
            <div class="text-[10px] opacity-70">Terminal & QR</div>
          </div>
        </button>
      </div>

      <!-- Total & Cash Calculation Box -->
      <div class="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-inner">
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-sm font-bold">
          <span>Jami To'lov Summasi:</span>
          <span class="text-2xl font-black text-slate-900 dark:text-white font-mono">{{ totalAmount.toLocaleString('uz-UZ') }} so'm</span>
        </div>

        <div v-if="selectedPaymentType === 'CASH'" class="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mijoz Bergan Pul (Naqd):</label>
              <button @click="paidAmountInput = totalAmount" class="text-[11px] font-bold text-amber-500 hover:underline">Aniq Summa</button>
            </div>
            <input 
              type="number" 
              v-model="paidAmountInput"
              class="w-full bg-white dark:bg-slate-900 border-2 border-amber-500/50 dark:border-amber-500/40 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white text-2xl font-black font-mono focus:border-amber-500 focus:outline-none shadow-sm"
              placeholder="Summani kiriting..."
            />
          </div>

          <!-- Quick Cash Amount Shortcuts -->
          <div class="space-y-2">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tezkor Kupyura Tanlash:</div>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="amt in quickAmounts" 
                :key="amt"
                @click="selectExactAmount(amt)"
                class="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold hover:border-amber-500 hover:text-amber-500 transition shadow-sm active:scale-95 cursor-pointer"
              >
                {{ amt.toLocaleString('uz-UZ') }}
              </button>
            </div>

            <!-- Incremental add shortcuts -->
            <div class="flex gap-2 pt-1">
              <button @click="addQuickCash(10000)" class="flex-1 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-black hover:bg-amber-500/20 active:scale-95 transition">+10,000</button>
              <button @click="addQuickCash(20000)" class="flex-1 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-black hover:bg-amber-500/20 active:scale-95 transition">+20,000</button>
              <button @click="addQuickCash(50000)" class="flex-1 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-black hover:bg-amber-500/20 active:scale-95 transition">+50,000</button>
              <button @click="addQuickCash(100000)" class="flex-1 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-black hover:bg-amber-500/20 active:scale-95 transition">+100,000</button>
            </div>
          </div>

          <!-- Dynamic Change Calculator Display (KASSA QAYTIM) -->
          <div 
            :class="[
              'p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center text-center space-y-1',
              isSufficient 
                ? 'bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-teal-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10'
                : 'bg-gradient-to-br from-rose-500/15 via-rose-500/10 to-red-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-lg shadow-rose-500/10 animate-pulse'
            ]"
          >
            <div class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest">
              <CheckCircle2 v-if="isSufficient" class="w-4 h-4 text-emerald-500" />
              <AlertTriangle v-else class="w-4 h-4 text-rose-500" />
              <span>{{ isSufficient ? "Mijozga Qaytariladigan Qaytim (Change):" : "Kassaga Yetmayotgan Pul:" }}</span>
            </div>
            
            <div class="text-3xl sm:text-4xl font-black font-mono tracking-tight">
              {{ isSufficient ? diffAmount.toLocaleString('uz-UZ') : Math.abs(diffAmount).toLocaleString('uz-UZ') }} <span class="text-lg font-bold">so'm</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <button 
        @click="handleComplete"
        :disabled="selectedPaymentType === 'CASH' && !isSufficient"
        :class="[
          'w-full py-4 rounded-2xl font-black text-base shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer',
          selectedPaymentType === 'CASH' && !isSufficient
            ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25'
        ]"
      >
        <CheckCircle2 class="w-6 h-6" />
        <span>To'lovni Tasdiqlash va Chek Chop Etish</span>
      </button>

    </div>
  </div>
</template>
