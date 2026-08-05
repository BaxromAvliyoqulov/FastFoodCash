<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePosStore } from '../stores/posStore';
import { 
  ClipboardList, 
  Search,
  CalendarDays,
  Banknote,
  QrCode,
  CreditCard,
  Utensils
} from 'lucide-vue-next';

const posStore = usePosStore();
const searchQuery = ref('');

const filteredOrders = computed(() => {
  let result = posStore.orderHistory;
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(o => 
      o.id.toLowerCase().includes(q) || 
      o.orderNumber.toString().includes(q) ||
      o.cashierName.toLowerCase().includes(q)
    );
  }
  
  // Eng oxirgi buyurtmalar birinchi chiqishi uchun
  return [...result].reverse();
});

const totalSalesAmount = computed(() => 
  posStore.orderHistory.reduce((sum, o) => sum + o.totalAmount, 0)
);

const totalOrders = computed(() => posStore.orderHistory.length);

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
}

function getPaymentIcon(type: string) {
  switch(type) {
    case 'CASH': return Banknote;
    case 'CLICK_PAYME': return QrCode;
    case 'CARD': return CreditCard;
    default: return Banknote;
  }
}

function getPaymentColor(type: string) {
  switch(type) {
    case 'CASH': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    case 'CLICK_PAYME': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    case 'CARD': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    default: return 'text-slate-500 bg-slate-500/10 border-slate-500/30';
  }
}
</script>

<template>
  <div class="h-[calc(100vh-65px)] overflow-y-auto bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 space-y-6 sm:space-y-8 transition-colors duration-300">
    
    <!-- Header Title -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">Savdo Tarixi (History)</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">Barcha yopilgan cheklar va kunlik buyurtmalar ro'yxati</p>
      </div>
    </div>

    <!-- Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm dark:shadow-xl relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition"></div>
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold relative z-10">
          <span>Jami Buyurtmalar</span>
          <ClipboardList class="w-4 h-4 text-indigo-500" />
        </div>
        <div class="text-xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono relative z-10">
          {{ totalOrders }} ta
        </div>
        <div class="text-[11px] text-slate-500 relative z-10">Tizimdagi barcha muvaffaqiyatli xaridlar</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm dark:shadow-xl relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition"></div>
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold relative z-10">
          <span>Jami Tushum (Savdo)</span>
          <Banknote class="w-4 h-4 text-emerald-500" />
        </div>
        <div class="text-xl sm:text-3xl font-black text-emerald-500 dark:text-emerald-400 font-mono relative z-10">
          {{ totalSalesAmount.toLocaleString('uz-UZ') }} so'm
        </div>
        <div class="text-[11px] text-slate-500 relative z-10">Jami sotilgan mahsulotlar summasi</div>
      </div>

    </div>

    <!-- History Table -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 class="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarDays class="w-5 h-5 text-indigo-500" />
          <span>Barcha Buyurtmalar Ro'yxati</span>
        </h3>
        <div class="relative w-full sm:w-64">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Buyurtma yoki kassa qidirish..." 
            class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none transition-all dark:text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      <div class="overflow-x-auto max-w-full pb-10">
        <table class="w-full text-left text-xs border-separate border-spacing-y-3 min-w-[800px]">
          <thead>
            <tr class="text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold text-[10px] px-4">
              <th class="pb-2 px-4 font-semibold">Buyurtma No / Vaqt</th>
              <th class="pb-2 px-4 font-semibold">Kassir</th>
              <th class="pb-2 px-4 font-semibold">Tarkibi</th>
              <th class="pb-2 px-4 font-semibold text-center">To'lov Turi</th>
              <th class="pb-2 px-4 font-semibold text-right">Summa</th>
            </tr>
          </thead>
          <tbody class="font-mono text-slate-700 dark:text-slate-300">
            <tr v-for="order in filteredOrders" :key="order.id" 
                class="bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-md group rounded-2xl">
              
              <!-- Buyurtma Info -->
              <td class="py-4 px-4 font-bold text-slate-900 dark:text-white font-sans text-sm rounded-l-2xl border-y border-l border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700/50">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                    <span class="text-xs font-black">#{{ order.orderNumber }}</span>
                  </div>
                  <div>
                    <div class="text-[10px] text-slate-500 dark:text-slate-400 font-normal mb-0.5">ID: {{ order.id.split('-')[0] }}...</div>
                    <div class="text-xs font-semibold">{{ formatTime(order.createdAt) }}</div>
                  </div>
                </div>
              </td>
              
              <!-- Kassir -->
              <td class="py-4 px-4 text-slate-500 dark:text-slate-400 font-semibold border-y border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700/50 font-sans">
                {{ order.cashierName }}
              </td>
              
              <!-- Tarkibi -->
              <td class="py-4 px-4 border-y border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700/50">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span v-for="item in order.items" :key="item.id" class="bg-slate-200/50 dark:bg-slate-700/50 px-2 py-1 rounded-md text-[10px] font-sans text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Utensils class="w-2.5 h-2.5" />
                    {{ item.product.name }} (x{{ item.quantity }})
                  </span>
                </div>
              </td>
              
              <!-- To'lov Turi -->
              <td class="py-4 px-4 text-center border-y border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700/50">
                <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border shadow-sm" :class="getPaymentColor(order.paymentType)">
                  <component :is="getPaymentIcon(order.paymentType)" class="w-3.5 h-3.5" />
                  <span>{{ order.paymentType === 'CASH' ? 'Naqd Pul' : order.paymentType === 'CLICK_PAYME' ? 'Click' : order.paymentType }}</span>
                </div>
              </td>

              <!-- Summa -->
              <td class="py-4 px-4 text-right rounded-r-2xl border-y border-r border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700/50">
                <span class="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {{ order.totalAmount.toLocaleString('uz-UZ') }} <span class="text-[10px] font-bold text-slate-500">so'm</span>
                </span>
              </td>
            </tr>
            
            <tr v-if="filteredOrders.length === 0">
              <td colspan="5" class="py-10 text-center text-slate-500 dark:text-slate-400 font-sans">
                Buyurtmalar topilmadi
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
