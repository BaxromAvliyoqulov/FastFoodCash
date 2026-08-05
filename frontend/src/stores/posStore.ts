import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import {
  Product, CartItem, Order, PaymentType, OrderType,
  Ingredient, Modifier, Category, OperationMode, Table
} from '../types/pos';
import { initialIngredients, initialCategories, initialProducts } from '../data/menu';
import { useAuthStore } from './authStore';
import { useShiftStore } from './shiftStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// ─── Helper: 30 ta bo'sh stol yaratish ────────────────────────────────────────
function createInitialTables(): Table[] {
  return Array.from({ length: 30 }, (_, i) => ({
    id: `table-${i + 1}`,
    number: i + 1,
    status: 'FREE' as const,
    cart: [],
    openedAt: null,
    waiterNote: '',
    totalPaid: 0
  }));
}

export const usePosStore = defineStore('pos', () => {
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
  const categories = ref<Category[]>(
    storedCategories ? JSON.parse(storedCategories) : initialCategories
  );
  watch(categories, (newVal) => localStorage.setItem('doston_pos_categories', JSON.stringify(newVal)), { deep: true });
  
  const selectedCategory = ref('cat-all');
  const searchQuery = ref('');

  // ─── Products ────────────────────────────────────────────────────────────────
  const products = ref<Product[]>(initialProducts);

  async function fetchProducts() {
    try {
      const res = await fetch(`${API_URL}/products`);
      if (res.ok) {
        products.value = await res.json();
      }
    } catch (e) {
      console.error('Fetch products error:', e);
    }
  }

  // ─── SABOY Cart ──────────────────────────────────────────────────────────────
  const cart = ref<CartItem[]>([]);

  // ─── Order Tracking ──────────────────────────────────────────────────────────
  const activeOrderNumber = ref(101);
  const orderHistory = ref<Order[]>([]);
  const selectedOrderType = ref<OrderType>('DINE_IN');

  // ─── Operation Mode: ZAL | SABOY ─────────────────────────────────────────────
  const operationMode = ref<OperationMode>(
    (localStorage.getItem('doston_pos_mode') as OperationMode) || 'ZAL'
  );

  function setOperationMode(mode: OperationMode) {
    operationMode.value = mode;
    localStorage.setItem('doston_pos_mode', mode);
    if (mode === 'ZAL' && !activeTableId.value) {
      const firstFree = tables.value.find(t => t.status === 'FREE');
      if (firstFree) {
        activeTableId.value = firstFree.id;
        localStorage.setItem('doston_pos_active_table', firstFree.id);
      }
    }
  }

  // ─── ZAL: Tables ─────────────────────────────────────────────────────────────
  const storedTables = localStorage.getItem('doston_pos_tables');
  const tables = ref<Table[]>(
    storedTables ? JSON.parse(storedTables) : createInitialTables()
  );
  watch(tables, (newVal) => localStorage.setItem('doston_pos_tables', JSON.stringify(newVal)), { deep: true });
  
  const activeTableId = ref<string | null>(
    localStorage.getItem('doston_pos_active_table') || null
  );

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
    const hiddenCategoryIds = new Set(
      categories.value.filter(c => c.isHidden).map(c => c.id)
    );
    result = result.filter(p => !hiddenCategoryIds.has(p.categoryId));

    if (selectedCategory.value !== 'cat-all') {
      result = result.filter(p => p.categoryId === selectedCategory.value);
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

  const visibleCategories = computed(() =>
    categories.value.filter(c => !c.isHidden)
  );

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
  function addToCart(product: Product, selectedModifiers: Modifier[] = []) {
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
      cart.value[existingIndex].quantity += 1;
      cart.value[existingIndex].totalPrice =
        cart.value[existingIndex].quantity * cart.value[existingIndex].unitPrice;
    } else {
      cart.value.push({
        id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        product,
        quantity: 1,
        selectedModifiers: selectedModifiers.map(m => ({ modifierId: m.id, name: m.name, price: m.price })),
        unitPrice,
        totalPrice: unitPrice
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

  // ─── SABOY: submitOrder ───────────────────────────────────────────────────────
  async function submitOrder(
    paymentType: PaymentType,
    paidAmount: number,
    cashierName: string,
    shiftId: string,
    orderType?: OrderType
  ): Promise<Order | null> {
    const authStore = useAuthStore();
    
    try {
      const payload = {
        cashierId: authStore.user?.id || 'default',
        shiftId,
        paymentType,
        items: cart.value.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        orderHistory.value.unshift(data.order);
        clearCart();
        
        // Optimistically deduct local ingredients (backend already does it, but we want UI to reflect instantly if we don't re-fetch)
        _deductIngredients(cart.value);
        
        return data.order;
      } else {
        alert(data.error || 'Buyurtma saqlashda xatolik');
        return null;
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  // ─── ZAL: addToTableCart ──────────────────────────────────────────────────────
  function addToTableCart(tableId: string, product: Product, selectedModifiers: Modifier[] = []) {
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
      table.cart[existingIndex].quantity += 1;
      table.cart[existingIndex].totalPrice =
        table.cart[existingIndex].quantity * table.cart[existingIndex].unitPrice;
    } else {
      table.cart.push({
        id: 'tcart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        product,
        quantity: 1,
        selectedModifiers: selectedModifiers.map(m => ({ modifierId: m.id, name: m.name, price: m.price })),
        unitPrice,
        totalPrice: unitPrice
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
    paidAmount: number,
    cashierName: string,
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
          quantity: item.quantity
        }))
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        orderHistory.value.unshift(data.order);
        
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

        return data.order;
      } else {
        alert(data.error || 'Buyurtma saqlashda xatolik');
        return null;
      }
    } catch (e) {
      console.error(e);
      return null;
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
    try {
      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isStopList: !prod.isStopList })
      });
      if (res.ok) {
        prod.isStopList = !prod.isStopList;
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function saveProduct(productData: Partial<Product> & { id?: string }) {
    try {
      if (productData.id) {
        const res = await fetch(`${API_URL}/products/${productData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        if (res.ok) {
          const updated = await res.json();
          const index = products.value.findIndex(p => p.id === productData.id);
          if (index > -1) {
            products.value[index] = { ...products.value[index], ...updated } as Product;
          }
        }
      } else {
        const res = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        if (res.ok) {
          const newProd = await res.json();
          products.value.unshift(newProd as Product);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteProduct(productId: string) {
    try {
      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const index = products.value.findIndex(p => p.id === productId);
        if (index > -1) products.value.splice(index, 1);
      }
    } catch (e) {
      console.error(e);
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
  }

  function updateCategory(id: string, name: string) {
    const cat = categories.value.find(c => c.id === id);
    if (cat && name.trim()) {
      cat.name = name.trim();
      products.value.forEach(p => {
        if (p.categoryId === id) p.categoryName = name.trim();
      });
    }
  }

  function deleteCategory(id: string) {
    const index = categories.value.findIndex(c => c.id === id);
    if (index > -1) categories.value.splice(index, 1);
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
    setActiveTable,
    clearActiveTable,

    // Order History
    orderHistory,
    activeOrderNumber,

    // SABOY methods
    addToCart,
    updateQuantity,
    clearCart,
    submitOrder,
    checkLowStockAlerts,

    // ZAL methods
    addToTableCart,
    updateTableQuantity,
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
