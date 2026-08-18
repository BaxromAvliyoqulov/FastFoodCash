<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PaymentType } from '../types/pos';
import { useToastStore } from '../stores/toastStore';
import { X, Banknote, CreditCard, CheckCircle2, AlertTriangle } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  totalAmount: number;
  subtotal?: number;
  serviceFee?: number;
  serviceFeePercent?: number;
}>(), {
  subtotal: 0,
  serviceFee: 0,
  serviceFeePercent: 7
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success', paymentType: PaymentType, paidAmount: number): void;
}>();

const toast = useToastStore();
const selectedPaymentType = ref<PaymentType>('CASH');
const paidAmountInput = ref<number>(props.totalAmount);
const isSubmitting = ref(false);

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
  if (isSubmitting.value) return;

  if (selectedPaymentType.value === 'CASH' && (paidAmountInput.value || 0) < props.totalAmount) {
    toast.error('Kiritilgan naqd pul jami summadan kam bo\'lishi mumkin emas!');
    return;
  }
  
  isSubmitting.value = true;
  emit('success', selectedPaymentType.value, paidAmountInput.value || props.totalAmount);
}
</script>

<template>
  <div class="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 select-none">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-slate-100 transition-colors">
      
      <!-- ── Modal Header (Sticky / Shrink-0) ── -->
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 sm:py-4 shrink-0 bg-slate-50/50 dark:bg-slate-950/40">
        <div>
          <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>To'lovni Qabul Qilish</span>
            <span class="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">KASSA</span>
          </h3>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">To'lov turini tanlang va naqd qaytimni tekshiring</p>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <X class="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <!-- ── Scrollable Modal Body ── -->
      <div class="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-4">
        <!-- Payment Type Selector Grid (Naqd Pul va Plastik Karta) -->
        <div class="grid grid-cols-2 gap-2.5 sm:gap-3">
          <!-- CASH -->
          <button 
            @click="selectedPaymentType = 'CASH'; paidAmountInput = totalAmount"
            :class="[
              'p-3 sm:p-3.5 rounded-2xl border flex items-center space-x-3 transition-all duration-200 cursor-pointer text-left',
              selectedPaymentType === 'CASH' 
                ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-md shadow-amber-500/10 scale-[1.01]'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            ]"
          >
            <div :class="['p-2.5 rounded-xl shrink-0', selectedPaymentType === 'CASH' ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-900 text-slate-500']">
              <Banknote class="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div class="text-xs sm:text-sm font-bold">Naqd Pul</div>
              <div class="text-[9px] sm:text-[10px] opacity-70">Qaytim hisoblagich</div>
            </div>
          </button>

          <!-- CARD (Plastik Karta Terminal) -->
          <button 
            @click="selectedPaymentType = 'CARD'; paidAmountInput = totalAmount"
            :class="[
              'p-3 sm:p-3.5 rounded-2xl border flex items-center space-x-3 transition-all duration-200 cursor-pointer text-left',
              selectedPaymentType === 'CARD' 
                ? 'bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400 font-bold shadow-md shadow-blue-500/10 scale-[1.01]'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            ]"
          >
            <div :class="['p-2.5 rounded-xl shrink-0', selectedPaymentType === 'CARD' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-900 text-slate-500']">
              <CreditCard class="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div class="text-xs sm:text-sm font-bold">Plastik Karta</div>
              <div class="text-[9px] sm:text-[10px] opacity-70">Humo / Uzcard</div>
            </div>
          </button>
        </div>

        <!-- Total & Cash Calculation Box -->
        <div class="bg-slate-50 dark:bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-inner">
          
          <!-- Breakdown if service fee exists -->
          <div v-if="serviceFee && serviceFee > 0" class="space-y-1 text-xs border-b border-slate-200 dark:border-slate-800 pb-2">
            <div class="flex justify-between text-slate-500">
              <span>Taomlar summasi:</span>
              <span class="font-mono font-bold">{{ (subtotal || totalAmount - serviceFee).toLocaleString('uz-UZ') }} so'm</span>
            </div>
            <div class="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
              <span>Xizmat haqi ({{ serviceFeePercent }}%):</span>
              <span class="font-mono">+{{ serviceFee.toLocaleString('uz-UZ') }} so'm</span>
            </div>
          </div>

          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-bold">
            <span>Jami To'lov:</span>
            <span class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">{{ totalAmount.toLocaleString('uz-UZ') }} so'm</span>
          </div>

          <div v-if="selectedPaymentType === 'CASH'" class="space-y-3 pt-2.5 border-t border-slate-200 dark:border-slate-800">
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mijoz Bergan Pul (Naqd):</label>
                <button @click="paidAmountInput = totalAmount" class="text-[11px] font-bold text-amber-500 hover:underline cursor-pointer">Aniq Summa</button>
              </div>
              <input 
                type="number" 
                v-model="paidAmountInput"
                class="w-full bg-white dark:bg-slate-900 border-2 border-amber-500/50 dark:border-amber-500/40 rounded-xl px-3.5 py-2.5 sm:py-3 text-slate-900 dark:text-white text-xl sm:text-2xl font-black font-mono focus:border-amber-500 focus:outline-none shadow-sm"
                placeholder="Summani kiriting..."
              />
            </div>

            <!-- Quick Cash Amount Shortcuts -->
            <div class="space-y-1.5">
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tezkor Kupyuralar:</div>
              <div class="flex flex-wrap gap-1.5">
                <button 
                  v-for="amt in quickAmounts" 
                  :key="amt"
                  @click="selectExactAmount(amt)"
                  class="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-[11px] font-bold hover:border-amber-500 hover:text-amber-500 transition shadow-sm active:scale-95 cursor-pointer"
                >
                  {{ amt.toLocaleString('uz-UZ') }}
                </button>
              </div>

              <!-- Incremental add shortcuts -->
              <div class="flex gap-1.5 pt-0.5">
                <button @click="addQuickCash(10000)" class="flex-1 py-1 sm:py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-lg text-[11px] font-black hover:bg-amber-500/20 active:scale-95 transition cursor-pointer">+10 ming</button>
                <button @click="addQuickCash(20000)" class="flex-1 py-1 sm:py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-lg text-[11px] font-black hover:bg-amber-500/20 active:scale-95 transition cursor-pointer">+20 ming</button>
                <button @click="addQuickCash(50000)" class="flex-1 py-1 sm:py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-lg text-[11px] font-black hover:bg-amber-500/20 active:scale-95 transition cursor-pointer">+50 ming</button>
                <button @click="addQuickCash(100000)" class="flex-1 py-1 sm:py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-lg text-[11px] font-black hover:bg-amber-500/20 active:scale-95 transition cursor-pointer">+100 ming</button>
              </div>
            </div>

            <!-- Dynamic Change Calculator Display (KASSA QAYTIM) -->
            <div 
              :class="[
                'p-3 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center text-center space-y-0.5',
                isSufficient 
                  ? 'bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-teal-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'bg-gradient-to-br from-rose-500/15 via-rose-500/10 to-red-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-sm animate-pulse'
              ]"
            >
              <div class="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider">
                <CheckCircle2 v-if="isSufficient" class="w-3.5 h-3.5 text-emerald-500" />
                <AlertTriangle v-else class="w-3.5 h-3.5 text-rose-500" />
                <span>{{ isSufficient ? "Mijozga Qaytim (Change):" : "Kassaga Yetmayotgan Pul:" }}</span>
              </div>
              
              <div class="text-2xl sm:text-3xl font-black font-mono tracking-tight">
                {{ isSufficient ? diffAmount.toLocaleString('uz-UZ') : Math.abs(diffAmount).toLocaleString('uz-UZ') }} <span class="text-sm font-bold">so'm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Modal Footer Action Button (Sticky / Shrink-0 / Never Hidden) ── -->
      <div class="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 shrink-0">
        <button 
          @click="handleComplete"
          :disabled="(selectedPaymentType === 'CASH' && !isSufficient) || isSubmitting"
          :class="[
            'w-full py-3.5 rounded-2xl font-black text-sm sm:text-base shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer',
            (selectedPaymentType === 'CASH' && !isSufficient) || isSubmitting
              ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none pointer-events-none opacity-80'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25 active:scale-[0.98]'
          ]"
        >
          <span v-if="isSubmitting" class="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
          <CheckCircle2 v-else class="w-5 h-5 sm:w-6 sm:h-6" />
          <span>{{ isSubmitting ? "To'lov qabul qilinmoqda..." : "To'lovni Tasdiqlash va Chek Chop Etish" }}</span>
        </button>
      </div>

    </div>
  </div>
</template>
