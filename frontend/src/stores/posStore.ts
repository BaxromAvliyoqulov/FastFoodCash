import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import {
  Product, CartItem, Order, PaymentType, OrderType,
  Ingredient, Modifier, Category, OperationMode, Table
} from '../types/pos';
import { initialIngredients, initialCategories, initialProducts } from '../data/menu';
import { useAuthStore } from './authStore';
import { useToastStore } from './toastStore';
import { getCashierFloorInfo, getNextDailyQueueNumber } from '../utils/formatters';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// ─── Timeout bilan fetch — Render.com "cold start" da qotib qolishni oldini oladi ──
// Agar backend 5 soniyada javob bermasa, avtomatik xato qaytaradi va offline rejimga o'tiladi.
async function fetchWithTimeout(url: string, options?: RequestInit, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`Backend ${timeoutMs / 1000}s da javob bermadi (Render cold start yoki internet yo'q)`);
    }
    throw err;
  }
}

const defaultTables: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: `tbl-${i + 1}`,
  number: i + 1,
  name: `Stol #${i + 1}`,
  status: 'FREE' as const,
  cart: [],
  openedAt: null,
  waiterNote: '',
  totalPaid: 0,
  isActive: true
}));

// ─── API orqali stollarni yuklash ────────────────────────────────────────
const fetchTables = async (): Promise<Table[]> => {
  try {
    const res = await fetchWithTimeout(`${API_URL}/tables`);
    if (res.ok) {
      const body = await res.json();
      if (body.success && Array.isArray(body.data) && body.data.length > 0) {
        return body.data.map((t: any) => ({
          id: t.id,
          number: t.number,
          name: t.name,
          isActive: t.isActive,
          status: 'FREE' as const,
          cart: [],
          openedAt: null,
          waiterNote: '',
          totalPaid: 0
        }));
      }
    }
  } catch (err) {
    console.warn('Backend API unreachable, loading default tables locally:', err);
  }

  const savedTables = localStorage.getItem('doston_pos_tables');
  return savedTables ? JSON.parse(savedTables) : defaultTables;
};

export const usePosStore = defineStore('pos', () => {
  const toast = useToastStore();
  // ─── Ingredient Stock ────────────────────────────────────────────────────────
  const ingredients = ref<Ingredient[]>(initialIngredients);

  const lowStockIngredients = computed(() => {
    return ingredients.value.filter(ing => ing.minThreshold && ing.currentStock <= ing.minThreshold);
  });

  function checkLowStockAlerts(toast: any) {
    const lowStock = lowStockIngredients.value;
    if (lowStock.length === 0) return;
    
    // Bitta yig'ma toast (juda ko'p sms kelmasligi uchun) yoki alohida-alohida
    if (lowStock.length > 3) {
      toast.error(`DIQQAT: ${lowStock.length} ta mahsulot zahirasi tugamoqda! Omborga buyurtma bering.`, 5000);
    } else {
      lowStock.forEach(ing => {
        toast.error(`Zahira tugamoqda: ${ing.name} (Qoldiq: ${ing.currentStock} ${ing.unit})`, 5000);
      });
    }
  }

  // ─── Categories ──────────────────────────────────────────────────────────────
  function normalizeCategoryName(catName?: string, catId?: string) {
    const lower = `${catName || ''} ${catId || ''}`.toLowerCase().trim();
    if (lower.includes('burger') || lower.includes('gamburger')) {
      return { id: 'cat-burger', name: 'Burger' };
    }
    if (lower.includes('lavash')) {
      return { id: 'cat-lavash', name: 'Lavash' };
    }
    if (lower.includes('hotdog') || lower.includes('hot-dog') || lower.includes('hot dog')) {
      return { id: 'cat-hotdog', name: 'Hot Dog' };
    }
    if (lower.includes('fries') || lower.includes('fri') || lower.includes('kfc') || lower.includes('qovurilgan') || lower.includes('naggets') || lower.includes('kartoshka') || lower.includes('garnir') || lower.includes('snack')) {
      return { id: 'cat-fried', name: 'Qovurilganlar & KFC' };
    }
    if (lower.includes('pizza') || lower.includes('pitsa')) {
      return { id: 'cat-pizza', name: 'Pizza' };
    }
    if (lower.includes('salad') || lower.includes('salat')) {
      return { id: 'cat-salads', name: 'Salatlar' };
    }
    if (lower.includes('dessert') || lower.includes('muzqaymoq') || lower.includes('marojniy') || lower.includes('shirin') || lower.includes('tort')) {
      return { id: 'cat-desserts', name: 'Muzqaymoq' };
    }
    if (lower.includes('coffee') || lower.includes('kofe') || lower.includes('qahva') || lower.includes('choy')) {
      return { id: 'cat-coffee', name: 'Kofe va Choy' };
    }
    if (lower.includes('energy') || lower.includes('energetik')) {
      return { id: 'cat-energy', name: 'Energetiklar' };
    }
    if (lower.includes('juice') || lower.includes('sok') || lower.includes('sharbat') || lower.includes('moxito') || lower.includes('mojito')) {
      return { id: 'cat-juices', name: 'Sok va Moxito' };
    }
    if (lower.includes('drink') || lower.includes('salqin') || lower.includes('ichimlik') || lower.includes('napitk')) {
      return { id: 'cat-drinks', name: 'Salqin Ichimliklar' };
    }
    return { id: catId || 'cat-drinks', name: catName || 'Salqin Ichimliklar' };
  }

  const storedCategories = localStorage.getItem('doston_pos_categories');
  let parsedCategories: Category[] = storedCategories ? JSON.parse(storedCategories) : initialCategories;
  
  // Filter out any obsolete 'cat-all', 'Garnirlar', 'Snacks' entries
  parsedCategories = parsedCategories.filter(c => 
    c.id !== 'cat-all' && 
    c.name !== 'Barcha Taomlar' &&
    !c.name.toLowerCase().includes('garnir') &&
    !c.name.toLowerCase().includes('snack') &&
    !c.id.includes('garnir') &&
    !c.id.includes('snack')
  );

  // Normalize category names
  parsedCategories = parsedCategories.map(c => {
    const norm = normalizeCategoryName(c.name, c.id);
    return { ...c, id: norm.id, name: norm.name };
  });

  // Deduplicate categories by ID
  const uniqueCatMap = new Map<string, Category>();
  initialCategories.forEach(initialCat => {
    const norm = normalizeCategoryName(initialCat.name, initialCat.id);
    uniqueCatMap.set(norm.id, { ...initialCat, id: norm.id, name: norm.name });
  });

  parsedCategories.forEach(c => {
    if (!uniqueCatMap.has(c.id)) {
      uniqueCatMap.set(c.id, c);
    }
  });

  const categories = ref<Category[]>(Array.from(uniqueCatMap.values()));
  watch(categories, (newVal) => localStorage.setItem('doston_pos_categories', JSON.stringify(newVal)), { deep: true });
  
  const selectedCategory = ref('cat-all');
  const searchQuery = ref('');

  // Helper to ensure human-readable product names (never raw IDs like prod-lav-1)
  function resolveProductName(id?: string, rawName?: string): string {
    const init = initialProducts.find(ip => ip.id === id);
    if (init && init.name) {
      if (!rawName || rawName.startsWith('prod-') || rawName.trim() === '' || rawName === id) {
        return init.name;
      }
      return rawName;
    }
    if (rawName && !rawName.startsWith('prod-')) {
      return rawName;
    }
    return init?.name || rawName || 'Taom';
  }

  // ─── Products ────────────────────────────────────────────────────────────────
  const storedProducts = localStorage.getItem('doston_pos_products');
  let loadedProducts: Product[] = initialProducts;
  if (storedProducts) {
    try {
      const parsed = JSON.parse(storedProducts);
      if (Array.isArray(parsed)) {
        const initialIds = new Set(initialProducts.map(p => p.id));
        const customProducts = parsed.filter((p: any) => !initialIds.has(p.id) && !p.id?.startsWith('prod-lav-') && !p.id?.startsWith('prod-drk-') && !p.id?.startsWith('prod-bur-') && !p.id?.startsWith('prod-hot-') && !p.id?.startsWith('prod-piz-') && !p.id?.startsWith('prod-sok-') && !p.id?.startsWith('prod-cof-') && !p.id?.startsWith('prod-mox-') && !p.id?.startsWith('prod-des-') && !p.id?.startsWith('prod-sal-') && !p.id?.startsWith('prod-fri-'));
        
        loadedProducts = [
          ...initialProducts.map(ip => {
            const found = parsed.find((p: any) => p.id === ip.id);
            const norm = normalizeCategoryName(found?.categoryName || ip.categoryName, found?.categoryId || ip.categoryId);
            if (found) {
              return {
                ...ip,
                name: resolveProductName(ip.id, found.name),
                categoryId: norm.id,
                categoryName: norm.name,
                price: found.price || ip.price,
                imageUrl: (found.imageUrl && !found.imageUrl.includes('placeholder')) ? found.imageUrl : ip.imageUrl,
                isStopList: found.isStopList ?? ip.isStopList
              };
            }
            return {
              ...ip,
              name: ip.name,
              categoryId: norm.id,
              categoryName: norm.name
            };
          }),
          ...customProducts.map((cp: any) => {
            const norm = normalizeCategoryName(cp.categoryName, cp.categoryId);
            return { 
              ...cp, 
              name: resolveProductName(cp.id, cp.name),
              categoryId: norm.id, 
              categoryName: norm.name 
            };
          })
        ];
      }
    } catch (e) {
      console.warn('Failed to parse local stored products:', e);
    }
  }

  // ─── Network Status, Sync Engine & BroadcastChannel ────────────────────────
  const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const isServerConnected = ref(true);
  const lastSyncTime = ref<Date>(new Date());
  const isSyncingOrders = ref(false);
  const isSyncingProducts = ref(false);

  const pendingOfflineCount = computed(() => {
    try {
      const list = JSON.parse(localStorage.getItem('doston_offline_orders') || '[]');
      return Array.isArray(list) ? list.length : 0;
    } catch {
      return 0;
    }
  });

  // Cross-Tab Real-time BroadcastChannel (0ms sync between all open tabs/monitors)
  let syncChannel: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      syncChannel = new BroadcastChannel('fastfoodcash_sync');
      syncChannel.onmessage = (event) => {
        const { type } = event.data || {};
        if (type === 'PRODUCTS_UPDATED') {
          fetchProducts(false);
        } else if (type === 'ORDER_CREATED' || type === 'ORDER_CANCELLED') {
          fetchOrders();
        } else if (type === 'FORCE_REFRESH') {
          fetchProducts(false);
          fetchOrders();
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel initialization warning:', e);
    }
  }

  function broadcastSync(type: 'PRODUCTS_UPDATED' | 'ORDER_CREATED' | 'ORDER_CANCELLED' | 'FORCE_REFRESH') {
    try {
      syncChannel?.postMessage({ type, timestamp: Date.now() });
    } catch (e) {
      console.warn('Broadcast sync error:', e);
    }
  }

  const products = ref<Product[]>(loadedProducts);
  watch(products, (newVal) => localStorage.setItem('doston_pos_products', JSON.stringify(newVal)), { deep: true });

  // ─── Fetch Products (Never drops original menu or new DB products) ────────
  async function fetchProducts(showToast = false) {
    isSyncingProducts.value = true;
    try {
      const res = await fetchWithTimeout(`${API_URL}/products`, {}, 4000);
      if (res.ok) {
        const body = await res.json();
        const backendProducts = body.success && Array.isArray(body.data) ? body.data : [];
        
        isServerConnected.value = true;
        isOnline.value = true;
        lastSyncTime.value = new Date();

        // 1. Asosiy baza: Barcha original menyu (Choy, Kofe, Muzqaymoq, Lavash, Burger, Pizza, Hotdog...)
        const mergedMap = new Map<string, Product>();

        initialProducts.forEach(ip => {
          const norm = normalizeCategoryName(ip.categoryName, ip.categoryId);
          mergedMap.set(ip.id, {
            ...ip,
            categoryId: norm.id,
            categoryName: norm.name
          });
        });

        // 2. Agar localStorage da saqlangan maxsus tovarlar bo'lsa, ularni ham saqlaymiz
        try {
          const stored = localStorage.getItem('doston_pos_products');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              const initialIds = new Set(initialProducts.map(p => p.id));
              parsed.forEach((p: any) => {
                if (!initialIds.has(p.id)) {
                  const norm = normalizeCategoryName(p.categoryName, p.categoryId);
                  mergedMap.set(p.id, {
                    ...p,
                    categoryId: norm.id,
                    categoryName: norm.name
                  });
                }
              });
            }
          }
        } catch (e) {
          console.warn('Error reading stored custom products:', e);
        }

        // 3. Backend DB dan kelgan tovarlar bilan yangilaymiz yoki yangilarini qo'shamiz
        if (backendProducts.length > 0) {
          const activeBackendProducts = backendProducts.filter((bp: any) => !bp.isDeleted);
          
          activeBackendProducts.forEach((bp: any) => {
            const existingById = mergedMap.get(bp.id);
            let existingByName: Product | undefined;
            for (const item of mergedMap.values()) {
              if (item.name?.toLowerCase().trim() === bp.name?.toLowerCase().trim()) {
                existingByName = item;
                break;
              }
            }
            const matched = existingById || existingByName;

            const norm = normalizeCategoryName(bp.categoryName || matched?.categoryName || 'Boshqa', bp.categoryId || matched?.categoryId);
            const imgUrl = (bp.imageUrl && !bp.imageUrl.includes('placeholder'))
              ? bp.imageUrl
              : (matched?.imageUrl || '/images/food/lavash_obichniy.jpg');

            const updatedProd: Product = {
              id: bp.id || matched?.id || ('prod-' + Date.now()),
              name: resolveProductName(bp.id || matched?.id, bp.name || matched?.name),
              price: typeof bp.price === 'number' ? bp.price : (Number(bp.price) || matched?.price || 0),
              categoryId: norm.id,
              categoryName: norm.name,
              imageUrl: imgUrl,
              isStopList: bp.isAvailable !== undefined ? !bp.isAvailable : (bp.isStopList ?? matched?.isStopList ?? false),
              recipe: (bp.recipes && bp.recipes.length > 0)
                ? bp.recipes.map((r: any) => ({ ingredientId: r.ingredientId, quantityRequired: r.quantityRequired }))
                : (matched?.recipe || [])
            };

            if (matched && matched.id !== updatedProd.id) {
              mergedMap.delete(matched.id);
            }
            mergedMap.set(updatedProd.id, updatedProd);
          });

          // O'chirilgan (isDeleted: true) tovarlarni olib tashlash
          const deletedBackendProducts = backendProducts.filter((bp: any) => bp.isDeleted);
          deletedBackendProducts.forEach((bp: any) => {
            mergedMap.delete(bp.id);
            for (const [id, item] of mergedMap.entries()) {
              if (item.name?.toLowerCase().trim() === bp.name?.toLowerCase().trim()) {
                mergedMap.delete(id);
              }
            }
          });
        }

        const finalProductList = Array.from(mergedMap.values());
        products.value = finalProductList;
        localStorage.setItem('doston_pos_products', JSON.stringify(finalProductList));

        // Kategoriyalarni to'ldirish
        finalProductList.forEach(p => {
          if (p.categoryName && !categories.value.some(c => c.name.toLowerCase() === p.categoryName.toLowerCase())) {
            categories.value.push({
              id: p.categoryId || ('cat-' + p.categoryName.toLowerCase().replace(/\s+/g, '-')),
              name: p.categoryName,
              count: 0,
              isHidden: false
            });
          }
        });

        if (showToast) {
          toast.success("Menyu va tovarlar serverdan to'liq yangilandi! ✨");
        }
      } else {
        isServerConnected.value = false;
        isOnline.value = typeof navigator !== 'undefined' ? navigator.onLine : false;
      }
    } catch (e) {
      console.warn('Backend offline — mahalliy keshdagi tovarlar ishlatilmoqda:', e);
      isServerConnected.value = false;
      isOnline.value = typeof navigator !== 'undefined' ? navigator.onLine : false;
    } finally {
      isSyncingProducts.value = false;
    }
  }

  // ─── Force Refresh Menu (Keshni tozalash va to'liq yangilash) ───────────────
  async function forceRefreshMenu() {
    localStorage.removeItem('doston_pos_products');
    await fetchProducts(true);
    await fetchOrders();
    broadcastSync('FORCE_REFRESH');
  }

  // ─── Offline Orders Auto-Sync Engine ──────────────────────────────────────────
  async function syncOfflineOrders() {
    if (isSyncingOrders.value) return;
    const raw = localStorage.getItem('doston_offline_orders');
    if (!raw) return;

    let offlineOrders: any[] = [];
    try {
      offlineOrders = JSON.parse(raw);
    } catch {
      return;
    }

    if (!Array.isArray(offlineOrders) || offlineOrders.length === 0) return;

    isSyncingOrders.value = true;
    let successCount = 0;
    const remainingOrders: any[] = [];

    for (const offOrder of offlineOrders) {
      try {
        const payload = offOrder.offlinePayload || {
          cashierId: offOrder.cashierId || 'default',
          shiftId: offOrder.shiftId,
          paymentType: offOrder.paymentType,
          items: offOrder.items?.map((item: any) => ({
            productId: item.product?.id || item.productId,
            productName: item.product?.name || item.productName,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          }))
        };

        const res = await fetchWithTimeout(`${API_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }, 3500);

        const body = await res.json();
        if (res.ok && body.success) {
          successCount++;
          // Update local orderHistory if matching temp id
          const realOrder = body.data?.order || body.data || body.order;
          if (realOrder) {
            const idx = orderHistory.value.findIndex(o => o.id === offOrder.id);
            if (idx > -1) {
              orderHistory.value[idx].id = realOrder.id;
              orderHistory.value[idx].orderNumber = realOrder.orderNumber;
              orderHistory.value[idx].status = 'COMPLETED';
            }
          }
        } else {
          remainingOrders.push(offOrder);
        }
      } catch {
        remainingOrders.push(offOrder);
      }
    }

    localStorage.setItem('doston_offline_orders', JSON.stringify(remainingOrders));
    isSyncingOrders.value = false;

    if (successCount > 0) {
      toast.success(`${successCount} ta oflayn chek serverga muvaffaqiyatli yuklandi! 🚀`, 4000);
      broadcastSync('ORDER_CREATED');
      await fetchOrders();
    }
  }

  // ─── Auto Background Polling & Online Listeners ─────────────────────────────
  let autoSyncInterval: any = null;
  function initSyncEngine() {
    if (autoSyncInterval) return;
    autoSyncInterval = setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        syncOfflineOrders();
        fetchProducts(false);
        fetchOrders();
      }
    }, 10000);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        isOnline.value = true;
        syncOfflineOrders();
        fetchProducts(false);
        fetchOrders();
        toast.success('Internet aloqasi tiklandi! 🟢', 3000);
      });

      window.addEventListener('offline', () => {
        isOnline.value = false;
        toast.warning('Internet aloqasi uzildi! Kassa oflayn rejimda ishlaydi. 🔴', 4000);
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          fetchProducts(false);
          fetchOrders();
        }
      });
    }
  }

  // Start sync engine immediately on store creation
  initSyncEngine();

  // ─── SABOY Cart ──────────────────────────────────────────────────────────────
  const cart = ref<CartItem[]>([]);

  // ─── Order Tracking ──────────────────────────────────────────────────────────
  const activeOrderNumber = ref(101);
  const orderHistory = ref<Order[]>([]);
  const selectedOrderType = ref<OrderType>('DINE_IN');

  async function fetchOrders() {
    try {
      const res = await fetchWithTimeout(`${API_URL}/orders`, {}, 4000);
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          isServerConnected.value = true;
          isOnline.value = true;
          lastSyncTime.value = new Date();
          // Backend returns { items: [...], meta: {...} } — array ni to'g'ri olish kerak
          const rawOrders = Array.isArray(body.data) ? body.data : (Array.isArray(body.data.items) ? body.data.items : []);
          
          // Har bir buyurtmani null-safe qilish (backend dan kelgan data to'liq bo'lmasligi mumkin)
          orderHistory.value = rawOrders.map((o: any) => ({
            id: o.id || 'unknown-' + Date.now(),
            orderNumber: o.orderNumber || 0,
            shiftId: o.shiftId || '',
            cashierName: o.cashierName || o.cashier?.fullName || 'Kassir',
            orderType: o.orderType || 'DINE_IN',
            items: Array.isArray(o.items) ? o.items.map((item: any) => ({
              id: item.id || 'item-' + Math.random().toString(36).substr(2, 6),
              product: {
                id: item.product?.id || item.productId || '',
                name: item.product?.name || item.productName || 'Nomsiz',
                price: item.product?.price || item.unitPrice || 0,
                categoryId: item.product?.categoryId || '',
                categoryName: item.product?.categoryName || '',
                imageUrl: item.product?.imageUrl || '',
                recipe: item.product?.recipe || []
              },
              quantity: item.quantity || 1,
              selectedModifiers: item.selectedModifiers || [],
              unitPrice: item.unitPrice || item.product?.price || 0,
              totalPrice: item.totalPrice || 0
            })) : [],
            totalAmount: o.totalAmount || 0,
            paymentType: o.paymentType || 'CASH',
            paidAmount: o.paidAmount ?? o.totalAmount ?? 0,
            changeAmount: o.changeAmount ?? 0,
            status: o.status || 'COMPLETED',
            createdAt: o.createdAt || new Date().toISOString()
          }));
        }
      } else {
        isServerConnected.value = false;
        isOnline.value = typeof navigator !== 'undefined' ? navigator.onLine : false;
      }
    } catch (e) {
      console.warn('Backend API unreachable, using local orders history:', e);
      isServerConnected.value = false;
      isOnline.value = typeof navigator !== 'undefined' ? navigator.onLine : false;
    }
  }

  // Mijozga topshirish oldidan barcha test/fake savdolarni tozalash (Tovar va retseptlarga tegilmaydi)
  async function clearAllSalesHistory() {
    orderHistory.value = [];
    activeOrderNumber.value = 101;
    cart.value = [];
    
    // Barcha stollarni bo'shatish
    tables.value.forEach(t => {
      t.status = 'FREE';
      t.cart = [];
      t.openedAt = null;
      t.orderNumber = undefined;
      t.totalPaid = 0;
      t.waiterNote = '';
    });
    localStorage.removeItem('doston_pos_active_table');
    localStorage.removeItem('doston_current_shift');
    localStorage.removeItem('doston_shift_audits');
    localStorage.removeItem('doston_offline_orders');
    localStorage.removeItem('doston_pos_history');

    try {
      await fetchWithTimeout(`${API_URL}/system/clear-sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      console.warn('Backend clear-sales sync warning:', e);
    }
  }

  // ─── Operation Mode: ZAL | SABOY ─────────────────────────────────────────────
  const operationMode = ref<OperationMode>(
    (localStorage.getItem('doston_pos_mode') as OperationMode) || 'ZAL'
  );

  function setOperationMode(mode: OperationMode) {
    operationMode.value = mode;
    localStorage.setItem('doston_pos_mode', mode);
    // ZAL rejimiga o'tganda avtomatik ravishda birinchi stolni tanlamaymiz.
    // Foydalanuvchi o'zi stol xaritasidan stolni tanlashi kerak.
  }

  // ─── Tables (Stollar) ────────────────────────────────────────────────────────
  const storedTables = localStorage.getItem('doston_pos_tables');
  const tables = ref<Table[]>(storedTables ? JSON.parse(storedTables) : []);
  watch(tables, (newVal) => localStorage.setItem('doston_pos_tables', JSON.stringify(newVal)), { deep: true });

  const activeTableId = ref<string | null>(
    localStorage.getItem('doston_pos_active_table') || null
  );
  
  async function loadTables() {
    const fetchedTables = await fetchTables();
    if (fetchedTables.length > 0) {
      // Mavjud stollarni yangilash (savat va holatlarni saqlab qolish uchun)
      const currentMap = new Map(tables.value.map(t => [t.id, t]));
      tables.value = fetchedTables.map(ft => {
        const current = currentMap.get(ft.id);
        if (current) {
          return { ...current, name: ft.name, number: ft.number, isActive: ft.isActive };
        }
        return ft;
      });
    }
  }

  function removeTableCartItem(tableId: string, cartItemId: string) {
    const table = tables.value.find(t => t.id === tableId);
    if (!table) return;
    const index = table.cart.findIndex(i => i.id === cartItemId);
    if (index > -1) {
      table.cart.splice(index, 1);
      if (table.cart.length === 0) {
        table.status = 'FREE';
        table.orderNumber = undefined;
        table.openedAt = null;
      }
    }
  }

  function setActiveTable(tableId: string) {
    activeTableId.value = tableId;
    localStorage.setItem('doston_pos_active_table', tableId);
  }

  function clearActiveTable() {
    activeTableId.value = null;
    localStorage.removeItem('doston_pos_active_table');
  }

  const activeTable = computed(() => {
    if (!activeTableId.value) return null;
    return tables.value.find(t => t.id === activeTableId.value) ?? null;
  });

  const activeTableSubtotal = computed(() => {
    return (activeTable.value?.cart ?? []).reduce((sum, item) => sum + item.totalPrice, 0);
  });

  // ─── 7% Xizmat Haqi (Service Fee) ──────────────────────────────────────────
  const serviceFeeEnabled = ref(localStorage.getItem('doston_pos_service_fee_enabled') !== 'false');
  const serviceFeePercent = ref(
    Number(localStorage.getItem('doston_pos_service_fee_percent')) > 0 
      ? Number(localStorage.getItem('doston_pos_service_fee_percent')) 
      : 7
  );
  const serviceFeeOnlyZal = ref(localStorage.getItem('doston_pos_service_fee_only_zal') !== 'false');

  function setServiceFeeConfig(enabled: boolean, percent: number, onlyZal: boolean = true) {
    serviceFeeEnabled.value = enabled;
    serviceFeePercent.value = percent;
    serviceFeeOnlyZal.value = onlyZal;
    localStorage.setItem('doston_pos_service_fee_enabled', String(enabled));
    localStorage.setItem('doston_pos_service_fee_percent', String(percent));
    localStorage.setItem('doston_pos_service_fee_only_zal', String(onlyZal));
    toast.success(`Xizmat haqi sozlamalari saqlandi: ${enabled ? percent + '%' : 'O\'chirilgan'}! ✨`);
  }

  // Faol buyurtma uchun xizmat haqi summasi (Faqat ZALda va faqat isTakeaway bo'lmagan taomlarga)
  const activeServiceFeeAmount = computed(() => {
    if (!serviceFeeEnabled.value || serviceFeePercent.value <= 0) return 0;
    if (serviceFeeOnlyZal.value && operationMode.value !== 'ZAL') return 0;
    const items = operationMode.value === 'ZAL' ? (activeTable.value?.cart ?? []) : cart.value;
    // Faqat Zalda yeyiladigan taomlarga hisoblanadi, Saboy (olib ketish) belgilanganlarga 0% (Halol hisob)
    const eligibleSubtotal = items
      .filter(i => !i.isTakeaway)
      .reduce((sum, item) => sum + item.totalPrice, 0);
    return Math.round((eligibleSubtotal * serviceFeePercent.value) / 100);
  });

  // Xizmat haqi qo'shilgan jami summa
  const activeTotalWithServiceFee = computed(() => {
    const subtotal = operationMode.value === 'ZAL' ? activeTableSubtotal.value : cartSubtotal.value;
    return subtotal + activeServiceFeeAmount.value;
  });

  // ─── Computed ────────────────────────────────────────────────────────────────
  const filteredProducts = computed(() => {
    let result = products.value;
    const hiddenCategoryNames = new Set(
      categories.value.filter(c => c.isHidden).map(c => c.name)
    );
    result = result.filter(p => !hiddenCategoryNames.has(p.categoryName));

    if (selectedCategory.value !== 'cat-all') {
      const catObj = categories.value.find(c => c.id === selectedCategory.value);
      if (catObj) {
        const catBase = catObj.name.toLowerCase().replace(/s$/, '');
        result = result.filter(p => {
          const pCatBase = (p.categoryName || '').toLowerCase().replace(/s$/, '');
          return p.categoryId === catObj.id || p.categoryName === catObj.name || pCatBase === catBase;
        });
      }
    }

    if (searchQuery.value.trim() !== '') {
      const q = searchQuery.value.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
      );
    }
    return result;
  });

  const visibleCategories = computed(() => {
    const totalCount = products.value.filter(p => !p.isStopList).length;
    const allTab: Category = {
      id: 'cat-all',
      name: 'Barcha Taomlar',
      count: totalCount,
      isHidden: false
    };
    const regularCats = categories.value
      .filter(c => c.id !== 'cat-all' && !c.isHidden)
      .map(c => ({
        ...c,
        count: products.value.filter(p => (p.categoryName === c.name || p.categoryId === c.id) && !p.isStopList).length
      }));
    return [allTab, ...regularCats];
  });

  const cartSubtotal = computed(() =>
    cart.value.reduce((sum, item) => sum + item.totalPrice, 0)
  );

  // ─── Recipe Auto-Deduction ───────────────────────────────────────────────────
  function _deductIngredients(cartItems: CartItem[]) {
    cartItems.forEach(item => {
      item.product.recipe.forEach(recipe => {
        const ing = ingredients.value.find(i => i.id === recipe.ingredientId);
        if (ing) {
          ing.currentStock = Math.max(0, ing.currentStock - recipe.quantityRequired * item.quantity);
        }
      });
      item.selectedModifiers.forEach(mod => {
        const productMod = item.product.availableModifiers?.find(m => m.id === mod.modifierId);
        if (productMod?.ingredientDeduction) {
          const ing = ingredients.value.find(i => i.id === productMod.ingredientDeduction!.ingredientId);
          if (ing) {
            ing.currentStock = Math.max(0, ing.currentStock - productMod.ingredientDeduction!.quantity * item.quantity);
          }
        }
      });
    });
  }

  // ─── SABOY: addToCart ─────────────────────────────────────────────────────────
  function addToCart(product: Product, selectedModifiers: Modifier[] = [], customQuantity: number = 1) {
    const cat = categories.value.find(c => c.id === product.categoryId);
    if (product.isStopList || cat?.isHidden) {
      toast.warning(`"${product.name}" vaqtinchalik yopilgan (Stop-List)! Ushbu taomni sotish taqiqlangan.`);
      return;
    }
    const modPriceSum = selectedModifiers.reduce((acc, m) => acc + m.price, 0);
    const unitPrice = product.price + modPriceSum;
    const modIds = selectedModifiers.map(m => m.id).sort().join(',');

    const existingIndex = cart.value.findIndex(item => {
      const itemModIds = item.selectedModifiers.map(m => m.modifierId).sort().join(',');
      return item.product.id === product.id && itemModIds === modIds;
    });

    if (existingIndex > -1) {
      cart.value[existingIndex].quantity = Number((cart.value[existingIndex].quantity + customQuantity).toFixed(3));
      cart.value[existingIndex].totalPrice = Math.round(cart.value[existingIndex].quantity * cart.value[existingIndex].unitPrice);
    } else {
      cart.value.push({
        id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        product,
        quantity: customQuantity,
        selectedModifiers: selectedModifiers.map(m => ({ modifierId: m.id, name: m.name, price: m.price, ingredientDeduction: m.ingredientDeduction })),
        unitPrice,
        totalPrice: Math.round(customQuantity * unitPrice)
      });
    }
  }

  function updateQuantity(cartItemId: string, delta: number) {
    const index = cart.value.findIndex(i => i.id === cartItemId);
    if (index > -1) {
      const item = cart.value[index];
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        cart.value.splice(index, 1);
      } else {
        item.quantity = newQty;
        item.totalPrice = item.quantity * item.unitPrice;
      }
    }
  }

  function clearCart() {
    cart.value = [];
  }

  function removeFromCart(cartItemId: string) {
    const index = cart.value.findIndex(i => i.id === cartItemId);
    if (index > -1) {
      cart.value.splice(index, 1);
    }
  }

  // ─── Order Submission Lock (Multi-click / Double-submission protection) ─────
  const isSubmittingOrder = ref(false);

  // ─── SABOY: submitOrder ───────────────────────────────────────────────────────
  async function submitOrder(
    paymentType: PaymentType,
    paidAmount: number,
    cashierName: string,
    shiftId: string,
    _orderType?: OrderType
  ): Promise<Order | null> {
    if (isSubmittingOrder.value) {
      console.warn('⚠️ Buyurtma allaqachon yuborilmoqda, takroriy bosish bekor qilindi.');
      return null;
    }
    if (cart.value.length === 0) {
      console.warn('⚠️ Savatcha bo\'sh, buyurtma yuborilmaydi.');
      return null;
    }

    isSubmittingOrder.value = true;
    const authStore = useAuthStore();
    
    try {
      const payload = {
        cashierId: authStore.user?.id || 'default',
        shiftId,
        paymentType,
        items: cart.value.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          ingredientDeductions: item.selectedModifiers?.flatMap(m => 
            m.ingredientDeduction ? [{ ingredientId: m.ingredientDeduction.ingredientId, quantity: m.ingredientDeduction.quantity * item.quantity }] : []
          ) || []
        }))
      };

      const cartItemsCopy = [...cart.value];
      const subtotal = cartSubtotal.value;
      const serviceFee = activeServiceFeeAmount.value;
      const serviceFeePercentVal = serviceFeeEnabled.value ? serviceFeePercent.value : 0;
      const totalAmount = activeTotalWithServiceFee.value;
      const changeAmount = Math.max(0, (paidAmount || totalAmount) - totalAmount);
      const dailyQueueNumber = getNextDailyQueueNumber(shiftId);
      const cashierFloorInfo = getCashierFloorInfo(authStore.user);

      try {
        const res = await fetchWithTimeout(`${API_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }, 3500);
        
        const body = await res.json();
        const orderData = body.data?.order || body.data || body.order;
        
        if (res.ok && body.success && orderData) {
          const completedOrder = {
            ...orderData,
            dailyQueueNumber,
            cashierFloor: cashierFloorInfo.badge,
            subtotal,
            serviceFee,
            serviceFeePercent: serviceFeePercentVal,
            paidAmount: paidAmount || totalAmount,
            changeAmount,
            cashierName: cashierName || authStore.user?.fullName || 'Kassir',
            items: cartItemsCopy.map(c => ({
              id: 'item-' + Math.random().toString(36).substr(2, 6),
              product: { ...c.product },
              quantity: c.quantity,
              unitPrice: c.unitPrice || c.product.price,
              totalPrice: c.totalPrice,
              selectedModifiers: c.selectedModifiers || []
            }))
          };
          orderHistory.value.unshift(completedOrder);
          clearCart();
          _deductIngredients(cartItemsCopy);
          broadcastSync('ORDER_CREATED');
          return completedOrder;
        }
      } catch (_backendErr) {
        console.warn('Backend unavailable or timed out. Order saved locally!');
      }

      // Offline order fallback
      const offlineOrders = JSON.parse(localStorage.getItem('doston_offline_orders') || '[]');
      const tempOrder = {
        id: 'offline-' + Date.now(),
        orderNumber: activeOrderNumber.value++,
        dailyQueueNumber,
        cashierFloor: cashierFloorInfo.badge,
        totalAmount,
        subtotal,
        serviceFee,
        serviceFeePercent: serviceFeePercentVal,
        paymentType,
        paidAmount: paidAmount || totalAmount,
        changeAmount,
        cashierName: cashierName || authStore.user?.fullName || 'Kassir',
        status: 'COMPLETED',
        createdAt: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        items: cartItemsCopy.map(c => ({
          id: 'item-' + Math.random().toString(36).substr(2, 6),
          product: { ...c.product },
          quantity: c.quantity,
          unitPrice: c.unitPrice || c.product.price,
          totalPrice: c.totalPrice,
          selectedModifiers: c.selectedModifiers || []
        })),
        offlinePayload: payload
      };
      
      offlineOrders.push(tempOrder);
      localStorage.setItem('doston_offline_orders', JSON.stringify(offlineOrders));
      
      orderHistory.value.unshift(tempOrder as any);
      clearCart();
      _deductIngredients(cartItemsCopy);
      
      return tempOrder as any;
    } finally {
      isSubmittingOrder.value = false;
    }
  }

  // ─── SABOY: submitSaboyKitchenOrder (Oshxonaga to'lovsiz yuborish) ───────────
  async function submitSaboyKitchenOrder(
    cashierName?: string,
    shiftId?: string
  ): Promise<{ order: Order; kitchenReceiptData: any } | null> {
    if (isSubmittingOrder.value) return null;
    if (cart.value.length === 0) return null;

    isSubmittingOrder.value = true;
    const authStore = useAuthStore();

    try {
      const cartItemsCopy = [...cart.value];
      const subtotal = cartSubtotal.value;
      const totalAmount = subtotal; // Saboyda xizmat haqi 0%
      const effectiveShiftId = shiftId || 'default-shift';
      const dailyQueueNumber = getNextDailyQueueNumber(effectiveShiftId);
      const cashierFloorInfo = getCashierFloorInfo(authStore.user);
      const effectiveCashier = cashierName || authStore.user?.fullName || 'Kassir';

      const orderNumber = activeOrderNumber.value++;
      const orderId = 'saboy-kitch-' + Date.now();

      const newOrder: Order = {
        id: orderId,
        orderNumber,
        dailyQueueNumber,
        shiftId: effectiveShiftId,
        cashierName: effectiveCashier,
        cashierFloor: cashierFloorInfo.badge,
        orderType: 'TAKEAWAY',
        items: cartItemsCopy.map(c => ({
          id: 'item-' + Math.random().toString(36).substr(2, 6),
          product: { ...c.product },
          quantity: c.quantity,
          unitPrice: c.unitPrice || c.product.price,
          totalPrice: c.totalPrice,
          selectedModifiers: c.selectedModifiers || [],
          customNote: c.customNote,
          isTakeaway: true
        })),
        subtotal,
        serviceFee: 0,
        serviceFeePercent: 0,
        totalAmount,
        paymentType: 'CASH', // default kutilmoqda
        paidAmount: 0,
        changeAmount: 0,
        status: 'COOKING',
        createdAt: new Date().toISOString()
      };

      orderHistory.value.unshift(newOrder);

      // LocalStorage offline orders da ham saqlash
      const offlineOrders = JSON.parse(localStorage.getItem('doston_offline_orders') || '[]');
      offlineOrders.push(newOrder);
      localStorage.setItem('doston_offline_orders', JSON.stringify(offlineOrders));

      clearCart();
      _deductIngredients(cartItemsCopy);

      return {
        order: newOrder,
        kitchenReceiptData: {
          tableNumber: null,
          tableName: `🛍️ Saboy #${dailyQueueNumber}`,
          items: cartItemsCopy,
          dailyQueueNumber,
          cashierFloor: cashierFloorInfo.badge,
          isDoZakaz: false
        }
      };
    } finally {
      isSubmittingOrder.value = false;
    }
  }

  // ─── Update Order Status (COOKING -> READY -> COMPLETED) ───────────────────
  function updateOrderStatus(orderId: string, newStatus: 'COOKING' | 'READY' | 'COMPLETED' | 'CANCELLED') {
    const order = orderHistory.value.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      // LocalStorage dagi offline orders ni ham yangilash
      const offlineOrders = JSON.parse(localStorage.getItem('doston_offline_orders') || '[]');
      const offIndex = offlineOrders.findIndex((o: any) => o.id === orderId);
      if (offIndex > -1) {
        offlineOrders[offIndex].status = newStatus;
        localStorage.setItem('doston_offline_orders', JSON.stringify(offlineOrders));
      }
    }
  }

  // ─── ZAL: addToTableCart ──────────────────────────────────────────────────────
  function addToTableCart(tableId: string, product: Product, selectedModifiers: Modifier[] = [], customQuantity: number = 1) {
    const cat = categories.value.find(c => c.id === product.categoryId);
    if (product.isStopList || cat?.isHidden) {
      toast.warning(`"${product.name}" vaqtinchalik yopilgan (Stop-List)!`);
      return;
    }

    const table = tables.value.find(t => t.id === tableId);
    if (!table) return;

    const modPriceSum = selectedModifiers.reduce((acc, m) => acc + m.price, 0);
    const unitPrice = product.price + modPriceSum;
    const modIds = selectedModifiers.map(m => m.id).sort().join(',');

    const hasAnySentItems = table.cart.some(i => i.isSentToKitchen || (i.sentQuantity && i.sentQuantity > 0));

    const existingIndex = table.cart.findIndex(item => {
      const itemModIds = item.selectedModifiers.map(m => m.modifierId).sort().join(',');
      return item.product.id === product.id && itemModIds === modIds;
    });

    if (existingIndex > -1) {
      table.cart[existingIndex].quantity = Number((table.cart[existingIndex].quantity + customQuantity).toFixed(3));
      table.cart[existingIndex].totalPrice = Math.round(table.cart[existingIndex].quantity * table.cart[existingIndex].unitPrice);
      if (hasAnySentItems) {
        table.cart[existingIndex].isNewAddition = true;
      }
    } else {
      table.cart.push({
        id: 'tcart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        product,
        quantity: customQuantity,
        selectedModifiers: selectedModifiers.map(m => ({ modifierId: m.id, name: m.name, price: m.price, ingredientDeduction: m.ingredientDeduction })),
        unitPrice,
        totalPrice: Math.round(customQuantity * unitPrice),
        sentQuantity: 0,
        isSentToKitchen: false,
        isNewAddition: hasAnySentItems
      });
    }

    // Taom qo'shilsa stol OCCUPIED bo'ladi va timer boshlanadi
    if (table.status === 'FREE') {
      table.status = 'OCCUPIED';
      table.orderNumber = activeOrderNumber.value;
      table.dailyQueueNumber = getNextDailyQueueNumber();
      table.openedAt = Date.now();
      table.totalPaid = 0;
    }
  }

  function updateTableQuantity(tableId: string, cartItemId: string, delta: number) {
    const table = tables.value.find(t => t.id === tableId);
    if (!table) return;

    const index = table.cart.findIndex(i => i.id === cartItemId);
    if (index > -1) {
      const item = table.cart[index];
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        table.cart.splice(index, 1);
      } else {
        item.quantity = newQty;
        item.totalPrice = item.quantity * item.unitPrice;
      }
    }
  }

  // Oshxonaga yuborilgach, barcha taomlar yuborilgan deb belgilanadi
  function markTableCartAsSent(tableId: string) {
    const table = tables.value.find(t => t.id === tableId);
    if (!table) return;
    table.cart.forEach(item => {
      item.sentQuantity = item.quantity;
      item.isSentToKitchen = true;
      item.isNewAddition = false;
    });
    localStorage.setItem('doston_pos_tables', JSON.stringify(tables.value));
  }

  // Savat tozalash (stol hali ochiq qoladi — mijoz o'tirib turibdi!)
  function clearTableCart(tableId: string) {
    const table = tables.value.find(t => t.id === tableId);
    if (!table) return;
    table.cart = [];
  }

  function setWaiterNote(tableId: string, note: string) {
    const table = tables.value.find(t => t.id === tableId);
    if (table) table.waiterNote = note;
  }

  // ─── ZAL: submitTableOrder ────────────────────────────────────────────────────
  async function submitTableOrder(
    tableId: string,
    paymentType: PaymentType,
    paidAmount: number,
    cashierName: string,
    shiftId: string
  ): Promise<Order | null> {
    if (isSubmittingOrder.value) {
      console.warn('⚠️ Stol buyurtmasi allaqachon yuborilmoqda, takroriy bosish bekor qilindi.');
      return null;
    }

    const table = tables.value.find(t => t.id === tableId);
    if (!table || table.cart.length === 0) return null;

    isSubmittingOrder.value = true;
    const authStore = useAuthStore();

    const tableCartCopy = [...table.cart];
    const subtotal = tableCartCopy.reduce((sum, i) => sum + i.totalPrice, 0);
    const serviceFeePercentVal = serviceFeeEnabled.value ? serviceFeePercent.value : 0;
    const serviceFee = serviceFeeEnabled.value ? Math.round(subtotal * (serviceFeePercentVal / 100)) : 0;
    const totalAmount = subtotal + serviceFee;
    const changeAmount = Math.max(0, (paidAmount || totalAmount) - totalAmount);
    const dailyQueueNumber = table.dailyQueueNumber || getNextDailyQueueNumber(shiftId);
    const cashierFloorInfo = getCashierFloorInfo(authStore.user);
    const isDoZakaz = tableCartCopy.some(i => i.isNewAddition || (i.sentQuantity && i.quantity > i.sentQuantity));

    try {
      const payload = {
        cashierId: authStore.user?.id || 'default',
        shiftId,
        paymentType,
        items: tableCartCopy.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          ingredientDeductions: item.selectedModifiers?.flatMap(m => 
            m.ingredientDeduction ? [{ ingredientId: m.ingredientDeduction.ingredientId, quantity: m.ingredientDeduction.quantity * item.quantity }] : []
          ) || []
        }))
      };

      try {
        const res = await fetchWithTimeout(`${API_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }, 3500);
        
        const body = await res.json();
        const orderData = body.data?.order || body.data || body.order;
        
        if (res.ok && body.success && orderData) {
          const completedOrder = {
            ...orderData,
            dailyQueueNumber,
            cashierFloor: cashierFloorInfo.badge,
            isDoZakaz,
            subtotal,
            serviceFee,
            serviceFeePercent: serviceFeePercentVal,
            paidAmount: paidAmount || totalAmount,
            changeAmount,
            cashierName: cashierName || authStore.user?.fullName || 'Kassir',
            items: tableCartCopy.map(c => ({
              id: 'item-' + Math.random().toString(36).substr(2, 6),
              product: { ...c.product },
              quantity: c.quantity,
              unitPrice: c.unitPrice || c.product.price,
              totalPrice: c.totalPrice,
              selectedModifiers: c.selectedModifiers || []
            }))
          };

          orderHistory.value.unshift(completedOrder);
          _deductIngredients(tableCartCopy);

          table.cart = [];
          table.status = 'FREE';
          table.orderNumber = undefined;
          table.openedAt = null;
          table.totalPaid = 0;
          table.waiterNote = '';

          if (activeTableId.value === tableId) {
            activeTableId.value = null;
            localStorage.removeItem('doston_pos_active_table');
          }

          broadcastSync('ORDER_CREATED');
          return completedOrder;
        }
      } catch (_backendErr) {
        console.warn('Backend unavailable or timed out. Table order saved locally!');
      }

      // Offline table order
      const offlineOrders = JSON.parse(localStorage.getItem('doston_offline_orders') || '[]');
      const tempOrder = {
        id: 'offline-' + Date.now(),
        orderNumber: activeOrderNumber.value++,
        dailyQueueNumber,
        cashierFloor: cashierFloorInfo.badge,
        isDoZakaz,
        totalAmount,
        subtotal,
        serviceFee,
        serviceFeePercent: serviceFeePercentVal,
        paymentType,
        paidAmount: paidAmount || totalAmount,
        changeAmount,
        cashierName: cashierName || authStore.user?.fullName || 'Kassir',
        status: 'COMPLETED',
        createdAt: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        items: tableCartCopy.map(c => ({
          id: 'item-' + Math.random().toString(36).substr(2, 6),
          product: { ...c.product },
          quantity: c.quantity,
          unitPrice: c.unitPrice || c.product.price,
          totalPrice: c.totalPrice,
          selectedModifiers: c.selectedModifiers || []
        })),
        offlinePayload: payload
      };
      
      offlineOrders.push(tempOrder);
      localStorage.setItem('doston_offline_orders', JSON.stringify(offlineOrders));
      
      orderHistory.value.unshift(tempOrder as any);
      _deductIngredients(tableCartCopy);

      table.cart = [];
      table.status = 'FREE';
      table.orderNumber = undefined;
      table.openedAt = null;
      table.totalPaid = 0;
      table.waiterNote = '';

      if (activeTableId.value === tableId) {
        activeTableId.value = null;
        localStorage.removeItem('doston_pos_active_table');
      }
      
      return tempOrder as any;
    } finally {
      isSubmittingOrder.value = false;
    }
  }

  // Admin stolni yopganda — sessiya yakunlanadi
  function closeTable(tableId: string) {
    const table = tables.value.find(t => t.id === tableId);
    if (!table) return;
    table.cart = [];
    table.status = 'FREE';
    table.orderNumber = undefined;
    table.waiterNote = '';
    table.openedAt = null;
    table.totalPaid = 0;
  }

  // ─── Aralash Saboy: Toggle Takeaway on Cart Item ──────────────────────────────
  function toggleCartItemTakeaway(cartItemId: string, tableId?: string) {
    if (tableId || operationMode.value === 'ZAL') {
      const targetTable = tableId ? tables.value.find(t => t.id === tableId) : activeTable.value;
      if (targetTable) {
        const item = targetTable.cart.find(i => i.id === cartItemId);
        if (item) {
          item.isTakeaway = !item.isTakeaway;
        }
      }
    } else {
      const item = cart.value.find(i => i.id === cartItemId);
      if (item) {
        item.isTakeaway = !item.isTakeaway;
      }
    }
  }

  function setCartItemNote(cartItemId: string, note: string, tableId?: string) {
    const list = (tableId || operationMode.value === 'ZAL')
      ? (tableId ? tables.value.find(t => t.id === tableId)?.cart : activeTable.value?.cart)
      : cart.value;
    if (list) {
      const item = list.find(i => i.id === cartItemId);
      if (item) item.customNote = note;
    }
  }

  // ─── Maxsus Taom / Erkin Narx (Custom On-The-Fly Item) ────────────────────────
  function addCustomProduct(name: string, price: number, note?: string) {
    const customProd: Product = {
      id: 'custom-' + Date.now(),
      name: name.trim() || 'Maxsus Taom',
      price: Number(price) || 0,
      categoryId: 'cat-custom',
      categoryName: 'Maxsus',
      imageUrl: '/images/food/lavash_obichniy.jpg',
      recipe: []
    };
    if (operationMode.value === 'ZAL' && activeTableId.value) {
      addToTableCart(activeTableId.value, customProd, [], 1);
      if (note) {
        const targetTable = tables.value.find(t => t.id === activeTableId.value);
        if (targetTable && targetTable.cart.length > 0) {
          targetTable.cart[targetTable.cart.length - 1].customNote = note;
        }
      }
    } else {
      addToCart(customProd, [], 1);
      if (note && cart.value.length > 0) {
        cart.value[cart.value.length - 1].customNote = note;
      }
    }
    toast.success(`"${name}" savatchaga qo'shildi! 🍔`);
  }

  // ─── Stolni Ko'chirish (Transfer) va Birlashtirish (Merge) ────────────────────
  function transferTable(fromTableId: string, toTableId: string) {
    const fromTable = tables.value.find(t => t.id === fromTableId);
    const toTable = tables.value.find(t => t.id === toTableId);
    if (!fromTable || !toTable) return;
    if (fromTable.cart.length === 0) {
      toast.warning('Ko\'chirish uchun stolda buyurtma yo\'q!');
      return;
    }
    if (toTable.status === 'OCCUPIED' && toTable.cart.length > 0) {
      toast.warning(`${toTable.name} band! Iltimos, bo'sh stolni tanlang yoki birlashtirishdan foydalaning.`);
      return;
    }

    toTable.cart = [...fromTable.cart];
    toTable.status = 'OCCUPIED';
    toTable.openedAt = fromTable.openedAt || Date.now();
    toTable.orderNumber = fromTable.orderNumber;
    toTable.waiterNote = fromTable.waiterNote;
    toTable.totalPaid = fromTable.totalPaid;

    fromTable.cart = [];
    fromTable.status = 'FREE';
    fromTable.openedAt = null;
    fromTable.orderNumber = undefined;
    fromTable.waiterNote = '';
    fromTable.totalPaid = 0;

    if (activeTableId.value === fromTableId) {
      activeTableId.value = toTableId;
      localStorage.setItem('doston_pos_active_table', toTableId);
    }
    toast.success(`Buyurtma ${fromTable.name}dan ${toTable.name}ga ko'chirildi! 🔀`);
  }

  function mergeTables(fromTableId: string, toTableId: string) {
    const fromTable = tables.value.find(t => t.id === fromTableId);
    const toTable = tables.value.find(t => t.id === toTableId);
    if (!fromTable || !toTable) return;

    toTable.cart.push(...fromTable.cart);
    toTable.status = 'OCCUPIED';
    if (!toTable.openedAt) toTable.openedAt = fromTable.openedAt || Date.now();
    toTable.waiterNote = (toTable.waiterNote + ' ' + fromTable.waiterNote).trim();

    fromTable.cart = [];
    fromTable.status = 'FREE';
    fromTable.openedAt = null;
    fromTable.orderNumber = undefined;
    fromTable.waiterNote = '';
    fromTable.totalPaid = 0;

    if (activeTableId.value === fromTableId) {
      activeTableId.value = toTableId;
      localStorage.setItem('doston_pos_active_table', toTableId);
    }
    toast.success(`${fromTable.name} hisobi ${toTable.name}ga birlashtirildi! 🔗`);
  }

  // ─── Menu CRUD ────────────────────────────────────────────────────────────────
  async function toggleStopList(productId: string) {
    const prod = products.value.find(p => p.id === productId);
    if (!prod) return;
    prod.isStopList = !prod.isStopList;
    toast.info(`"${prod.name}" ${prod.isStopList ? 'Stop-Listga qo\'shildi' : 'Stop-Listdan chiqarildi'}!`, 2500);
    broadcastSync('PRODUCTS_UPDATED');

    try {
      await fetchWithTimeout(`${API_URL}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isStopList: prod.isStopList })
      });
    } catch (e) {
      console.warn('Backend stoplist sync deferred (offline):', e);
    }
  }

  async function saveProduct(productData: Partial<Product> & { id?: string }) {
    // 1. Optimistic immediate local update (0ms delay)
    if (productData.id) {
      const index = products.value.findIndex(p => p.id === productData.id);
      if (index > -1) {
        products.value[index] = { ...products.value[index], ...productData } as Product;
      }
    } else {
      const newId = 'prod-custom-' + Date.now();
      const newProd: Product = {
        id: newId,
        name: productData.name || 'Yangi Taom',
        price: Number(productData.price) || 0,
        categoryId: productData.categoryId || 'cat-lavash',
        categoryName: productData.categoryName || 'Lavash',
        imageUrl: productData.imageUrl || '/images/food/lavash_obichniy.jpg',
        isStopList: productData.isStopList || false,
        recipe: productData.recipe || []
      };
      products.value.unshift(newProd);
      productData.id = newId;
    }
    toast.success('Taom muvaffaqiyatli saqlandi! ✨', 3000);

    // 2. Background sync to backend
    try {
      if (productData.id) {
        await fetchWithTimeout(`${API_URL}/products/${productData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
      } else {
        await fetchWithTimeout(`${API_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
      }
    } catch (e: any) {
      console.warn('Backendga sinxronlash keyinroq amalga oshiriladi (Lokal xotirada saqlandi):', e);
    }
  }

  async function deleteProduct(productId: string) {
    const index = products.value.findIndex(p => p.id === productId);
    if (index > -1) {
      products.value.splice(index, 1);
      toast.success('Taom o\'chirildi! 🗑️', 3000);
    }
    try {
      await fetchWithTimeout(`${API_URL}/products/${productId}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Backend delete sync deferred (offline):', e);
    }
  }

  function addCategory(name: string) {
    if (!name.trim()) return;
    const newCat: Category = {
      id: 'cat-custom-' + Date.now(),
      name: name.trim(),
      count: 0,
      isHidden: false
    };
    categories.value.push(newCat);
    toast.success(`"${name.trim()}" bo'limi qo'shildi! 📁`, 3000);
  }

  function updateCategory(id: string, name: string) {
    const cat = categories.value.find(c => c.id === id);
    if (cat && name.trim()) {
      const oldName = cat.name;
      cat.name = name.trim();
      // Also update products with the old category name
      products.value.forEach(p => {
        if (p.categoryId === id || p.categoryName === oldName) {
          p.categoryName = cat.name;
        }
      });
      toast.success('Kategoriya nomi yangilandi!', 3000);
    }
  }

  function deleteCategory(id: string) {
    const index = categories.value.findIndex(c => c.id === id);
    if (index > -1) {
      categories.value.splice(index, 1);
      toast.success('Kategoriya o\'chirildi!', 3000);
    }
  }

  function toggleCategoryStatus(id: string) {
    const cat = categories.value.find(c => c.id === id);
    if (cat) cat.isHidden = !cat.isHidden;
  }

  return {
    // State
    ingredients,
    lowStockIngredients,
    categories,
    visibleCategories,
    fetchProducts,
    fetchOrders,
    selectedCategory,
    selectedOrderType,
    searchQuery,
    products,
    filteredProducts,

    // SABOY cart
    cart,
    cartSubtotal,

    // Operation Mode
    operationMode,
    setOperationMode,

    // ZAL tables
    tables,
    activeTableId,
    activeTable,
    activeTableSubtotal,
    loadTables,
    setActiveTable,
    clearActiveTable,

    // Order History & Clean Reset
    orderHistory,
    activeOrderNumber,
    clearAllSalesHistory,

    // SABOY methods
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    submitOrder,
    submitSaboyKitchenOrder,
    updateOrderStatus,
    checkLowStockAlerts,

    // ZAL methods
    addToTableCart,
    updateTableQuantity,
    removeTableCartItem,
    clearTableCart,
    markTableCartAsSent,
    closeTable,
    setWaiterNote,
    submitTableOrder,

    // Aralash Saboy, Erkin Taom va Stol Ko'chirish
    toggleCartItemTakeaway,
    setCartItemNote,
    addCustomProduct,
    transferTable,
    mergeTables,

    // 7% Xizmat haqi (Service Fee)
    serviceFeeEnabled,
    serviceFeePercent,
    serviceFeeOnlyZal,
    setServiceFeeConfig,
    activeServiceFeeAmount,
    activeTotalWithServiceFee,

    // Network & Sync State
    isOnline,
    isServerConnected,
    lastSyncTime,
    isSyncingOrders,
    isSyncingProducts,
    pendingOfflineCount,
    syncOfflineOrders,
    forceRefreshMenu,
    broadcastSync,

    // Menu CRUD
    toggleStopList,
    saveProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus
  };
});
