<script setup lang="ts">
import { ref } from 'vue';
import { useShiftStore } from '../stores/shiftStore';
import { useToastStore } from '../stores/toastStore';
import { X, DollarSign, PenLine } from 'lucide-vue-next';
import { formatMoney } from '../utils/formatters';

defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const shiftStore = useShiftStore();
const toast = useToastStore();

const amount = ref<number | null>(null);
const reason = ref('');

function formatMoneyInput(e: Event): number | null {
  const input = (e.target as HTMLInputElement).value;
  const num = parseInt(input.replace(/\D/g, ''), 10);
  return isNaN(num) ? null : num;
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    closeModal();
  }
}

function closeModal() {
  amount.value = null;
  reason.value = '';
  emit('close');
}

function submitExpense() {
  if (!amount.value || amount.value <= 0) {
    toast.error("Summani kiriting");
    return;
  }
  if (!reason.value.trim()) {
    toast.error("Sababni kiriting");
    return;
  }

  shiftStore.addExpense(amount.value, reason.value.trim());
  toast.success("Rasxod qo'shildi!");
  closeModal();
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-2 sm:p-4 select-none" @click="handleOverlayClick">
    <div class="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Header (Sticky) -->
      <div class="px-5 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <DollarSign class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-black text-slate-900 dark:text-white text-base sm:text-lg leading-tight">Kassadan Rasxod</h3>
            <p class="text-[11px] text-slate-500 font-medium mt-0.5">Smena pulidan chegiriladi</p>
          </div>
        </div>
        <button @click="closeModal" class="w-8 h-8 rounded-full bg-slate-200/50 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Body (Scrollable) -->
      <div class="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-4">
        <div>
          <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Summa (so'm)
          </label>
          <div class="relative">
            <DollarSign class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              inputmode="numeric"
              :value="amount ? formatMoney(amount) : ''"
              @input="amount = formatMoneyInput($event)"
              placeholder="0"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-base sm:text-lg font-black text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-mono"
            />
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Rasxod Sababi
          </label>
          <div class="relative">
            <PenLine class="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <textarea 
              v-model="reason"
              placeholder="Masalan: Go'sht uchun avans"
              rows="2"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Footer (Sticky) -->
      <div class="px-5 py-3.5 sm:py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0">
        <button @click="closeModal" class="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
          Bekor qilish
        </button>
        <button @click="submitExpense" class="px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/25 transition-transform active:scale-95 cursor-pointer">
          Tasdiqlash
        </button>
      </div>
    </div>
  </div>
</template>
