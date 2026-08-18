<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePosStore } from '../../stores/posStore';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import { playPaySound, playAddSound } from '../../utils/posSounds';
import type { Order } from '../../types/pos';
import {
  X,
  Search,
  ShoppingBag,
  Clock,
  Printer,
  ChefHat,
  CheckCircle
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'print-receipt', order: Order): void;
  (e: 'print-kitchen', order: Order): void;
}>();

const posStore = usePosStore();
const authStore = useAuthStore();
const toast = useToastStore();

const searchQuery = ref('');
const activeFilter = ref<'ALL' | 'SABOY' | 'ZAL' | 'COOKING' | 'READY'>('ALL');

// Bugungi buyurtmalar (Kassir faqat o'zinikini ko'radi, Admin barchasini)
const allOrders = computed(() => {
  const history = posStore.orderHistory || [];
  if (authStore.isAdmin) return history;
  
  const myName = (authStore.user?.fullName || '').toLowerCase().trim();
  const myId = authStore.user?.id;

  return history.filter(o => {
    const cName = (o.cashierName || '').toLowerCase().trim();
    if (myId && (o as any).cashierId === myId) return true;
    if (myName && (cName.includes(myName) || myName.includes(cName))) return true;
    return false;
  });
});

const filteredOrders = computed(() => {
  let list = allOrders.value;

  if (activeFilter.value === 'SABOY') {
    list = list.filter(o => o.orderType === 'TAKEAWAY');
  } else if (activeFilter.value === 'ZAL') {
    list = list.filter(o => o.orderType === 'DINE_IN');
  } else if (activeFilter.value === 'COOKING') {
    list = list.filter(o => o.status === 'COOKING');
  } else if (activeFilter.value === 'READY') {
    list = list.filter(o => o.status === 'READY');
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(o => {
      const qNum = String(o.dailyQueueNumber || o.orderNumber);
      const cashier = (o.cashierName || '').toLowerCase();
      const hasItem = o.items?.some(i => i.product?.name?.toLowerCase().includes(q));
      return qNum.includes(q) || cashier.includes(q) || hasItem;
    });
  }

  return list;
});

// Faol Saboylar soni
const activeSaboyCount = computed(() => {
  return allOrders.value.filter(o => o.orderType === 'TAKEAWAY' && (o.status === 'COOKING' || o.status === 'READY')).length;
});

function handleStatusChange(order: Order, newStatus: 'COOKING' | 'READY' | 'COMPLETED') {
  posStore.updateOrderStatus(order.id, newStatus);
  if (newStatus === 'READY') {
    playAddSound();
    toast.success(`Buyurtma #${order.dailyQueueNumber || order.orderNumber} TAYYOR! Mijozni chaqiring 🛎️`);
  } else if (newStatus === 'COMPLETED') {
    playPaySound();
    toast.success(`Buyurtma #${order.dailyQueueNumber || order.orderNumber} mijozga topshirildi! ✅`);
  }
}

function formatTime(createdAt?: string): string {
  if (!createdAt) return '';
  try {
    const d = new Date(createdAt);
    if (isNaN(d.getTime())) return createdAt;
    return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return createdAt;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 select-none flex justify-end"
      @click.self="emit('close')"
    >
      <!-- Slide-over Drawer Panel -->
      <div
        class="w-full max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col transition-all duration-300 animate-in slide-in-from-right"
      >
        <!-- ── HEADER ────────────────────────────────────────────────────────── -->
        <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
              <ShoppingBag class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-black text-base text-slate-900 dark:text-white leading-tight">Saboy & Buyurtmalar Navbati</h3>
                <span
                  v-if="activeSaboyCount > 0"
                  class="bg-amber-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-sm shadow-amber-500/30"
                >
                  {{ activeSaboyCount }} faol saboy
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Barcha buyurtmalar, oshxona holati va qayta chek chiqarish</p>
            </div>
          </div>

          <button
            @click="emit('close')"
            class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- ── FILTERS & SEARCH ─────────────────────────────────────────────── -->
        <div class="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shrink-0">
          <!-- Search Bar -->
          <div class="relative">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Navbat raqami (#1, #2), taom yoki kassir qidirish..."
              class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
            />
          </div>

          <!-- Filter Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-thin py-0.5">
            <button
              @click="activeFilter = 'ALL'"
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5',
                activeFilter === 'ALL'
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              ]"
            >
              <span>Barchasi</span>
              <span class="text-[10px] opacity-80">({{ allOrders.length }})</span>
            </button>

            <button
              @click="activeFilter = 'SABOY'"
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5',
                activeFilter === 'SABOY'
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              ]"
            >
              <span>🛍️ Saboy</span>
              <span class="text-[10px] opacity-80">({{ allOrders.filter(o => o.orderType === 'TAKEAWAY').length }})</span>
            </button>

            <button
              @click="activeFilter = 'ZAL'"
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5',
                activeFilter === 'ZAL'
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              ]"
            >
              <span>🍽️ Zal</span>
              <span class="text-[10px] opacity-80">({{ allOrders.filter(o => o.orderType === 'DINE_IN').length }})</span>
            </button>

            <button
              @click="activeFilter = 'COOKING'"
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5',
                activeFilter === 'COOKING'
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
              ]"
            >
              <span>🟡 Oshxonada</span>
              <span class="text-[10px] opacity-80">({{ allOrders.filter(o => o.status === 'COOKING').length }})</span>
            </button>

            <button
              @click="activeFilter = 'READY'"
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5',
                activeFilter === 'READY'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
              ]"
            >
              <span>🟢 Tayyor</span>
              <span class="text-[10px] opacity-80">({{ allOrders.filter(o => o.status === 'READY').length }})</span>
            </button>
          </div>
        </div>

        <!-- ── ORDERS LIST ──────────────────────────────────────────────────── -->
        <div class="flex-1 overflow-y-auto min-h-0 p-3 sm:p-4 space-y-3 scrollbar-thin bg-slate-50 dark:bg-slate-950/40">
          <div v-if="filteredOrders.length === 0" class="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
            <ShoppingBag class="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
            <p class="font-bold text-sm text-slate-600 dark:text-slate-400">Buyurtmalar topilmadi</p>
            <p class="text-xs text-slate-400 dark:text-slate-600 max-w-xs mt-1">Yangi buyurtmalar qabul qilinganda bu yerda real-vaqtda ko'rinadi</p>
          </div>

          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 rounded-2xl p-3.5 sm:p-4 shadow-sm transition-all duration-200 space-y-3 relative group"
          >
            <!-- Card Header -->
            <div class="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div class="flex items-center gap-2.5">
                <!-- Queue Badge -->
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white font-black text-sm flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                  #{{ order.dailyQueueNumber || order.orderNumber }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-black text-sm text-slate-900 dark:text-white">
                      {{ order.orderType === 'TAKEAWAY' ? '🛍️ Saboy' : (order.tableNumber ? `${order.tableNumber}-Stol` : '🍽️ Zal') }}
                    </span>
                    <span
                      :class="[
                        'px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border',
                        order.status === 'COOKING' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' :
                        order.status === 'READY' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 ring-1 ring-emerald-500/20' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      ]"
                    >
                      {{ order.status === 'COOKING' ? '🟡 Tayyorlanmoqda' : order.status === 'READY' ? '🟢 Tayyor' : '✅ Topshirildi' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span class="flex items-center gap-1 font-mono"><Clock class="w-3 h-3 text-slate-400" /> {{ formatTime(order.createdAt) }}</span>
                    <span>·</span>
                    <span>{{ order.cashierName || 'Kassir' }}</span>
                  </div>
                </div>
              </div>

              <!-- Price & Payment -->
              <div class="text-right shrink-0">
                <div class="font-black text-sm text-slate-900 dark:text-white font-mono">
                  {{ order.totalAmount?.toLocaleString('uz-UZ') }} <span class="text-[10px] text-amber-500">so'm</span>
                </div>
                <span class="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {{ order.paymentType === 'CASH' ? '💵 Naqd' : order.paymentType === 'CARD' ? '💳 Karta' : '📱 Click/Payme' }}
                </span>
              </div>
            </div>

            <!-- Items preview -->
            <div class="space-y-1 py-1">
              <div
                v-for="item in order.items"
                :key="item.id"
                class="flex items-center justify-between text-xs py-0.5"
              >
                <div class="flex items-center gap-1.5 min-w-0 pr-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span class="font-bold text-slate-800 dark:text-slate-200 truncate">{{ item.product?.name }}</span>
                  <span v-if="item.customNote" class="text-[10px] text-amber-600 italic">({{ item.customNote }})</span>
                </div>
                <span class="font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">{{ item.quantity }}x</span>
              </div>
            </div>

            <!-- Card Actions Row -->
            <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              <!-- Status toggle buttons -->
              <div class="flex items-center gap-1.5">
                <button
                  v-if="order.status === 'COOKING'"
                  @click="handleStatusChange(order, 'READY')"
                  class="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                  title="Oshxonada tayyor bo'ldi deb belgilash"
                >
                  <ChefHat class="w-3.5 h-3.5" />
                  <span>Tayyor! 🛎️</span>
                </button>

                <button
                  v-if="order.status === 'READY'"
                  @click="handleStatusChange(order, 'COMPLETED')"
                  class="px-2.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black transition-all active:scale-95 flex items-center gap-1 cursor-pointer shadow-sm"
                  title="Mijozga berildi"
                >
                  <CheckCircle class="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                  <span>Topshirildi ✅</span>
                </button>
              </div>

              <!-- Print Actions -->
              <div class="flex items-center gap-1.5 ml-auto">
                <button
                  @click="emit('print-kitchen', order)"
                  class="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                  title="Oshxona chekini qayta chiqarish"
                >
                  <ChefHat class="w-3.5 h-3.5 text-amber-500" />
                  <span class="hidden sm:inline">Oshxona cheki</span>
                </button>

                <button
                  @click="emit('print-receipt', order)"
                  class="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-black transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                  title="Kassa chekini qayta chiqarish"
                >
                  <Printer class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Kassa cheki</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
