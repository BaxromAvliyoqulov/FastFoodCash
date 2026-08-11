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

const receiptWidth = ref<'80mm' | '58mm'>('80mm');
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
    now.value = new Date();
    startTimer();
    nextTick(() => {
      setTimeout(() => {
        triggerPrint();
      }, 300);
    });
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
            <ChefHat class="w-5 h-5 text-amber-500" />
            <h3 class="font-black text-sm text-slate-900 dark:text-white">Oshxona Cheki (Kitchen Ticket)</h3>
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

        <!-- Visual KDS Real-Time Prep Timer Banner -->
        <div 
          :class="[
            'print:hidden px-4 py-2.5 flex items-center justify-between text-xs font-black transition-all border-b',
            isDelayed 
              ? 'bg-rose-500 text-white animate-pulse border-rose-600 shadow-md shadow-rose-500/30' 
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
          ]"
        >
          <div class="flex items-center space-x-2">
            <Clock class="w-4 h-4 animate-spin shrink-0" />
            <span>{{ isDelayed ? "🚨 TAYYORLASH VAQTI 10M OSHDI! KITCHEN DELAY" : "⏱️ Oshxona Tayyorlash Vaqti:" }}</span>
          </div>
          <span class="font-mono text-sm tracking-wider px-2 py-0.5 bg-black/10 rounded-lg">{{ formattedTimer }} min</span>
        </div>

        <!-- Printable Thermal Receipt Container -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-100 dark:bg-slate-950 print:p-0 print:bg-white print:overflow-visible">
          
          <div 
            id="kitchen-receipt"
            :class="[
              'bg-white text-slate-900 font-mono p-4 sm:p-5 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-lg print:border-none print:shadow-none print:p-2 print:m-0 print:w-full transition-all duration-300',
              receiptWidth === '80mm' ? 'w-full max-w-[340px]' : 'w-full max-w-[260px]'
            ]"
          >
            <!-- Receipt Header Logo & Details -->
            <div class="text-center pb-3 border-b-2 border-slate-800 mb-2">
              <h1 class="font-black text-2xl uppercase tracking-wider">OSHXONA</h1>
              <h2 class="font-black text-3xl mt-1" v-if="tableNumber">{{ tableNumber }}-STOL</h2>
              <h2 class="font-black text-2xl mt-1" v-else>SABOY (YONIGA)</h2>
            </div>

            <!-- Meta Order Info -->
            <div class="py-2 border-b-2 border-slate-800 mb-3 space-y-1 text-sm font-bold">
              <div class="flex justify-between">
                <span>Sana:</span>
                <span>{{ now.toLocaleDateString('uz-UZ') }}</span>
              </div>
              <div class="flex justify-between">
                <span>Vaqt:</span>
                <span>{{ now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) }}</span>
              </div>
              <div class="flex justify-between" v-if="cashierName">
                <span>Kassir:</span>
                <span>{{ cashierName }}</span>
              </div>
            </div>

            <!-- Items Table Header -->
            <div class="py-1 border-b-2 border-slate-800 font-black text-sm flex justify-between">
              <span>TAOM NOMI</span>
              <span>MIQDOR</span>
            </div>

            <!-- Itemized Table List -->
            <div class="py-2 border-b-2 border-slate-800 space-y-3">
              <div v-for="item in items" :key="item.id" class="space-y-1">
                <div class="flex justify-between font-black text-lg leading-tight">
                  <span class="pr-2">{{ item.product.name }}</span>
                  <span>x{{ item.quantity }}</span>
                </div>
                <!-- Modifiers line if any -->
                <div v-if="item.selectedModifiers.length" class="text-sm font-bold pl-4">
                  <div v-for="m in item.selectedModifiers" :key="m.modifierId">
                    + {{ m.name }}
                  </div>
                </div>
              </div>
            </div>

            <div class="text-center pt-8 pb-4">
              <div class="text-sm font-bold tracking-widest">*** TAYYORLASH UCHUN ***</div>
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
            <span>Chop Etish (Print)</span>
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
  #kitchen-receipt, #kitchen-receipt * {
    visibility: visible;
  }
  #kitchen-receipt {
    position: absolute;
    left: 0;
    top: 0;
    width: 100% !important;
    max-width: 100% !important;
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    padding: 10px !important;
    color: black !important;
  }
}
</style>
