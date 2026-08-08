<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePosStore } from '../stores/posStore';
import { useShiftStore } from '../stores/shiftStore';
import { useToastStore } from '../stores/toastStore';
import { useAuthStore } from '../stores/authStore';
import type { Product, Modifier, PaymentType, CartItem } from '../types/pos';
import ModifierModal from '../components/ModifierModal.vue';
import PaymentModal from '../components/PaymentModal.vue';
import ReceiptModal from '../components/ReceiptModal.vue';
import KitchenReceiptModal from '../components/KitchenReceiptModal.vue';
import PosHeader from '../components/pos/PosHeader.vue';
import PosCategoriesBar from '../components/pos/PosCategoriesBar.vue';
import PosProductGrid from '../components/pos/PosProductGrid.vue';
import TableMapView from '../components/TableMapView.vue';
import {
  Plus, Minus, Trash2, CreditCard, Utensils,
  ShoppingBag,
  Printer, MessageSquare,
  CheckCircle
} from 'lucide-vue-next';

const emit = defineEmits<{ (e: 'change-tab', tab: string): void }>();

const posStore = usePosStore();
const shiftStore = useShiftStore();
const toast = useToastStore();
const authStore = useAuthStore();

// ─── UI State ─────────────────────────────────────────────────────────────────
const activeModifierProduct = ref<Product | null>(null);
const showPaymentModal = ref(false);
const showReceiptModal = ref(false);
const showKitchenReceiptModal = ref(false);
const kitchenReceiptData = ref<{ tableNumber: number | null, items: CartItem[] }>({ tableNumber: null, items: [] });
const lastCompletedOrder = ref<any | null>(null);
const mobileCartOpen = ref(false);
const showTableProducts = ref(posStore.operationMode === 'ZAL' && !!posStore.activeTableId);

function resetModals() {
  showPaymentModal.value = false;
  showReceiptModal.value = false;
  showKitchenReceiptModal.value = false;
  lastCompletedOrder.value = null;
  activeModifierProduct.value = null;
}

function switchMode(mode: 'SABOY' | 'ZAL') {
  resetModals();
  posStore.setOperationMode(mode);
  showTableProducts.value = false;
  posStore.clearActiveTable();
}

function onTableSelected(tableId: string) {
  resetModals();
  posStore.setActiveTable(tableId);
  showTableProducts.value = true;
}

function backToTableMap() {
  showTableProducts.value = false;
  posStore.clearActiveTable();
}

const activeCart = computed(() =>
  posStore.operationMode === 'ZAL' ? (posStore.activeTable?.cart ?? []) : posStore.cart
);
const activeSubtotal = computed(() =>
  posStore.operationMode === 'ZAL' ? posStore.activeTableSubtotal : posStore.cartSubtotal
);

function handleProductClick(product: Product) {
  if (posStore.operationMode === 'ZAL') {
    if (!posStore.activeTableId) return;
    posStore.addToTableCart(posStore.activeTableId, product);
  } else {
    posStore.addToCart(product);
  }
}

function openModifiersModal(product: Product, event: Event) {
  event.stopPropagation();
  activeModifierProduct.value = product;
}

function confirmModifiers(modifiers: Modifier[]) {
  if (!activeModifierProduct.value) return;
  if (posStore.operationMode === 'ZAL' && posStore.activeTableId) {
    posStore.addToTableCart(posStore.activeTableId, activeModifierProduct.value, modifiers);
  } else {
    posStore.addToCart(activeModifierProduct.value, modifiers);
  }
  activeModifierProduct.value = null;
}

function updateQty(cartItemId: string, delta: number) {
  if (posStore.operationMode === 'ZAL' && posStore.activeTableId) {
    posStore.updateTableQuantity(posStore.activeTableId, cartItemId, delta);
  } else {
    posStore.updateQuantity(cartItemId, delta);
  }
}

function clearActiveCart() {
  if (posStore.operationMode === 'ZAL' && posStore.activeTableId) {
    posStore.clearTableCart(posStore.activeTableId);
  } else {
    posStore.clearCart();
  }
}

function removeItem(cartItemId: string) {
  if (posStore.operationMode === 'ZAL' && posStore.activeTableId) {
    posStore.removeTableCartItem(posStore.activeTableId, cartItemId);
  } else {
    posStore.removeFromCart(cartItemId);
  }
}

function saveTableOrder() {
  if (posStore.operationMode === 'ZAL' && posStore.activeTable) {
    const tableNum = posStore.activeTable.number;
    kitchenReceiptData.value = { tableNumber: tableNum, items: [...posStore.activeTable.cart] };
    toast.success(`${tableNum}-stol buyurtmasi oshxonaga yuborildi!`);
    showTableProducts.value = false;
    posStore.clearActiveTable();
    showKitchenReceiptModal.value = true;
  }
}

function handlePaymentSuccess(paymentType: PaymentType, paidAmount: number) {
  if (!shiftStore.currentShift) {
    alert('Smena ochilmagan! Avval smenani oching.');
    return;
  }
  let order;
  if (posStore.operationMode === 'ZAL' && posStore.activeTableId) {
    order = posStore.submitTableOrder(posStore.activeTableId, paymentType, paidAmount, shiftStore.currentShift.cashierName, shiftStore.currentShift.id);
  } else {
    order = posStore.submitOrder(paymentType, paidAmount, shiftStore.currentShift.cashierName, shiftStore.currentShift.id);
  }
  if (order) {
    lastCompletedOrder.value = order;
    showPaymentModal.value = false;
    showReceiptModal.value = true;
    if (posStore.operationMode === 'ZAL' && posStore.activeTableId) {
      posStore.clearActiveTable();
      showTableProducts.value = false;
    }
  }
}
</script>

<template>
  <div class="h-full flex flex-col lg:flex-row overflow-hidden bg-slate-100 dark:bg-slate-950 transition-colors duration-300">

    <!-- ═══════════════════════════ LEFT COLUMN ═══════════════════════════ -->
    <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800/80">

      <PosHeader
        :activeCartLength="activeCart.length"
        :activeSubtotal="activeSubtotal"
        :showTableProducts="showTableProducts"
        @toggle-mobile-cart="mobileCartOpen = !mobileCartOpen"
        @switch-mode="switchMode"
        @back-to-table-map="backToTableMap"
      />

      <!-- ZAL MODE: Stol xaritasi -->
      <template v-if="posStore.operationMode === 'ZAL' && !showTableProducts">
        <div class="flex-1 min-h-0 overflow-hidden">
          <TableMapView @table-selected="onTableSelected" />
        </div>
      </template>

      <!-- Product grid (SABOY yoki ZAL + stol tanlangan) -->
      <template v-else>
        <PosCategoriesBar 
          @change-tab="(t) => emit('change-tab', t)" 
          @back-to-table-map="backToTableMap" 
        />

        <!-- ZAL: stol info banner -->
        <div v-if="posStore.operationMode === 'ZAL' && posStore.activeTable" class="shrink-0 mx-3 mt-2.5 mb-0 px-4 py-2.5 rounded-2xl flex items-center justify-between border" :class="activeCart.length > 0 ? 'bg-amber-500/8 border-amber-500/25 dark:bg-amber-500/5' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span class="text-base">🏛️</span>
            <span>{{ posStore.activeTable.number }}-Stol</span>
            <span class="text-slate-400">·</span>
            <span class="text-amber-600 dark:text-amber-400">{{ activeCart.length }} ta taom</span>
          </div>
          <span class="text-xs text-slate-400 dark:text-slate-500">Savatga qo'shiladi</span>
        </div>

        <!-- Last order success banner -->
        <div v-if="lastCompletedOrder && !showReceiptModal" class="shrink-0 mx-3 mt-2.5 mb-0 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
          <div class="flex items-center gap-2">
            <CheckCircle class="w-4 h-4 text-emerald-500 shrink-0" />
            <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              #{{ lastCompletedOrder.orderNumber }} — {{ lastCompletedOrder.totalAmount?.toLocaleString('uz-UZ') }} so'm qabul qilindi
            </span>
          </div>
          <button @click="showReceiptModal = true" class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0 ml-2">
            <Printer class="w-3 h-3" />Chek
          </button>
        </div>

        <PosProductGrid 
          @product-click="handleProductClick" 
          @open-modifiers="openModifiersModal" 
        />
      </template>
    </div>

    <!-- ═══════════════════════════ RIGHT PANEL: Premium Cart ═══════════════════════════ -->
    <div
      :class="[
        'flex flex-col h-full transition-all duration-300 shrink-0 z-40',
        'w-full lg:w-[340px] xl:w-[380px]',
        mobileCartOpen ? 'fixed inset-x-0 bottom-0 top-16 z-50' : 'hidden lg:flex',
        'bg-white dark:bg-slate-900 shadow-[-20px_0_40px_rgba(0,0,0,0.05)] dark:shadow-[-20px_0_40px_rgba(0,0,0,0.3)] border-l border-slate-200 dark:border-slate-800/80'
      ]"
    >
      <!-- HEADER -->
      <div class="shrink-0 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-600/5 pointer-events-none"></div>
        <div class="absolute top-0 right-0 w-32 h-32 bg-amber-500/8 rounded-full blur-3xl pointer-events-none"></div>
        <div class="relative px-4 pt-4 pb-3">
          <!-- Cashier row -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <span class="text-white font-black text-sm">{{ (authStore.user?.fullName || 'K')[0].toUpperCase() }}</span>
              </div>
              <div>
                <p class="text-[10px] font-semibold text-slate-500 uppercase tracking-widest leading-none">Kassir</p>
                <p class="text-xs font-black text-slate-900 dark:text-white leading-tight mt-0.5">{{ authStore.user?.fullName || 'Kassa' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button v-if="activeCart.length > 0" @click="clearActiveCart" class="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-500 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 flex items-center justify-center transition-all active:scale-95">
                <Trash2 class="w-3.5 h-3.5" />
              </button>
              <button @click="mobileCartOpen = false" class="lg:hidden w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">✕</button>
            </div>
          </div>
          <!-- Title row -->
          <div class="flex items-center gap-2">
            <ShoppingBag class="w-4 h-4 text-amber-500" />
            <h3 class="font-black text-sm text-slate-900 dark:text-white leading-none">
              <template v-if="posStore.operationMode === 'ZAL' && posStore.activeTable">{{ posStore.activeTable.number }}-Stol Buyurtmasi</template>
              <template v-else>Savat</template>
            </h3>
            <span v-if="activeCart.length > 0" class="ml-auto bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm shadow-amber-500/20">{{ activeCart.length }} ta</span>
          </div>
          <div v-if="posStore.operationMode === 'ZAL' && posStore.activeTable?.openedAt" class="mt-2 inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-xl text-[11px] font-semibold">
            <span class="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></span>Stol faol — mijoz o'tiribdi
          </div>
        </div>
        <div class="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mx-4"></div>
      </div>

      <!-- ZAL no table -->
      <div v-if="posStore.operationMode === 'ZAL' && !posStore.activeTable" class="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div class="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4"><span class="text-4xl">🏛️</span></div>
        <p class="text-sm font-black text-slate-300 mb-1">Stol tanlanmagan</p>
        <p class="text-xs text-slate-600">Stol xaritasidan stol tanlang</p>
      </div>

      <!-- Empty cart -->
      <div v-else-if="activeCart.length === 0" class="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div class="relative mb-5">
          <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center shadow-2xl">
            <Utensils class="w-10 h-10 text-slate-600" />
          </div>
          <div class="absolute -top-2 -right-2 w-4 h-4 bg-amber-500/20 rounded-full animate-bounce"></div>
          <div class="absolute -bottom-1 -left-3 w-3 h-3 bg-orange-500/20 rounded-full animate-bounce" style="animation-delay:0.3s"></div>
        </div>
        <p class="text-base font-black text-slate-400 mb-1.5">Savat bo'sh</p>
        <p class="text-xs text-slate-600 leading-relaxed max-w-[180px]">
          <template v-if="posStore.operationMode === 'ZAL'">Taomlarni qo'shing va oshxonaga yuboring</template>
          <template v-else>Chap tomondagi taomlarni bosib savatchaga qo'shing</template>
        </p>
        <div class="flex flex-wrap gap-1.5 justify-center mt-4">
          <span class="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-xl text-[10px] text-slate-500">🍔 Burger</span>
          <span class="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-xl text-[10px] text-slate-500">🥪 Lavash</span>
          <span class="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-xl text-[10px] text-slate-500">🍕 Pizza</span>
        </div>
      </div>

      <!-- Cart items -->
      <div v-else class="flex-1 overflow-y-auto min-h-0 px-3 py-2 space-y-1.5 scrollbar-thin">
        <div v-for="item in activeCart" :key="item.id" class="bg-slate-50 hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:border-amber-500/30 hover:shadow-sm rounded-2xl p-3 transition-all duration-200">
          <div class="flex items-start gap-2.5">
            <div class="w-1 self-stretch rounded-full bg-gradient-to-b from-amber-500 to-orange-600 shrink-0 opacity-70"></div>
            <div class="flex-1 min-w-0">
              <h5 class="font-bold text-sm text-slate-900 dark:text-white truncate leading-tight">{{ item.product.name }}</h5>
              <div v-if="item.selectedModifiers.length > 0" class="flex flex-wrap gap-1 mt-1">
                <span v-for="mod in item.selectedModifiers" :key="mod.modifierId" class="text-[9px] font-bold bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 px-1.5 py-0.5 rounded-md">+{{ mod.name }}</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-1 font-mono font-medium">{{ item.unitPrice.toLocaleString('uz-UZ') }} × {{ item.quantity }}</p>
            </div>
            <div class="shrink-0 text-right">
              <p class="text-sm font-black text-amber-600 dark:text-amber-400 font-mono leading-tight">{{ item.totalPrice.toLocaleString('uz-UZ') }}</p>
              <p class="text-[9px] font-bold text-slate-400 mt-0.5">so'm</p>
            </div>
          </div>
          <div class="flex items-center justify-between mt-2.5 pl-3.5">
            <div class="flex items-center bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/50 shadow-sm">
              <button @click="updateQty(item.id, -1)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-rose-500/20 transition-all active:scale-90"><Minus class="w-3.5 h-3.5" /></button>
              <span class="text-sm font-black text-slate-900 dark:text-white font-mono w-8 text-center">{{ item.quantity }}</span>
              <button @click="updateQty(item.id, 1)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/20 transition-all active:scale-90"><Plus class="w-3.5 h-3.5" /></button>
            </div>
            <button @click="removeItem(item.id)" class="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-500/60 dark:text-rose-500/60 hover:text-rose-500 dark:hover:text-rose-400 border border-rose-100 dark:border-rose-500/10 transition-all active:scale-90 flex items-center justify-center">
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Waiter note -->
      <div v-if="posStore.operationMode === 'ZAL' && posStore.activeTable && activeCart.length > 0" class="shrink-0 px-3 pb-1 pt-2">
        <label class="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5"><MessageSquare class="w-3 h-3" /> Ofitsiant izohi</label>
        <textarea :value="posStore.activeTable?.waiterNote" @input="(e) => posStore.setWaiterNote(posStore.activeTableId!, (e.target as HTMLTextAreaElement).value)" placeholder="Allergy bor, alohida tarelka..." rows="2" class="w-full bg-slate-800 border border-slate-700 focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none resize-none transition-colors" />
      </div>

      <!-- FOOTER -->
      <div class="shrink-0 p-4 space-y-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent">
        <div v-if="activeCart.length > 0" class="flex justify-between text-xs text-slate-500">
          <span>{{ activeCart.length }} xil taom</span>
          <span class="font-mono">{{ activeCart.reduce((s, i) => s + i.quantity, 0) }} dona</span>
        </div>
        <!-- Total card -->
        <div class="relative overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 px-4 py-3">
          <div class="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 pointer-events-none"></div>
          <div class="relative flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Jami to'lov</span>
            <span class="text-2xl font-black text-slate-900 dark:text-white font-mono">{{ activeSubtotal.toLocaleString('uz-UZ') }} <span class="text-sm text-amber-500 dark:text-amber-400">so'm</span></span>
          </div>
        </div>
        <div v-if="posStore.operationMode === 'ZAL' && posStore.activeTable && posStore.activeTable.totalPaid > 0" class="flex items-center justify-between text-xs">
          <span class="text-slate-600">✅ Oldin to'langan</span>
          <span class="text-emerald-500 font-mono font-bold">{{ posStore.activeTable.totalPaid.toLocaleString('uz-UZ') }} so'm</span>
        </div>
        <!-- Buttons -->
        <template v-if="posStore.operationMode === 'ZAL'">
          <div class="grid grid-cols-2 gap-2">
            <button :disabled="activeCart.length === 0" @click="saveTableOrder" class="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/30 text-slate-300 hover:text-white py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 active:scale-95">
              <Utensils class="w-4 h-4" /> Oshxona
            </button>
            <button :disabled="activeCart.length === 0" @click="showPaymentModal = true" class="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white py-3.5 rounded-xl font-black text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40 active:scale-95">
              <CreditCard class="w-4 h-4" /> To'lov
            </button>
          </div>
        </template>
        <template v-else>
          <button :disabled="activeCart.length === 0" @click="showPaymentModal = true" class="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-base shadow-xl shadow-amber-500/25 transition-all active:scale-[.98] flex items-center justify-center gap-2.5">
            <CreditCard class="w-5 h-5" />
            <span v-if="activeCart.length > 0">To'lov — {{ activeSubtotal.toLocaleString('uz-UZ') }} so'm</span>
            <span v-else>Savat bo'sh</span>
          </button>
        </template>
      </div>
    </div>

    <!-- ═══ Modals ═══ -->
    <ModifierModal v-if="activeModifierProduct" :product="activeModifierProduct" @close="activeModifierProduct = null" @confirm="confirmModifiers" />
    <PaymentModal v-if="showPaymentModal" :total-amount="activeSubtotal" @close="showPaymentModal = false" @success="handlePaymentSuccess" />
    <ReceiptModal :order="lastCompletedOrder" :is-open="showReceiptModal" @close="showReceiptModal = false" />
    <KitchenReceiptModal :is-open="showKitchenReceiptModal" :table-number="kitchenReceiptData.tableNumber" :items="kitchenReceiptData.items" :cashier-name="authStore.user?.fullName" @close="showKitchenReceiptModal = false" />
  </div>
</template>
