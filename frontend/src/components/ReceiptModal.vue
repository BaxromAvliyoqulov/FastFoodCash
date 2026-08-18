<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import type { Order } from '../types/pos';
import { Printer, X, Flame, Sparkles } from 'lucide-vue-next';
import { formatMoney, getCashierFloorInfo, getCurrentDailyQueueNumber } from '../utils/formatters';

const props = defineProps<{
  order: Order | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const receiptWidth = ref<'80mm' | '58mm'>(
  (localStorage.getItem('doston_pos_paper_width') as any) || '80mm'
);
const receiptTitle = ref(localStorage.getItem('doston_pos_receipt_title') || 'DOSTON BURGER');
const receiptAddress = ref(localStorage.getItem('doston_pos_receipt_address') || 'Toshkent sh., Chilonzor 5-mavze');
const receiptPhone = ref(localStorage.getItem('doston_pos_receipt_phone') || '+998 90 123 45 67');
const receiptFooter = ref(localStorage.getItem('doston_pos_receipt_footer') || 'Wi-Fi: doston2026 | Yoqimli ishtaha! 🍔');

function setWidth(w: '80mm' | '58mm') {
  receiptWidth.value = w;
  localStorage.setItem('doston_pos_paper_width', w);
}

function triggerPrint() {
  window.print();
}

// Auto-print logic & dynamic parameter refresh
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    receiptWidth.value = (localStorage.getItem('doston_pos_paper_width') as any) || '80mm';
    receiptTitle.value = localStorage.getItem('doston_pos_receipt_title') || 'DOSTON BURGER';
    receiptAddress.value = localStorage.getItem('doston_pos_receipt_address') || 'Toshkent sh., Chilonzor 5-mavze';
    receiptPhone.value = localStorage.getItem('doston_pos_receipt_phone') || '+998 90 123 45 67';
    receiptFooter.value = localStorage.getItem('doston_pos_receipt_footer') || 'Wi-Fi: doston2026 | Yoqimli ishtaha! 🍔';

    const autoPrint = localStorage.getItem('doston_pos_auto_print') !== 'false';
    if (autoPrint) {
      nextTick(() => {
        setTimeout(() => {
          triggerPrint();
        }, 300);
      });
    }
  }
}, { immediate: true });

const formattedDate = computed(() => {
  if (!props.order) return '';
  return new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
});

const floorBadge = computed(() => {
  if (props.order?.cashierFloor) return props.order.cashierFloor;
  return getCashierFloorInfo(props.order?.cashierName).badge;
});

const queueNumber = computed(() => {
  return props.order?.dailyQueueNumber || getCurrentDailyQueueNumber();
});
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="isOpen && order" 
      class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 select-none bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <!-- Modal Box -->
      <div 
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[94vh] overflow-hidden transition-colors"
      >
        <!-- Header Controls (Hidden during print) -->
        <div class="print:hidden p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 shrink-0">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Printer class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-black text-sm text-slate-900 dark:text-white">Kassa Cheki (Receipt)</h3>
              <p class="text-[10px] text-amber-600 dark:text-amber-400 font-bold font-mono">NAVBAT #{{ queueNumber }}</p>
            </div>
          </div>

          <!-- Paper Width Toggle Buttons -->
          <div class="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button 
              @click="setWidth('80mm')"
              :class="['px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs', receiptWidth === '80mm' ? 'bg-amber-500 text-white shadow-sm font-black' : 'text-slate-600 dark:text-slate-400']"
            >
              80mm
            </button>
            <button 
              @click="setWidth('58mm')"
              :class="['px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs', receiptWidth === '58mm' ? 'bg-amber-500 text-white shadow-sm font-black' : 'text-slate-600 dark:text-slate-400']"
            >
              58mm
            </button>
          </div>

          <button 
            @click="emit('close')"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Printable Thermal Receipt Container -->
        <div class="flex-1 overflow-y-auto min-h-0 p-3 sm:p-5 flex justify-center bg-slate-100 dark:bg-slate-950 print:p-0 print:bg-white print:overflow-visible">
          
          <div 
            id="printable-receipt"
            :class="[
              'bg-white text-slate-900 font-mono rounded-2xl border border-slate-300 dark:border-slate-800 shadow-lg print:border-none print:shadow-none print:m-0 print:w-full transition-all duration-300',
              receiptWidth === '80mm' ? 'w-full max-w-[340px] text-xs p-4 sm:p-5' : 'w-full max-w-[240px] text-[10px] p-3 leading-tight'
            ]"
          >
            <!-- Receipt Header Logo & Details -->
            <div class="text-center pb-2.5 border-b border-dashed border-slate-400 space-y-1">
              <!-- Queue Token Box -->
              <div class="bg-slate-900 text-white py-1 px-3 rounded-xl flex items-center justify-between">
                <span class="text-[11px] font-bold tracking-wider uppercase">KUNLIK NAVBAT:</span>
                <span class="text-lg sm:text-xl font-black text-amber-400">#{{ queueNumber }}</span>
              </div>

              <!-- Do-Zakaz Badge if applicable -->
              <div v-if="order.isDoZakaz" class="bg-amber-100 text-amber-900 py-0.5 px-2 rounded-lg font-black text-[10px] tracking-wide uppercase flex items-center justify-center gap-1">
                <Sparkles class="w-3 h-3 text-amber-600" />
                <span>QO'SHIMCHA BUYURTMA (DO-ZAKAZ)</span>
              </div>

              <div class="flex items-center justify-center space-x-1.5 pt-1">
                <div class="w-6 h-6 rounded-lg bg-slate-900 text-amber-500 flex items-center justify-center font-bold">
                  <Flame class="w-4 h-4 fill-amber-500" />
                </div>
                <span class="font-black tracking-wider uppercase" :class="receiptWidth === '58mm' ? 'text-xs' : 'text-sm'">
                  {{ receiptTitle }}
                </span>
              </div>
              <p class="text-[10px] font-sans font-medium text-slate-600">{{ receiptAddress }}</p>
              <p class="text-[10px] text-slate-600 font-mono">Tel: {{ receiptPhone }}</p>
            </div>

            <!-- Meta Order Info -->
            <div class="py-2.5 border-b border-dashed border-slate-400 space-y-1" :class="receiptWidth === '58mm' ? 'text-[9px]' : 'text-[11px]'">
              <div class="flex justify-between font-black">
                <span class="text-slate-600">Kassa & Qavat:</span>
                <span class="text-slate-900">{{ floorBadge }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Buyurtma #:</span>
                <span class="font-bold text-slate-900">#{{ order.orderNumber }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Sana & Vaqt:</span>
                <span>{{ formattedDate }} {{ order.createdAt }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Kassir / Mas'ul:</span>
                <span class="font-semibold">{{ order.cashierName || 'Kassir' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">To'lov Turi:</span>
                <span class="font-bold uppercase text-slate-900 bg-slate-100 px-1 py-0.5 rounded border border-slate-300">
                  {{ order.paymentType || 'CASH' }}
                </span>
              </div>
            </div>

            <!-- Items Table Header -->
            <div class="py-2 border-b border-slate-400 font-bold flex justify-between" :class="receiptWidth === '58mm' ? 'text-[10px]' : 'text-[11px]'">
              <span>Nomi / Miqdor</span>
              <span>Summa</span>
            </div>

            <!-- Itemized Table List -->
            <div class="py-2 border-b border-dashed border-slate-400 space-y-2" :class="receiptWidth === '58mm' ? 'text-[9px]' : 'text-[11px]'">
              <div v-for="item in (order.items || [])" :key="item.id || item.product?.id" class="space-y-0.5">
                <div class="flex justify-between font-semibold">
                  <span class="truncate" :class="receiptWidth === '58mm' ? 'max-w-[120px]' : 'max-w-[170px]'">
                    <span v-if="item.isNewAddition" class="text-amber-600 font-bold mr-1">✨</span>
                    {{ item.product?.name || (item as any).productName || 'Taom' }}
                  </span>
                  <span>{{ formatMoney(item.totalPrice || 0) }}</span>
                </div>
                <div class="flex justify-between text-[10px] text-slate-600">
                  <span>{{ item.quantity }} x {{ formatMoney(item.unitPrice || item.product?.price || (item.totalPrice / (item.quantity || 1))) }} so'm</span>
                </div>
                <!-- Modifiers line if any -->
                <div v-if="item.selectedModifiers && item.selectedModifiers.length" class="text-[9px] text-slate-500 italic pl-2">
                  + {{ item.selectedModifiers.map(m => m.name).join(', ') }}
                </div>
              </div>
            </div>

            <!-- Totals & Change -->
            <div class="py-2.5 border-b border-slate-900 space-y-1" :class="receiptWidth === '58mm' ? 'text-[10px]' : 'text-[11px]'">
              <div v-if="order.serviceFee && order.serviceFee > 0" class="flex justify-between text-slate-600">
                <span>Taomlar jami:</span>
                <span>{{ formatMoney(order.subtotal || (order.totalAmount - order.serviceFee)) }} so'm</span>
              </div>
              <div v-if="order.serviceFee && order.serviceFee > 0" class="flex justify-between font-bold text-slate-800">
                <span>Xizmat haqi ({{ order.serviceFeePercent || 7 }}%):</span>
                <span>{{ formatMoney(order.serviceFee) }} so'm</span>
              </div>
              <div class="flex justify-between font-bold pt-1 border-t border-dotted border-slate-400" :class="receiptWidth === '58mm' ? 'text-xs' : 'text-sm'">
                <span>JAMI SUMMA:</span>
                <span class="text-slate-900 font-extrabold">{{ formatMoney(order.totalAmount || 0) }} SO'M</span>
              </div>
              <div class="flex justify-between text-slate-600 pt-1">
                <span>Berilgan Pul:</span>
                <span>{{ formatMoney(order.paidAmount ?? order.totalAmount ?? 0) }} so'm</span>
              </div>
              <div class="flex justify-between font-bold text-emerald-700">
                <span>QAYTIM (CHANGE):</span>
                <span>{{ formatMoney(order.changeAmount ?? 0) }} so'm</span>
              </div>
            </div>

            <!-- Footer Thank You Message -->
            <div class="text-center pt-3 space-y-1">
              <p class="font-black uppercase text-slate-900 tracking-wider" :class="receiptWidth === '58mm' ? 'text-[9px]' : 'text-[11px]'">
                XARIDINGIZ UCHUN RAHMAT!
              </p>
              <p class="text-[9px] text-slate-600 font-medium">{{ receiptFooter }}</p>
              <div class="text-[8px] text-slate-400 font-mono tracking-widest pt-1">***********************************</div>
            </div>

          </div>

        </div>

        <!-- Footer Action Buttons (Hidden during print) -->
        <div class="print:hidden p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex space-x-3 shrink-0">
          <button 
            @click="triggerPrint"
            class="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all text-xs cursor-pointer"
          >
            <Printer class="w-4 h-4" />
            <span>Chop etish (Printerni tanlash)</span>
          </button>
          <button 
            @click="emit('close')"
            class="px-5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all text-xs cursor-pointer"
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
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
  }
}
</style>
