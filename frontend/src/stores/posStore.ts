import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import {
  Product, CartItem, Order, PaymentType, OrderType,
  Ingredient, Modifier, Category, OperationMode, Table
} from '../types/pos';
import { initialIngredients, initialCategories, initialProducts } from '../data/menu';
import { useAuthStore } from './authStore';
import { useToastStore } from './toastStore';


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
  const storedCategories = localStorage.getItem('doston_pos_categories');
  let parsedCategories: Category[] = storedCategories ? JSON.parse(storedCategories) : initialCategories;
  
  // Filter out any obsolete 'cat-all' entry from local storage
  parsedCategories = parsedCategories.filter(c => c.id !== 'cat-all' && c.name !== 'Barcha Taomlar');

  // Merge missing initial categories (e.g. if new categories like Drinks were added to codebase)
  initialCategories.forEach(initialCat => {
    if (!parsedCategories.find(c => c.id === initialCat.id || c.name.toLowerCase() === initialCat.name.toLowerCase())) {
      parsedCategories.push(initialCat);
    }
  });

  const categories = ref<Category[]>(parsedCategories);
  watch(categories, (newVal) => localStorage.setItem('doston_pos_categories', JSON.stringify(newVal)), { deep: true });
  
  const selectedCategory = ref('cat-all');
  const searchQuery = ref('');

  // ─── Products ────────────────────────────────────────────────────────────────
  // Auto-clean any corrupted localStorage products (e.g. prod-lav-1 or General)
  const storedProducts = localStorage.getItem('doston_pos_products');
  let loadedProducts: Product[] = initialProducts;
  if (storedProducts) {
    try {
      const parsed = JSON.parse(storedProducts);
      if (Array.isArray(parsed)) {
        loadedProducts = initialProducts.map(ip => {
          const found = parsed.find((p: any) => p.id === ip.id);
          if (found) {
            const hasValidName = found.name && !found.name.startsWith('prod-');
            const hasValidCategory = found.categoryName && found.categoryName !== 'General';
            return {
              ...ip,
              name: hasValidName ? found.name : ip.name,
              categoryName: hasValidCategory ? found.categoryName : ip.categoryName,
              price: found.price || ip.price,
              isStopList: found.isStopList ?? ip.isStopList
            };
          }
          return ip;
        });
      }
    } catch (e) {
      console.warn('Failed to parse local stored products:', e);
    }
  }

  const products = ref<Product[]>(loadedProducts);
  watch(products, (newVal) => localStorage.setItem('doston_pos_products', JSON.stringify(newVal)), { deep: true });

  async function fetchProducts() {
    try {
      const res = await fetchWithTimeout(`${API_URL}/products`);
      if (res.ok) {
        const body = await res.json();
        const backendProducts = body.success ? body.data : [];
        
        products.value = initialProducts.map(localProd => {
          const backendMatch = backendProducts.find((bp: any) =>
            bp.id === localProd.id || 
            bp.name?.toLowerCase().trim() === localProd.name?.toLowerCase().trim()
          );
          
          if (backendMatch) {
            const hasValidName = backendMatch.name && !backendMatch.name.startsWith('prod-');
            const hasValidCategory = backendMatch.categoryName && backendMatch.categoryName !== 'General';
            return {
              ...localProd,
              id: backendMatch.id || localProd.id,
              name: hasValidName ? backendMatch.name : localProd.name,
              price: backendMatch.price || localProd.price,
              categoryName: hasValidCategory ? backendMatch.categoryName : localProd.categoryName,
              imageUrl: (backendMatch.imageUrl && !backendMatch.imageUrl.includes('placeholder')) ? backendMatch.imageUrl : localProd.imageUrl,
              isStopList: backendMatch.isStopList ?? localProd.isStopList
            };
          }
          return localProd;
        });
      }
    } catch (e) {
      console.warn('Backend offline — frontendning mahalliy menyu ma\'lumotlari ishlatilmoqda:', e);
    }
  }

  // ─── SABOY Cart ──────────────────────────────────────────────────────────────
  const cart = ref<CartItem[]>([]);

  // ─── Order Tracking ──────────────────────────────────────────────────────────
  const activeOrderNumber = ref(101);
  const orderHistory = ref<Order[]>([]);
  const selectedOrderType = ref<OrderType>('DINE_IN');

  async function fetchOrders() {
    try {
      const res = await fetchWithTimeout(`${API_URL}/orders`);
      if (res.ok) {
        const body = await res.json();
        if (body.success) {
          orderHistory.value = body.data;
        }
      }
    } catch (e) {
      console.warn('Backend API unreachable, using local orders history:', e);
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
      alert(`"${product.name}" vaqtinchalik yopilgan (Stop-List)! Ushbu taomni sotish taqiqlangan.`);
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

  // ─── SABOY: submitOrder ───────────────────────────────────────────────────────
  async function submitOrder(
    paymentType: PaymentType,
    _paidAmount: number,
    _cashierName: string,
    shiftId: string,
    _orderType?: OrderType
  ): Promise<Order | null> {
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

      const res = await fetchWithTimeout(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, 8000);
      
      const body = await res.json();
      
      if (res.ok && body.success) {
        const cartItemsCopy = [...cart.value];
        orderHistory.value.unshift(body.data.order);
        clearCart();
        _deductIngredients(cartItemsCopy);
        return body.data.order;
      } else {
        alert(body.error || 'Buyurtma saqlashda xatolik');
        return null;
      }
    } catch (e: any) {
      console.warn('Backend unavailable. Order saved offline!', e);
      
      // B2B Enterprise Mastery: Offline Queue
      const offlineOrders = JSON.parse(localStorage.getItem('doston_offline_orders') || '[]');
      const tempOrder = {
        id: 'offline-' + Date.now(),
        orderNumber: Date.now() % 10000,
        totalAmount: cartSubtotal.value,
        paymentType,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        items: cart.value.map(c => ({ product: c.product, quantity: c.quantity, totalPrice: c.totalPrice })),
        offlinePayload: {
          cashierId: authStore.user?.id || 'default',
          shiftId,
          paymentType,
          items: cart.value.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          }))
        }
      };
      
      offlineOrders.push(tempOrder);
      localStorage.setItem('doston_offline_orders', JSON.stringify(offlineOrders));
      
      orderHistory.value.unshift(tempOrder as any);
      const cartItemsCopy = [...cart.value];
      clearCart();
      _deductIngredients(cartItemsCopy);
      
      toast.success('Internet yo\'q. Buyurtma oflayn saqlandi!', 3000);
      return tempOrder as any;
    }
  }

  // ─── ZAL: addToTableCart ──────────────────────────────────────────────────────
  function addToTableCart(tableId: string, product: Product, selectedModifiers: Modifier[] = [], customQuantity: number = 1) {
    const cat = categories.value.find(c => c.id === product.categoryId);
    if (product.isStopList || cat?.isHidden) {
      alert(`"${product.name}" vaqtinchalik yopilgan (Stop-List)!`);
      return;
    }

    const table = tables.value.find(t => t.id === tableId);
    if (!table) return;

    const modPriceSum = selectedModifiers.reduce((acc, m) => acc + m.price, 0);
    const unitPrice = product.price + modPriceSum;
    const modIds = selectedModifiers.map(m => m.id).sort().join(',');

    const existingIndex = table.cart.findIndex(item => {
      const itemModIds = item.selectedModifiers.map(m => m.modifierId).sort().join(',');
      return item.product.id === product.id && itemModIds === modIds;
    });

    if (existingIndex > -1) {
      table.cart[existingIndex].quantity = Number((table.cart[existingIndex].quantity + customQuantity).toFixed(3));
      table.cart[existingIndex].totalPrice = Math.round(table.cart[existingIndex].quantity * table.cart[existingIndex].unitPrice);
    } else {
      table.cart.push({
        id: 'tcart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        product,
        quantity: customQuantity,
        selectedModifiers: selectedModifiers.map(m => ({ modifierId: m.id, name: m.name, price: m.price, ingredientDeduction: m.ingredientDeduction })),
        unitPrice,
        totalPrice: Math.round(customQuantity * unitPrice)
      });
    }

    // Taom qo'shilsa stol OCCUPIED bo'ladi va timer boshlanadi
    if (table.status === 'FREE') {
      table.status = 'OCCUPIED';
      table.orderNumber = activeOrderNumber.value;
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
    // NOT: savat bo'shsa ham stol ochiq qoladi — faqat closeTable() yopadi
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
    _paidAmount: number,
    _cashierName: string,
    shiftId: string
  ): Promise<Order | null> {
    const table = tables.value.find(t => t.id === tableId);
    if (!table || table.cart.length === 0) return null;

    const authStore = useAuthStore();

    try {
      const payload = {
        cashierId: authStore.user?.id || 'default',
        shiftId,
        paymentType,
        items: table.cart.map(item => ({
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

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const body = await res.json();
      
      if (res.ok && body.success) {
        orderHistory.value.unshift(body.data.order);
        
        // Optimistically deduct
        _deductIngredients(table.cart);

        // ✅ Stol to'liq yopiladi va bo'shatiladi
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

        return body.data.order;
      } else {
        alert(body.error || 'Buyurtma saqlashda xatolik');
        return null;
      }
    } catch (e: any) {
      console.warn('Backend unavailable. Table Order saved offline!', e);
      
      const offlineOrders = JSON.parse(localStorage.getItem('doston_offline_orders') || '[]');
      const tempOrder = {
        id: 'offline-' + Date.now(),
        orderNumber: Date.now() % 10000,
        totalAmount: table.cart.reduce((sum, i) => sum + i.totalPrice, 0),
        paymentType,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        items: table.cart.map(c => ({ product: c.product, quantity: c.quantity, totalPrice: c.totalPrice })),
        offlinePayload: {
          cashierId: authStore.user?.id || 'default',
          shiftId,
          paymentType,
          items: table.cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          }))
        }
      };
      
      offlineOrders.push(tempOrder);
      localStorage.setItem('doston_offline_orders', JSON.stringify(offlineOrders));
      
      orderHistory.value.unshift(tempOrder as any);
      _deductIngredients(table.cart);

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
      
      toast.success('Internet yo\'q. Stol oflayn yopildi!', 3000);
      return tempOrder as any;
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

  // ─── Menu CRUD ────────────────────────────────────────────────────────────────
  async function toggleStopList(productId: string) {
    const prod = products.value.find(p => p.id === productId);
    if (!prod) return;
    prod.isStopList = !prod.isStopList;
    toast.info(prod.isStopList ? `"${prod.name}" Stop-listga olindi ⛔` : `"${prod.name}" sotuvga chiqarildi ✅`, 2500);

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

    // Order History
    orderHistory,
    activeOrderNumber,

    // SABOY methods
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    submitOrder,
    checkLowStockAlerts,

    // ZAL methods
    addToTableCart,
    updateTableQuantity,
    removeTableCartItem,
    clearTableCart,
    closeTable,
    setWaiterNote,
    submitTableOrder,

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
