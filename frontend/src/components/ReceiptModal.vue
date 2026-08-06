<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import type { Order } from '../types/pos';
import { Printer, X, Flame, QrCode } from 'lucide-vue-next';
import { formatMoney } from '../utils/formatters';

const props = defineProps<{
  order: Order | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const receiptWidth = ref<'80mm' | '58mm'>('80mm');

function triggerPrint() {
  window.print();
}

// Auto-print logic
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    nextTick(() => {
      setTimeout(() => {
        triggerPrint();
      }, 300);
    });
  }
});

const formattedDate = computed(() => {
  if (!props.order) return '';
  return new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
});
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="isOpen && order" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <!-- Modal Box -->
      <div 
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-colors"
      >
        <!-- Header Controls (Hidden during print) -->
        <div class="print:hidden p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div class="flex items-center space-x-2">
            <Printer class="w-5 h-5 text-amber-500" />
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Kassa Cheki (Receipt)</h3>
          </div>

          <!-- Paper Width Toggle Buttons -->
          <div class="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button 
              @click="receiptWidth = '80mm'"
              :class="['px-2.5 py-1 rounded-lg transition-all', receiptWidth === '80mm' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400']"
            >
              80mm
            </button>
            <button 
              @click="receiptWidth = '58mm'"
              :class="['px-2.5 py-1 rounded-lg transition-all', receiptWidth === '58mm' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400']"
            >
              58mm
            </button>
          </div>

          <button 
            @click="emit('close')"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Printable Thermal Receipt Container -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-100 dark:bg-slate-950 print:p-0 print:bg-white print:overflow-visible">
          
          <div 
            id="printable-receipt"
            :class="[
              'bg-white text-slate-900 font-mono text-xs p-4 sm:p-5 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-lg print:border-none print:shadow-none print:p-2 print:m-0 print:w-full transition-all duration-300',
              receiptWidth === '80mm' ? 'w-full max-w-[340px]' : 'w-full max-w-[260px]'
            ]"
          >
            <!-- Receipt Header Logo & Details -->
            <div class="text-center pb-3 border-b border-dashed border-slate-400">
              <div class="flex items-center justify-center space-x-1.5 mb-1">
                <div class="w-6 h-6 rounded-lg bg-slate-900 text-amber-500 flex items-center justify-center font-bold">
                  <Flame class="w-4 h-4 fill-amber-500" />
                </div>
                <span class="font-black text-sm tracking-wider uppercase">DOSTON BURGER</span>
              </div>
              <p class="text-[10px] font-sans font-medium text-slate-600">Fast Food & Family Restaurant</p>
              <p class="text-[10px] text-slate-600 font-mono mt-0.5">+998 (94) 322 10 25 | @doston_burger</p>
            </div>

            <!-- Meta Order Info -->
            <div class="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
              <div class="flex justify-between">
                <span class="text-slate-600">Buyurtma #:</span>
                <span class="font-bold text-slate-900">#{{ order.orderNumber }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Sana & Vaqt:</span>
                <span>{{ formattedDate }} {{ order.createdAt }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Kassir:</span>
                <span class="font-semibold">{{ order.cashierName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">To'lov Turi:</span>
                <span class="font-bold uppercase text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                  {{ order.paymentType }}
                </span>
              </div>
            </div>

            <!-- Items Table Header -->
            <div class="py-2 border-b border-slate-400 font-bold text-[11px] flex justify-between">
              <span>Nomi / Miqdor</span>
              <span>Summa</span>
            </div>

            <!-- Itemized Table List -->
            <div class="py-2 border-b border-dashed border-slate-400 space-y-2 text-[11px]">
              <div v-for="item in order.items" :key="item.id" class="space-y-0.5">
                <div class="flex justify-between font-semibold">
                  <span class="truncate max-w-[170px]">{{ item.product.name }}</span>
                  <span>{{ formatMoney(item.totalPrice) }}</span>
                </div>
                <div class="flex justify-between text-[10px] text-slate-600">
                  <span>{{ item.quantity }} x {{ formatMoney(item.unitPrice) }} so'm</span>
                </div>
                <!-- Modifiers line if any -->
                <div v-if="item.selectedModifiers && item.selectedModifiers.length" class="text-[9px] text-slate-500 italic pl-2">
                  + {{ item.selectedModifiers.map(m => m.name).join(', ') }}
                </div>
              </div>
            </div>

            <!-- Totals & Change -->
            <div class="py-2.5 border-b border-slate-900 space-y-1 text-[11px]">
              <div class="flex justify-between font-bold text-sm pt-1">
                <span>JAMI SUMMA:</span>
                <span class="text-slate-900 font-extrabold">{{ formatMoney(order.totalAmount) }} SO'M</span>
              </div>
              <div class="flex justify-between text-slate-600 pt-1">
                <span>Berilgan Naqd/Summa:</span>
                <span>{{ formatMoney(order.paidAmount ?? order.totalAmount) }} so'm</span>
              </div>
              <div class="flex justify-between font-bold text-emerald-700">
                <span>QAYTIM (CHANGE):</span>
                <span>{{ formatMoney(order.changeAmount ?? 0) }} so'm</span>
              </div>
            </div>

            <!-- Footer QR Code & Thank You Message -->
            <div class="text-center pt-3 space-y-2">
              <div class="flex justify-center">
                <div class="w-16 h-16 border border-slate-400 rounded-lg p-1 flex items-center justify-center bg-slate-50">
                  <QrCode class="w-12 h-12 text-slate-800" />
                </div>
              </div>
              <p class="text-[10px] font-bold uppercase text-slate-800 tracking-wider">XARIDINGIZ UCHUN RAHMAT!</p>
              <p class="text-[9px] text-slate-500">Yana kelib turing! | @doston_burger</p>
              <div class="text-[8px] text-slate-400 font-mono tracking-widest pt-1">***********************************</div>
            </div>

          </div>

        </div>

        <!-- Footer Action Buttons (Hidden during print) -->
        <div class="print:hidden p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex space-x-3">
          <button 
            @click="triggerPrint"
            class="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all text-xs"
          >
            <Printer class="w-4 h-4" />
            <span>Chop Etish (Print Chek)</span>
          </button>
          <button 
            @click="emit('close')"
            class="px-5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-2xl active:scale-95 transition-all text-xs"
          >
            Yopish
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #printable-receipt, #printable-receipt * {
    visibility: visible;
  }
  #printable-receipt {
    position: absolute;
    left: 0;
    top: 0;
    width: 100% !important;
    max-width: 100% !important;
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    padding: 10px !important;
  }
}
</style>
