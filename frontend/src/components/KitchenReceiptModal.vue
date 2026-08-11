<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick, computed } from 'vue';
import type { CartItem } from '../types/pos';
import { Printer, X, ChefHat, Clock } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  tableNumber: number | null;
  items: CartItem[];
  cashierName?: string;
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
});

onUnmounted(() => {
  stopTimer();
});
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <!-- Modal Box -->
      <div 
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-colors"
      >
        <!-- Header Controls (Hidden during print) -->
        <div class="print:hidden p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div class="flex items-center space-x-2">
            <ChefHat class="w-5 h-5 text-emerald-500" />
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Oshxona Cheki (Kitchen Ticket)</h3>
          </div>

          <!-- Paper Width Toggle Buttons -->
          <div class="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button 
              @click="setWidth('80mm')"
              :class="['px-2.5 py-1 rounded-lg transition-all cursor-pointer', receiptWidth === '80mm' ? 'bg-emerald-500 text-white shadow-sm font-black' : 'text-slate-600 dark:text-slate-400']"
            >
              80mm
            </button>
            <button 
              @click="setWidth('58mm')"
              :class="['px-2.5 py-1 rounded-lg transition-all cursor-pointer', receiptWidth === '58mm' ? 'bg-emerald-500 text-white shadow-sm font-black' : 'text-slate-600 dark:text-slate-400']"
            >
              58mm
            </button>
          </div>

          <button 
            @click="emit('close')"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Printable Kitchen Receipt Container -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-100 dark:bg-slate-950 print:p-0 print:bg-white print:overflow-visible">
          
          <div 
            id="printable-kitchen-receipt"
            :class="[
              'bg-white text-slate-900 font-mono rounded-2xl border-2 border-slate-900 shadow-xl print:border-none print:shadow-none print:m-0 print:w-full transition-all duration-300',
              receiptWidth === '80mm' ? 'w-full max-w-[340px] text-xs p-5' : 'w-full max-w-[240px] text-[10px] p-3 leading-tight'
            ]"
          >
            <!-- Kitchen Header Header Logo & Order Type -->
            <div class="text-center pb-3 border-b-2 border-slate-900 space-y-1">
              <div class="inline-flex items-center justify-center space-x-1.5 bg-slate-900 text-white px-3 py-1 rounded-lg font-black tracking-widest text-sm uppercase">
                <ChefHat class="w-4 h-4 text-emerald-400" />
                <span>OSHXONA KVITANSIYASI</span>
              </div>
              
              <!-- Table or Takeaway Banner -->
              <div class="pt-1">
                <span v-if="tableNumber" class="text-base font-black uppercase text-slate-900 bg-amber-200 px-2 py-0.5 rounded">
                  📌 STOL #{{ tableNumber }}
                </span>
                <span v-else class="text-base font-black uppercase text-white bg-rose-600 px-2 py-0.5 rounded">
                  🛍️ O'ZI BILAN (TAKEAWAY)
                </span>
              </div>
            </div>

            <!-- Timer & Meta info -->
            <div class="py-2 border-b border-dashed border-slate-400 space-y-1" :class="receiptWidth === '58mm' ? 'text-[9px]' : 'text-[11px]'">
              <div class="flex justify-between items-center font-bold">
                <span class="text-slate-600 flex items-center gap-1">
                  <Clock class="w-3 h-3 text-slate-500" /> Vaqt:
                </span>
                <span>{{ now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) }}</span>
              </div>
              <div class="flex justify-between items-center font-bold">
                <span class="text-slate-600">Buyurtma beruvchi:</span>
                <span>{{ cashierName || 'Kassir' }}</span>
              </div>
              <div class="flex justify-between items-center font-mono text-[10px] text-slate-500 pt-0.5">
                <span>Tayyorlash Taymeri:</span>
                <span :class="['font-black px-1.5 py-0.5 rounded', isDelayed ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-800']">
                  ⏱️ {{ formattedTimer }}
                </span>
              </div>
            </div>

            <!-- Food Items List for Chef -->
            <div class="py-3 border-b-2 border-slate-900 space-y-3">
              <div class="font-black text-slate-900 border-b border-slate-300 pb-1 flex justify-between" :class="receiptWidth === '58mm' ? 'text-[10px]' : 'text-xs'">
                <span>TAOM / TARKIBI</span>
                <span>SONI</span>
              </div>

              <div v-for="item in items" :key="item.id" class="space-y-1 pb-2 border-b border-dashed border-slate-200 last:border-0">
                <div class="flex justify-between font-black text-slate-900" :class="receiptWidth === '58mm' ? 'text-xs' : 'text-sm'">
                  <span>{{ item.product.name }}</span>
                  <span class="text-base font-extrabold text-slate-900 underline">x{{ item.quantity }}</span>
                </div>

                <!-- Modifiers / Note for Chef -->
                <div v-if="item.selectedModifiers && item.selectedModifiers.length" class="pl-2 space-y-0.5 text-slate-700 font-bold" :class="receiptWidth === '58mm' ? 'text-[9px]' : 'text-[10px]'">
                  <div v-for="mod in item.selectedModifiers" :key="mod.modifierId" class="flex items-center gap-1 text-emerald-700">
                    <span>⚡ + {{ mod.name }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Chef Footer -->
            <div class="text-center pt-3 text-[10px] font-black uppercase text-slate-800">
              ⚡ TEZKOR TAYYORLANSIN! ⚡
            </div>

          </div>

        </div>

        <!-- Footer Action Buttons (Hidden during print) -->
        <div class="print:hidden p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex space-x-3">
          <button 
            @click="triggerPrint"
            class="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all text-xs cursor-pointer"
          >
            <Printer class="w-4 h-4" />
            <span>Oshxonaga Chop etish</span>
          </button>
          <button 
            @click="emit('close')"
            class="px-5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all text-xs cursor-pointer"
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
