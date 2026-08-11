<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePosStore } from '../stores/posStore';
import { useToastStore } from '../stores/toastStore';
import type { Order } from '../types/pos';
import { 
  ChefHat, 
  Clock, 
  UtensilsCrossed, 
  CheckCheck,
  RefreshCw
} from 'lucide-vue-next';

const posStore = usePosStore();
const toast = useToastStore();

const nowTimestamp = ref(Date.now());
let timerInterval: any = null;

onMounted(() => {
  posStore.fetchOrders();
  timerInterval = setInterval(() => {
    nowTimestamp.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

// Active Kitchen Orders (COOKING, READY, or COMPLETED)
const activeKitchenOrders = computed(() => {
  return posStore.orderHistory.filter(o => 
    o.status === 'COOKING' || o.status === 'READY' || o.status === 'COMPLETED'
  ).slice(0, 12); // Show top recent active orders
});

function getMinutesElapsed(createdAt: string | Date): number {
  const diffMs = nowTimestamp.value - new Date(createdAt).getTime();
  return Math.floor(diffMs / 60000);
}

function getSecondsElapsed(createdAt: string | Date): number {
  const diffMs = nowTimestamp.value - new Date(createdAt).getTime();
  return Math.floor((diffMs % 60000) / 1000);
}

function getTimerBadgeClass(minutes: number) {
  if (minutes < 5) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 animate-pulse';
  if (minutes < 10) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40';
  return 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/50 animate-bounce';
}

function markOrderReady(order: Order) {
  toast.success(`Buyurtma #${order.orderNumber} tayyor deb belgilandi! 🛎️`);
}

function refreshOrders() {
  posStore.fetchOrders();
  toast.info('Oshxona buyurtmalari yangilandi');
}
</script>

<template>
  <div class="h-full flex flex-col bg-slate-900 text-slate-100 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
    
    <!-- ── KDS Top Header Bar ──────────────────────────────────────── -->
    <header class="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0 shadow-lg">
      <div class="flex items-center space-x-3">
        <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <ChefHat class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-xl font-black tracking-wide text-white flex items-center gap-2">
            OSHXONA EKRANI (KDS)
            <span class="text-xs bg-red-500/20 text-red-400 border border-red-500/40 px-2.5 py-0.5 rounded-full font-bold">REAL-TIME</span>
          </h1>
          <p class="text-xs text-slate-400 font-medium">Fast-Food Oshpaz va Tayyorlash Ekosistemasi</p>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <div class="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2 text-slate-300">
          <UtensilsCrossed class="w-4 h-4 text-amber-500" />
          <span>Faol Buyurtmalar: {{ activeKitchenOrders.length }} ta</span>
        </div>

        <button 
          @click="refreshOrders"
          class="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 active:scale-95 transition cursor-pointer"
          title="Yangilash"
        >
          <RefreshCw class="w-5 h-5 text-amber-500" />
        </button>
      </div>
    </header>

    <!-- ── Active Orders Grid ──────────────────────────────────────── -->
    <main class="flex-1 p-6 overflow-y-auto scrollbar-thin">
      <div v-if="activeKitchenOrders.length === 0" class="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
        <ChefHat class="w-16 h-16 text-slate-700 animate-pulse" />
        <p class="text-lg font-bold">Hozircha navbatda buyurtmalar yo'q</p>
        <p class="text-xs text-slate-600">Yangi kassa buyurtmalari bu yerda darhol paydo bo'ladi</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <div 
          v-for="order in activeKitchenOrders" 
          :key="order.id"
          class="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300 relative group"
        >
          <!-- Order Top Header -->
          <div class="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <span class="text-2xl font-black text-white tracking-tight">#{{ order.orderNumber }}</span>
              <span class="ml-2 text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                {{ order.orderType === 'DINE_IN' ? 'Zalda' : (order.orderType === 'TAKEAWAY' ? "O'zi bilan" : 'Dostavka') }}
              </span>
            </div>

            <!-- Elapsed Timer Badge -->
            <div :class="['px-3 py-1 rounded-xl border text-xs font-mono font-bold flex items-center space-x-1.5', getTimerBadgeClass(getMinutesElapsed(order.createdAt))]">
              <Clock class="w-3.5 h-3.5 shrink-0" />
              <span>{{ getMinutesElapsed(order.createdAt) }}:{{ String(getSecondsElapsed(order.createdAt)).padStart(2, '0') }}</span>
            </div>
          </div>

          <!-- Order Items List -->
          <div class="py-4 space-y-3 flex-1 overflow-y-auto max-h-[220px] scrollbar-thin">
            <div 
              v-for="item in order.items" 
              :key="item.id"
              class="flex items-start justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80"
            >
              <div class="space-y-1">
                <span class="font-black text-sm text-slate-100 block leading-tight">{{ item.product.name }}</span>
                <span v-if="item.selectedModifiers && item.selectedModifiers.length" class="text-[10px] text-amber-400 font-medium block">
                  + {{ item.selectedModifiers.map(m => m.name).join(', ') }}
                </span>
              </div>
              <span class="text-lg font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20 shrink-0 ml-2">
                {{ item.quantity }}x
              </span>
            </div>
          </div>

          <!-- Order Bottom Actions -->
          <div class="pt-3 border-t border-slate-800 space-y-2">
            <button 
              @click="markOrderReady(order)"
              class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black py-3 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-xs cursor-pointer"
            >
              <CheckCheck class="w-4 h-4" />
              <span>TAYYOR BO'LDI!</span>
            </button>
          </div>

        </div>
      </div>
    </main>

  </div>
</template>
