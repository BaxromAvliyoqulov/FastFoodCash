export type PaymentType = 'CASH' | 'CARD' | 'CLICK_PAYME' | 'DELIVERY_PARTNER';

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'; // Zalda, Saboy (O'zi bilan), Dostavka

export type OperationMode = 'SABOY' | 'ZAL';

export interface Category {
  id: string;
  name: string;
  count?: number;
  isHidden?: boolean; // Yopib qo'yish (Disable category in POS)
}

export interface Ingredient {
  id: string;
  name: string;
  unit: 'GRAM' | 'KG' | 'LITER' | 'PIECE';
  currentStock: number;
  costPerUnit: number;
}

export interface RecipeItem {
  ingredientId: string;
  ingredientName: string;
  quantityRequired: number; // e.g. 0.150 for 150g or 1 for 1 piece
  unit: string;
}

export interface Modifier {
  id: string;
  name: string;
  price: number;
  ingredientDeduction?: {
    ingredientId: string;
    quantity: number;
  };
}

export interface Product {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  price: number;
  imageUrl: string;
  recipe: RecipeItem[];
  availableModifiers?: Modifier[];
  isStopList?: boolean; // Stop-List toggle
}

export interface SelectedModifier {
  modifierId: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // unique cart item id
  product: Product;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  shiftId: string;
  cashierName: string;
  orderType: OrderType; // DINE_IN | TAKEAWAY | DELIVERY
  tableId?: string;       // Zal rejimida stol ID si
  tableNumber?: number;   // Zal rejimida stol raqami
  waiterNote?: string;    // Ofitsiant izohi
  items: CartItem[];
  totalAmount: number;
  paymentType: PaymentType;
  paidAmount: number;
  changeAmount: number;
  status: 'COOKING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export type TableStatus = 'FREE' | 'OCCUPIED';

export interface Table {
  id: string;           // 'table-1' ... 'table-10'
  number: number;       // 1 ... 10
  status: TableStatus;
  cart: CartItem[];     // Har bir stolning o'z alohida savati
  openedAt: number | null;   // Date.now() — stol band bo'lgan vaqt (timer uchun)
  orderNumber?: number;      // Birinchi buyurtma raqami
  waiterNote: string;        // Ofitsiant izohi maydoni
  totalPaid: number;         // Sessiya davomida to'langan jami summa

}

export interface Shift {
  id: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  initialCash: number;
  status: 'OPEN' | 'CLOSED';
  totalCashSales: number;
  totalCardSales: number;
  totalQrSales: number;
}

export interface ShiftCashAudit {
  id: string;
  shiftId: string;
  expectedCash: number;
  declaredCash: number;
  difference: number; // declared - expected
  declaredCard: number;
  declaredQr: number;
  status: 'BALANCED' | 'SHORTAGE' | 'SURPLUS';
  notes?: string;
  createdAt: string;
}
