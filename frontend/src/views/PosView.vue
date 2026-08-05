<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePosStore } from '../stores/posStore';
import { useShiftStore } from '../stores/shiftStore';
import type { Product, Modifier, PaymentType } from '../types/pos';
import ModifierModal from '../components/ModifierModal.vue';
import PaymentModal from '../components/PaymentModal.vue';
import ReceiptModal from '../components/ReceiptModal.vue';
import CategoryIcon from '../components/CategoryIcon.vue';
import TableMapView from '../components/TableMapView.vue';
import {
  Plus, Minus, Trash2, CreditCard, Utensils, Sparkles,
  Search, ShoppingBag, ChevronLeft, ChevronRight,
  Printer, FolderKanban, ArrowLeft, MessageSquare,
  CheckCircle, Clock
} from 'lucide-vue-next';

const emit = defineEmits<{ (e: 'change-tab', tab: string): void }>();

const posStore = usePosStore();
const shiftStore = useShiftStore();

// ─── UI State ─────────────────────────────────────────────────────────────────
const activeModifierProduct = ref<Product | null>(null);
const showPaymentModal = ref(false);
const showReceiptModal = ref(false);
const lastCompletedOrder = ref<any | null>(null);
const mobileCartOpen = ref(false);
const categoryScrollContainer = ref<HTMLDivElement | null>(null);
const showTableProducts = ref(false); // ZAL: product grid ochiq yoki stol xaritasi

// ─── Modularni tozalash (rejim almashganda) ──────────────────────────────────
function resetModals() {
  showPaymentModal.value = false;
  showReceiptModal.value = false;
  lastCompletedOrder.value = null;
  activeModifierProduct.value = null;
}

// ─── Mode Switcher ────────────────────────────────────────────────────────────
function switchMode(mode: 'SABOY' | 'ZAL') {
  resetModals();
  posStore.setOperationMode(mode);
  showTableProducts.value = false;
}

// ─── ZAL: stol tanlash ────────────────────────────────────────────────────────
function onTableSelected(tableId: string) {
  resetModals();
  posStore.setActiveTable(tableId);
  showTableProducts.value = true;
}

function backToTableMap() {
  showTableProducts.value = false;
  posStore.clearActiveTable();
}

function scrollCategories(offset: number) {
  if (categoryScrollContainer.value) {
    categoryScrollContainer.value.scrollBy({ left: offset, behavior: 'smooth' });
  }
}

// ─── Active cart (SABOY yoki ZAL) ─────────────────────────────────────────────
const activeCart = computed(() =>
  posStore.operationMode === 'ZAL' ? (posStore.activeTable?.cart ?? []) : posStore.cart
);
const activeSubtotal = computed(() =>
  posStore.operationMode === 'ZAL' ? posStore.activeTableSubtotal : posStore.cartSubtotal
);

// ─── Product → Cart ───────────────────────────────────────────────────────────
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

// ─── Qty update ────────────────────────────────────────────────────────────────
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

function saveTableOrder() {
  if (posStore.operationMode === 'ZAL' && posStore.activeTableId) {
    posStore.clearActiveTable();
  }
}

// ─── Payment ──────────────────────────────────────────────────────────────────
function handlePaymentSuccess(paymentType: PaymentType, paidAmount: number) {
  if (!shiftStore.currentShift) {
    alert('Smena ochilmagan! Avval smenani oching.');
    return;
  }

  let order;
  if (posStore.operationMode === 'ZAL' && posStore.activeTableId) {
    order = posStore.submitTableOrder(
      posStore.activeTableId, paymentType, paidAmount,
      shiftStore.currentShift.cashierName, shiftStore.currentShift.id
    );
  } else {
    order = posStore.submitOrder(
      paymentType, paidAmount,
      shiftStore.currentShift.cashierName, shiftStore.currentShift.id
    );
  }

  if (order) {
    lastCompletedOrder.value = order;
    showPaymentModal.value = false;
    showReceiptModal.value = true;
    // ZAL: stol ochiq qoladi, mijoz yana buyurtma berishi mumkin
  }
}
</script>

<template>
  <div class="h-full flex flex-col lg:flex-row overflow-hidden bg-slate-100 dark:bg-slate-950 transition-colors duration-300">

    <!-- ═══════════════════════════════════════════════ LEFT COLUMN ══════════════ -->
    <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800/80">

      <!-- TOP BAR -->
      <div class="shrink-0 px-3 sm:px-4 py-3 border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 flex flex-wrap items-center gap-3">

        <!-- Search -->
        <div class="relative flex-1 min-w-[160px] max-w-xs">
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            v-model="posStore.searchQuery"
            type="text"
            placeholder="Taom qidirish..."
            class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>

        <!-- SABOY / ZAL MODE TOGGLE -->
        <div class="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
          <button
            @click="switchMode('ZAL')"
            :class="[
              'px-5 py-2 rounded-xl transition-all flex items-center space-x-2 text-sm font-bold',
              posStore.operationMode === 'ZAL'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            ]"
          >
            <span class="text-base">🏛️</span><span>Zal</span>
          </button>
          <button
            @click="switchMode('SABOY')"
            :class="[
              'px-5 py-2 rounded-xl transition-all flex items-center space-x-2 text-sm font-bold',
              posStore.operationMode === 'SABOY'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            ]"
          >
            <span class="text-base">🛍️</span><span>Saboy</span>
          </button>
        </div>

        <!-- ZAL: aktiv stol chip -->
        <div
          v-if="posStore.operationMode === 'ZAL' && posStore.activeTable && showTableProducts"
          class="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0"
        >
          <span>🏛️ {{ posStore.activeTable.number }}-Stol</span>
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        </div>

        <!-- Mobile cart button -->
        <button
          @click="mobileCartOpen = !mobileCartOpen"
          class="lg:hidden ml-auto relative bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg shrink-0"
        >
          <ShoppingBag class="w-4 h-4" />
          <span>{{ activeCart.length }}</span>
          <span v-if="activeSubtotal > 0" class="bg-black/20 px-1.5 py-0.5 rounded-lg font-mono text-[10px]">
            {{ (activeSubtotal / 1000).toFixed(0) }}k
          </span>
        </button>
      </div>

      <!-- ZAL MODE: Stol xaritasi -->
      <template v-if="posStore.operationMode === 'ZAL' && !showTableProducts">
        <div class="flex-1 min-h-0 overflow-hidden">
          <TableMapView @table-selected="onTableSelected" />
        </div>
      </template>

      <!-- Product grid (SABOY yoki ZAL + stol tanlangan) -->
      <template v-else>

        <!-- Categories bar -->
        <div class="relative shrink-0 border-b border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 py-2 px-3 flex items-center">
          <!-- ZAL: orqaga tugma -->
          <button
            v-if="posStore.operationMode === 'ZAL'"
            @click="backToTableMap"
            class="shrink-0 mr-2 w-8 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all"
            title="Stol xaritasiga qaytish"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>

          <button @click="scrollCategories(-200)" class="hidden sm:flex shrink-0 w-7 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl items-center justify-center hover:bg-amber-500 hover:text-white transition-all mr-1.5">
            <ChevronLeft class="w-3.5 h-3.5" />
          </button>

          <div ref="categoryScrollContainer" class="flex-1 flex space-x-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
            <button
              v-for="cat in posStore.visibleCategories"
              :key="cat.id"
              @click="posStore.selectedCategory = cat.id"
              :class="[
                'px-3 py-1.5 rounded-2xl font-bold text-xs transition-all flex items-center space-x-1.5 whitespace-nowrap shrink-0 active:scale-95',
                posStore.selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-amber-400'
              ]"
            >
              <CategoryIcon :cat-id="cat.id" size="sm" />
              <span>{{ cat.name }}</span>
              <span :class="['text-[10px] px-1.5 py-0.5 rounded-full font-mono', posStore.selectedCategory === cat.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500']">{{ cat.count }}</span>
            </button>
          </div>

          <button @click="scrollCategories(200)" class="hidden sm:flex shrink-0 w-7 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl items-center justify-center hover:bg-amber-500 hover:text-white transition-all ml-1.5">
            <ChevronRight class="w-3.5 h-3.5" />
          </button>

          <button @click="emit('change-tab', 'menu')" class="shrink-0 ml-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all">
            <FolderKanban class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">⚙️ Menyu</span>
          </button>
        </div>

        <!-- ZAL: stol info banner -->
        <div
          v-if="posStore.operationMode === 'ZAL' && posStore.activeTable"
          class="shrink-0 mx-3 mt-2.5 mb-0 px-4 py-2.5 rounded-2xl flex items-center justify-between border"
          :class="activeCart.length > 0
            ? 'bg-amber-500/8 border-amber-500/25 dark:bg-amber-500/5'
            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'"
        >
          <div class="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span class="text-base">🏛️</span>
            <span>{{ posStore.activeTable.number }}-Stol</span>
            <span class="text-slate-400">·</span>
            <span class="text-amber-600 dark:text-amber-400">{{ activeCart.length }} ta taom tanlangan</span>
          </div>
          <span class="text-xs text-slate-400 dark:text-slate-500">Pastdagi savatga qo'shiladi</span>
        </div>

        <!-- Success toast -->
        <div
          v-if="lastCompletedOrder && !showReceiptModal"
          class="shrink-0 mx-3 mt-2.5 mb-0 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <CheckCircle class="w-4 h-4 text-emerald-500 shrink-0" />
            <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              #{{ lastCompletedOrder.orderNumber }} — {{ lastCompletedOrder.totalAmount.toLocaleString('uz-UZ') }} so'm qabul qilindi
              <template v-if="lastCompletedOrder.tableNumber"> ({{ lastCompletedOrder.tableNumber }}-Stol)</template>
            </span>
          </div>
          <button
            @click="showReceiptModal = true"
            class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
          >
            <Printer class="w-3 h-3" />Chek
          </button>
        </div>

        <!-- Product grid -->
        <div class="flex-1 p-3 sm:p-4 overflow-y-auto min-h-0">
          <div class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3 pb-16">
            <div
              v-for="prod in posStore.filteredProducts"
              :key="prod.id"
              @click="handleProductClick(prod)"
              class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-amber-500/50 rounded-3xl p-3 flex flex-col cursor-pointer group transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/8 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <div class="relative h-28 sm:h-32 rounded-2xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-950">
                <img :src="prod.imageUrl" :alt="prod.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <button
                  v-if="prod.availableModifiers?.length"
                  @click="openModifiersModal(prod, $event)"
                  class="absolute top-2 right-2 bg-white/90 dark:bg-slate-950/85 backdrop-blur-sm px-2 py-0.5 rounded-xl text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 hover:bg-amber-500 hover:text-white transition-colors"
                >
                  <Sparkles class="w-3 h-3" />+Qo'shimcha
                </button>
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-[10px] uppercase tracking-wider font-extrabold text-amber-600 dark:text-amber-500 mb-0.5 truncate">{{ prod.categoryName }}</div>
                <h4 class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors truncate">{{ prod.name }}</h4>
              </div>
              <div class="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
                <span class="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">{{ prod.price.toLocaleString('uz-UZ') }} so'm</span>
                <div class="w-7 h-7 rounded-xl bg-amber-500/10 group-hover:bg-amber-500 flex items-center justify-center transition-colors shrink-0">
                  <Plus class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ═══════════════════════════════════════════ RIGHT PANEL: Cart ════════════ -->
    <div
      :class="[
        'bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800/80 flex flex-col h-full shadow-xl transition-all duration-300',
        'w-full lg:w-80 xl:w-96 shrink-0',
        mobileCartOpen ? 'fixed inset-x-0 bottom-0 top-16 z-50' : 'hidden lg:flex'
      ]"
    >
      <!-- Cart header -->
      <div class="shrink-0 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 flex items-center justify-between">
        <div class="flex items-center gap-2 min-w-0">
          <ShoppingBag class="w-4 h-4 text-amber-500 shrink-0" />
          <div class="min-w-0">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white leading-none truncate">
              <template v-if="posStore.operationMode === 'ZAL' && posStore.activeTable">
                {{ posStore.activeTable.number }}-Stol buyurtmasi
              </template>
              <template v-else>Savat</template>
            </h3>
            <p v-if="posStore.operationMode === 'ZAL' && posStore.activeTable?.openedAt" class="text-[10px] text-amber-500 mt-0.5 flex items-center gap-1">
              <Clock class="w-3 h-3" />
              Aktiv stol — mijoz hali o'tiribdi
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button
            v-if="activeCart.length > 0"
            @click="clearActiveCart"
            class="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 px-2 py-1 rounded-xl hover:bg-rose-500/10 transition font-medium"
          >
            <Trash2 class="w-3 h-3" /><span>Tozalash</span>
          </button>
          <button @click="mobileCartOpen = false" class="lg:hidden text-slate-400 w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">✕</button>
        </div>
      </div>

      <!-- ZAL: stol tanlanmagan holat -->
      <div
        v-if="posStore.operationMode === 'ZAL' && !posStore.activeTable"
        class="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3"
      >
        <div class="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <span class="text-3xl">🏛️</span>
        </div>
        <p class="text-sm font-bold text-slate-600 dark:text-slate-400">Stol tanlanmagan</p>
        <p class="text-xs text-slate-400 dark:text-slate-600">Chapdan stol bosing, so'ng taom qo'shing</p>
      </div>

      <!-- Bo'sh savat -->
      <div
        v-else-if="activeCart.length === 0"
        class="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3"
      >
        <div class="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <Utensils class="w-7 h-7 text-slate-400 dark:text-slate-600" />
        </div>
        <p class="text-sm font-bold text-slate-500 dark:text-slate-500">Savat bo'sh</p>
        <p class="text-xs text-slate-400 dark:text-slate-600">
          <template v-if="posStore.operationMode === 'ZAL'">
            Chap tomondagi taomlarni bosib qo'shing
          </template>
          <template v-else>
            Buyurtma urish uchun chap tomondagi taomlarni bosing
          </template>
        </p>
      </div>

      <!-- Cart items -->
      <div v-else class="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        <div
          v-for="item in activeCart"
          :key="item.id"
          class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3 hover:border-amber-500/30 transition-colors"
        >
          <div class="flex items-start justify-between mb-2">
            <div class="min-w-0 flex-1 pr-2">
              <h5 class="font-bold text-sm text-slate-900 dark:text-white truncate">{{ item.product.name }}</h5>
              <div v-if="item.selectedModifiers.length > 0" class="text-[11px] text-amber-500 mt-0.5 truncate">
                + {{ item.selectedModifiers.map((m: any) => m.name).join(', ') }}
              </div>
            </div>
            <span class="text-sm font-black text-amber-600 dark:text-amber-400 font-mono shrink-0">{{ item.totalPrice.toLocaleString('uz-UZ') }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[12px] text-slate-400">{{ item.unitPrice.toLocaleString('uz-UZ') }} × {{ item.quantity }}</span>
            <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1">
              <button @click="updateQty(item.id, -1)" class="w-8 h-8 rounded-md bg-white dark:bg-slate-800 shadow-sm hover:bg-rose-50 hover:text-rose-500 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors active:scale-95">
                <Minus class="w-4 h-4" />
              </button>
              <span class="text-sm font-bold text-slate-900 dark:text-white w-8 text-center font-mono">{{ item.quantity }}</span>
              <button @click="updateQty(item.id, 1)" class="w-8 h-8 rounded-md bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center justify-center transition-colors active:scale-95">
                <Plus class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ZAL: Ofitsiant izohi (faqat savatda narsa bo'lganda) -->
      <div
        v-if="posStore.operationMode === 'ZAL' && posStore.activeTable && activeCart.length > 0"
        class="shrink-0 px-3 pb-0 pt-2 border-t border-slate-100 dark:border-slate-800/50"
      >
        <label class="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1">
          <MessageSquare class="w-3 h-3" />Ofitsiant izohi
        </label>
        <textarea
          :value="posStore.activeTable?.waiterNote"
          @input="(e) => posStore.setWaiterNote(posStore.activeTableId!, (e.target as HTMLTextAreaElement).value)"
          placeholder="Masalan: 7-stol, allergy bor..."
          rows="2"
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none resize-none transition-colors"
        />
      </div>

      <!-- Checkout footer -->
      <div class="shrink-0 p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/80 space-y-3">
        <!-- Total -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-500 dark:text-slate-400">Jami:</span>
          <span class="text-2xl font-black text-slate-900 dark:text-white font-mono">{{ activeSubtotal.toLocaleString('uz-UZ') }} <span class="text-sm font-bold">so'm</span></span>
        </div>

        <!-- ZAL: sessiya to'langan summa -->
        <div v-if="posStore.operationMode === 'ZAL' && posStore.activeTable && posStore.activeTable.totalPaid > 0" class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold text-center">
          ✅ Sessiyada jami to'langan: {{ posStore.activeTable.totalPaid.toLocaleString('uz-UZ') }} so'm
        </div>

        <!-- Checkout buttons -->
        <template v-if="posStore.operationMode === 'ZAL'">
          <div class="grid grid-cols-2 gap-3 mt-2">
            <button
              :disabled="activeCart.length === 0"
              @click="saveTableOrder"
              class="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white py-4 rounded-xl font-bold text-base transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
            >
              <Utensils class="w-4 h-4" /> Oshxonaga
            </button>
            <button
              :disabled="activeCart.length === 0"
              @click="showPaymentModal = true"
              class="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold text-base shadow-sm transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
            >
              <CreditCard class="w-4 h-4" /> Hisob-kitob
            </button>
          </div>
        </template>
        <template v-else>
          <button
            :disabled="activeCart.length === 0"
            @click="showPaymentModal = true"
            class="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
          >
            <CreditCard class="w-5 h-5" /> To'lov ({{ activeSubtotal.toLocaleString('uz-UZ') }} so'm)
          </button>
        </template>
      </div>
    </div>

    <!-- ═══ Modals ════════════════════════════════════════════════════════════════ -->
    <ModifierModal
      v-if="activeModifierProduct"
      :product="activeModifierProduct"
      @close="activeModifierProduct = null"
      @confirm="confirmModifiers"
    />
    <PaymentModal
      v-if="showPaymentModal"
      :total-amount="activeSubtotal"
      @close="showPaymentModal = false"
      @success="handlePaymentSuccess"
    />
    <ReceiptModal
      :order="lastCompletedOrder"
      :is-open="showReceiptModal"
      @close="showReceiptModal = false"
    />
  </div>
</template>
