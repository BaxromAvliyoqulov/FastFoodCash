import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Product, CartItem, Order, PaymentType, OrderType,
  Ingredient, Modifier, Category, OperationMode, Table
} from '../types/pos';
import { initialIngredients, initialCategories, initialProducts } from '../data/menu';

// ─── Helper: 10 ta bo'sh stol yaratish ────────────────────────────────────────
function createInitialTables(): Table[] {
  return Array.from({ length: 10 }, (_, i) => ({
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

  // ─── Categories ──────────────────────────────────────────────────────────────
  const categories = ref<Category[]>(initialCategories);
  const selectedCategory = ref('cat-all');
  const searchQuery = ref('');

  // ─── Products ────────────────────────────────────────────────────────────────
  const products = ref<Product[]>(initialProducts);

  // ─── SABOY Cart ──────────────────────────────────────────────────────────────
  const cart = ref<CartItem[]>([]);

  // ─── Order Tracking ──────────────────────────────────────────────────────────
  const activeOrderNumber = ref(101);
  const orderHistory = ref<Order[]>([]);
  const selectedOrderType = ref<OrderType>('DINE_IN');

  // ─── Operation Mode: SABOY | ZAL ─────────────────────────────────────────────
  const operationMode = ref<OperationMode>(
    (localStorage.getItem('doston_pos_mode') as OperationMode) || 'SABOY'
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
  const tables = ref<Table[]>(createInitialTables());
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
  function submitOrder(
    paymentType: PaymentType,
    paidAmount: number,
    cashierName: string,
    shiftId: string,
    orderType?: OrderType
  ): Order {
    const totalAmount = cartSubtotal.value;
    const changeAmount = Math.max(0, paidAmount - totalAmount);
    _deductIngredients(cart.value);

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber: activeOrderNumber.value++,
      shiftId,
      cashierName,
      orderType: orderType || selectedOrderType.value,
      items: [...cart.value],
      totalAmount,
      paymentType,
      paidAmount,
      changeAmount,
      status: 'COOKING',
      createdAt: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    };

    orderHistory.value.unshift(newOrder);
    clearCart();
    return newOrder;
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
  function submitTableOrder(
    tableId: string,
    paymentType: PaymentType,
    paidAmount: number,
    cashierName: string,
    shiftId: string
  ): Order | null {
    const table = tables.value.find(t => t.id === tableId);
    if (!table || table.cart.length === 0) return null;

    const totalAmount = table.cart.reduce((s, i) => s + i.totalPrice, 0);
    const changeAmount = Math.max(0, paidAmount - totalAmount);
    _deductIngredients(table.cart);

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber: activeOrderNumber.value++,
      shiftId,
      cashierName,
      orderType: 'DINE_IN',
      tableId: table.id,
      tableNumber: table.number,
      waiterNote: table.waiterNote || undefined,
      items: [...table.cart],
      totalAmount,
      paymentType,
      paidAmount,
      changeAmount,
      status: 'COOKING',
      createdAt: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    };

    orderHistory.value.unshift(newOrder);

    // ✅ Savat tozalanadi LEKIN stol OCCUPIED qoladi!
    // Mijoz hali o'tiribdi — yana buyurtma berishi mumkin.
    // Stolni yopish faqat admin "Stolni Yopish" tugmasi bilan qiladi.
    table.cart = [];
    table.totalPaid += totalAmount;
    // waiterNote saqlanadi (mijoz uchun maxsus izoh)

    return newOrder;
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
  function toggleStopList(productId: string) {
    const prod = products.value.find(p => p.id === productId);
    if (prod) prod.isStopList = !prod.isStopList;
  }

  function saveProduct(productData: Partial<Product> & { id?: string }) {
    if (productData.id) {
      const index = products.value.findIndex(p => p.id === productData.id);
      if (index > -1) {
        products.value[index] = { ...products.value[index], ...productData } as Product;
      }
    } else {
      const newProd: Product = {
        id: 'prod-custom-' + Date.now(),
        categoryId: productData.categoryId || 'cat-burger',
        categoryName: productData.categoryName || 'Burger',
        name: productData.name || 'Yangi Taom',
        price: productData.price || 25000,
        imageUrl: productData.imageUrl || '/images/burger/gamburger.png',
        recipe: productData.recipe || []
      };
      products.value.push(newProd);
    }
  }

  function deleteProduct(productId: string) {
    const index = products.value.findIndex(p => p.id === productId);
    if (index > -1) products.value.splice(index, 1);
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
