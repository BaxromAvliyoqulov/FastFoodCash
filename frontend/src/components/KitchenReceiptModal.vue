<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick, computed } from 'vue';
import type { CartItem } from '../types/pos';
import { Printer, X, ChefHat, Clock, Sparkles, CheckCircle, Flame } from 'lucide-vue-next';
import { getCashierFloorInfo, getCurrentDailyQueueNumber } from '../utils/formatters';

const props = defineProps<{
  isOpen: boolean;
  tableNumber: number | null;
  tableName?: string;
  items: CartItem[];
  cashierName?: string;
  cashierFloor?: string;
  dailyQueueNumber?: number;
  isDoZakaz?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const receiptWidth = ref<'80mm' | '58mm'>(
  (localStorage.getItem('doston_pos_paper_width') as any) || '80mm'
);

function setWidth(w: '80mm' | '58mm') {
  receiptWidth.value = w;
  localStorage.setItem('doston_pos_paper_width', w);
}

const now = ref(new Date());
const elapsedSeconds = ref(0);
let timerInterval: any = null;

const formattedTimer = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60).toString().padStart(2, '0');
  const s = (elapsedSeconds.value % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
});

const isDelayed = computed(() => elapsedSeconds.value >= 600); // > 10 minutes warning

const floorInfo = computed(() => {
  if (props.cashierFloor) return props.cashierFloor;
  return getCashierFloorInfo(props.cashierName).badge;
});

const queueNumber = computed(() => {
  return props.dailyQueueNumber || getCurrentDailyQueueNumber();
});

// Do-Zakaz logic: Separate newly added items from previously sent items
const newItemsList = computed(() => {
  return (props.items || []).filter(i => 
    i.isNewAddition || 
    !i.isSentToKitchen || 
    (i.sentQuantity !== undefined && i.quantity > i.sentQuantity)
  );
});

const previousItemsList = computed(() => {
  return (props.items || []).filter(i => 
    !i.isNewAddition && 
    i.isSentToKitchen && 
    (i.sentQuantity === i.quantity)
  );
});

const isOrderDoZakaz = computed(() => {
  return props.isDoZakaz || (newItemsList.value.length > 0 && previousItemsList.value.length > 0);
});

function startTimer() {
  stopTimer();
  elapsedSeconds.value = 0;
  timerInterval = setInterval(() => {
    elapsedSeconds.value++;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function triggerPrint() {
  window.print();
}

// Auto-print and start timer when modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    receiptWidth.value = (localStorage.getItem('doston_pos_paper_width') as any) || '80mm';
    now.value = new Date();
    startTimer();
    const autoPrint = localStorage.getItem('doston_pos_auto_print') !== 'false';
    if (autoPrint) {
      nextTick(() => {
        setTimeout(() => {
          triggerPrint();
        }, 300);
      });
    }
  } else {
    stopTimer();
  }
}, { immediate: true });

onUnmounted(() => {
  stopTimer();
});
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 select-none bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <!-- Modal Box -->
      <div 
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[94vh] overflow-hidden transition-colors"
      >
        <!-- Header Controls (Hidden during print) -->
        <div class="print:hidden p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 shrink-0">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ChefHat class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-black text-sm text-slate-900 dark:text-white">Oshxona Cheki (Kitchen)</h3>
              <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">NAVBAT #{{ queueNumber }}</p>
            </div>
          </div>

          <!-- Paper Width Toggle Buttons -->
          <div class="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button 
              @click="setWidth('80mm')"
              :class="['px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs', receiptWidth === '80mm' ? 'bg-emerald-500 text-white shadow-sm font-black' : 'text-slate-600 dark:text-slate-400']"
            >
              80mm
            </button>
            <button 
              @click="setWidth('58mm')"
              :class="['px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs', receiptWidth === '58mm' ? 'bg-emerald-500 text-white shadow-sm font-black' : 'text-slate-600 dark:text-slate-400']"
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

        <!-- Printable Kitchen Receipt Container -->
        <div class="flex-1 overflow-y-auto min-h-0 p-3 sm:p-5 flex justify-center bg-slate-100 dark:bg-slate-950 print:p-0 print:bg-white print:overflow-visible">
          
          <div 
            id="printable-kitchen-receipt"
            :class="[
              'bg-white text-slate-900 font-mono rounded-2xl border-2 border-slate-900 shadow-xl print:border-none print:shadow-none print:m-0 print:w-full transition-all duration-300',
              receiptWidth === '80mm' ? 'w-full max-w-[340px] text-xs p-4 sm:p-5' : 'w-full max-w-[240px] text-[10px] p-3 leading-tight'
            ]"
          >
            <!-- Daily Queue Token Banner -->
            <div class="text-center pb-2.5 border-b-2 border-slate-900 space-y-1">
              <div class="bg-slate-900 text-white py-1.5 px-3 rounded-xl flex items-center justify-between">
                <span class="text-[11px] font-bold tracking-wider uppercase">KUNLIK NAVBAT:</span>
                <span class="text-lg sm:text-xl font-black text-amber-400">#{{ queueNumber }}</span>
              </div>

              <!-- DO-ZAKAZ ALARM BANNER (Agar do-zakaz bo'lsa) -->
              <div v-if="isOrderDoZakaz" class="bg-rose-600 text-white py-1 px-2 rounded-lg font-black text-xs sm:text-sm tracking-wide uppercase flex items-center justify-center gap-1 animate-pulse">
                <Flame class="w-4 h-4 fill-white" />
                <span>🔥 DO-ZAKAZ (QO'SHIMCHA TAOM)</span>
              </div>
              
              <!-- Table or Takeaway Banner -->
              <div class="pt-1 flex items-center justify-center gap-1.5">
                <span v-if="tableNumber" class="text-sm sm:text-base font-black uppercase text-slate-900 bg-amber-200 px-2.5 py-0.5 rounded border border-amber-400">
                  📌 {{ tableName || (tableNumber + '-STOL') }}
                </span>
                <span v-else class="text-sm sm:text-base font-black uppercase text-white bg-rose-600 px-2.5 py-0.5 rounded">
                  🛍️ O'ZI BILAN (TAKEAWAY)
                </span>
              </div>
            </div>

            <!-- Floor & Cashier info -->
            <div class="py-2 border-b border-dashed border-slate-400 space-y-1" :class="receiptWidth === '58mm' ? 'text-[9px]' : 'text-[11px]'">
              <div class="flex justify-between items-center font-bold">
                <span class="text-slate-600">Kassa & Qavat:</span>
                <span class="font-black text-slate-900">{{ floorInfo }}</span>
              </div>
              <div class="flex justify-between items-center font-bold">
                <span class="text-slate-600 flex items-center gap-1">
                  <Clock class="w-3 h-3 text-slate-500" /> Vaqt:
                </span>
                <span>{{ now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) }}</span>
              </div>
              <div class="flex justify-between items-center font-bold">
                <span class="text-slate-600">Kassir / Mas'ul:</span>
                <span>{{ cashierName || 'Kassir' }}</span>
              </div>
              <div class="flex justify-between items-center font-mono text-[10px] text-slate-500 pt-0.5">
                <span>Tayyorlash Taymeri:</span>
                <span :class="['font-black px-1.5 py-0.5 rounded', isDelayed ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-800']">
                  ⏱️ {{ formattedTimer }}
                </span>
              </div>
            </div>

            <!-- ══════════════════ FOOD ITEMS SECTION ══════════════════ -->
            <div class="py-2.5 border-b-2 border-slate-900 space-y-3">
              
              <!-- 1. YANGI QO'SHILGAN TAOMLAR (Agar Do-zakaz bo'lsa yoki asosiy buyurtma) -->
              <div class="space-y-2">
                <div v-if="isOrderDoZakaz" class="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-black text-[10px] uppercase flex items-center gap-1">
                  <Sparkles class="w-3 h-3 text-emerald-600" />
                  <span>YANGI TAYYORLANSIN (Qo'shilganlar):</span>
                </div>
                <div v-else class="font-black text-slate-900 border-b border-slate-300 pb-1 flex justify-between" :class="receiptWidth === '58mm' ? 'text-[10px]' : 'text-xs'">
                  <span>TAOM / TARKIBI</span>
                  <span>SONI</span>
                </div>

                <div 
                  v-for="item in (isOrderDoZakaz ? newItemsList : items)" 
                  :key="item.id" 
                  class="space-y-1 pb-1.5 border-b border-dashed border-slate-200 last:border-0"
                >
                  <div class="flex justify-between font-black text-slate-900" :class="receiptWidth === '58mm' ? 'text-xs' : 'text-sm'">
                    <span class="flex items-center gap-1">
                      <span v-if="isOrderDoZakaz" class="text-emerald-600 font-extrabold">✨</span>
                      <span>{{ item.product?.name || (item as any).productName || 'Taom' }}</span>
                    </span>
                    <span class="text-base font-black text-slate-900 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                      x{{ item.sentQuantity ? (item.quantity - item.sentQuantity) : item.quantity }}
                    </span>
                  </div>

                  <!-- Modifiers / Note for Chef -->
                  <div v-if="item.selectedModifiers && item.selectedModifiers.length" class="pl-2 space-y-0.5 text-slate-700 font-bold" :class="receiptWidth === '58mm' ? 'text-[9px]' : 'text-[10px]'">
                    <div v-for="mod in item.selectedModifiers" :key="mod.modifierId" class="flex items-center gap-1 text-emerald-700">
                      <span>⚡ + {{ mod.name }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2. OLDIN TAYYORLANGAN TAOMLAR (Eslatma: ikkinchi marta pishirilmasin!) -->
              <div v-if="isOrderDoZakaz && previousItemsList.length > 0" class="pt-2 border-t-2 border-dashed border-slate-400 space-y-1.5 opacity-75">
                <div class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[9px] uppercase flex items-center gap-1">
                  <CheckCircle class="w-3 h-3 text-slate-500" />
                  <span>OLDIN YUBORILGAN (Qayta pishirilmasin):</span>
                </div>

                <div 
                  v-for="item in previousItemsList" 
                  :key="'prev-' + item.id" 
                  class="flex justify-between text-slate-600 text-[10px] line-through font-mono"
                >
                  <span>✓ {{ item.product?.name || (item as any).productName }}</span>
                  <span>x{{ item.sentQuantity || item.quantity }}</span>
                </div>
              </div>

            </div>

            <!-- Chef Footer -->
            <div class="text-center pt-2.5 space-y-0.5">
              <p class="text-[11px] font-black uppercase text-slate-900 tracking-wider">
                ⚡ TEZKOR TAYYORLANSIN! ⚡
              </p>
              <p class="text-[9px] text-slate-500 font-mono">{{ floorInfo }}</p>
            </div>

          </div>

        </div>

        <!-- Footer Action Buttons (Hidden during print) -->
        <div class="print:hidden p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex space-x-3 shrink-0">
          <button 
            @click="triggerPrint"
            class="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all text-xs cursor-pointer"
          >
            <Printer class="w-4 h-4" />
            <span>Oshxonaga Chop etish</span>
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
  #printable-kitchen-receipt, #printable-kitchen-receipt * {
    visibility: visible;
  }
  #printable-kitchen-receipt {
    position: absolute;
    left: 0;
    top: 0;
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
  }
}
</style>
