<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PaymentType } from '../types/pos';
import { X, Banknote, QrCode, CheckCircle2 } from 'lucide-vue-next';

const props = defineProps<{
  totalAmount: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success', paymentType: PaymentType, paidAmount: number): void;
}>();

const selectedPaymentType = ref<PaymentType>('CASH');
const paidAmountInput = ref<number>(props.totalAmount);

const changeAmount = computed(() => {
  return Math.max(0, (paidAmountInput.value || 0) - props.totalAmount);
});

// Quick Cash Buttons
const quickAmounts = computed(() => {
  const roundedUp = Math.ceil(props.totalAmount / 10000) * 10000;
  return Array.from(new Set([props.totalAmount, roundedUp, 50000, 100000, 200000])).filter(a => a >= props.totalAmount);
});

function selectQuickAmount(amount: number) {
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
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">To'lovni Qabul Qilish</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">To'lov turini tanlang va chekni chop eting</p>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Payment Type Selector Grid -->
      <div class="grid grid-cols-2 gap-3">
        <button 
          @click="selectedPaymentType = 'CASH'; paidAmountInput = totalAmount"
          :class="[
            'p-4 rounded-2xl border flex items-center space-x-3 transition-all duration-200',
            selectedPaymentType === 'CASH' 
              ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-lg shadow-amber-500/10'
              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
          ]"
        >
          <div :class="['p-2 rounded-xl', selectedPaymentType === 'CASH' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-900 text-slate-500']">
            <Banknote class="w-5 h-5" />
          </div>
          <div class="text-left">
            <div class="text-sm">Naqd Pul</div>
            <div class="text-[10px] opacity-70">Cash in drawer</div>
          </div>
        </button>

        <button 
          @click="selectedPaymentType = 'CLICK_PAYME'; paidAmountInput = totalAmount"
          :class="[
            'p-4 rounded-2xl border flex items-center space-x-3 transition-all duration-200',
            selectedPaymentType === 'CLICK_PAYME' 
              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-lg shadow-emerald-500/10'
              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
          ]"
        >
          <div :class="['p-2 rounded-xl', selectedPaymentType === 'CLICK_PAYME' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-900 text-slate-500']">
            <QrCode class="w-5 h-5" />
          </div>
          <div class="text-left">
            <div class="text-sm">Click / Payme</div>
            <div class="text-[10px] opacity-70">Dynamic QR Code</div>
          </div>
        </button>
      </div>

      <!-- Total & Cash Calculation Box -->
      <div class="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-sm">
          <span>Jami to'lanishi kerak:</span>
          <span class="text-2xl font-black text-slate-900 dark:text-white font-mono">{{ totalAmount.toLocaleString('uz-UZ') }} so'm</span>
        </div>

        <div v-if="selectedPaymentType === 'CASH'" class="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kassir Qabul Qilgan Pul:</label>
          <input 
            type="number" 
            v-model="paidAmountInput"
            class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xl font-bold font-mono focus:border-amber-500 focus:outline-none"
          />

          <!-- Quick Cash Amount Shortcuts -->
          <div class="flex flex-wrap gap-2 pt-1">
            <button 
              v-for="amt in quickAmounts" 
              :key="amt"
              @click="selectQuickAmount(amt)"
              class="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition"
            >
              {{ amt.toLocaleString('uz-UZ') }}
            </button>
          </div>

          <!-- Change Amount Display (Qaytim) -->
          <div class="flex items-center justify-between p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30 mt-2">
            <span class="text-sm font-medium text-emerald-700 dark:text-emerald-300">Mijozga Qaytim (Change):</span>
            <span class="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{{ changeAmount.toLocaleString('uz-UZ') }} so'm</span>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <button 
        @click="handleComplete"
        class="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 rounded-2xl font-bold text-base shadow-xl shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
      >
        <CheckCircle2 class="w-6 h-6" />
        <span>To'lovni Tasdiqlash va Chek Chop Etish</span>
      </button>

    </div>
  </div>
</template>
