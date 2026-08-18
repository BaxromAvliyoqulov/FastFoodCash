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
  minThreshold?: number; // Kam qolganida ogohlantirish uchun minimal miqdor
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
  unit?: 'PIECE' | 'KG' | 'GRAM';
  isWeighted?: boolean;
  imageUrl: string;
  recipe: RecipeItem[];
  availableModifiers?: Modifier[];
  isStopList?: boolean; // Stop-List toggle
}

export interface SelectedModifier {
  modifierId: string;
  name: string;
  price: number;
  ingredientDeduction?: {
    ingredientId: string;
    quantity: number;
  };
}

export interface CartItem {
  id: string; // unique cart item id
  product: Product;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  unitPrice: number;
  totalPrice: number;
  isTakeaway?: boolean; // Zalda o'tirib buyurtma qilganda Saboy (0% xizmat haqi) belgisi
  customNote?: string;  // Maxsus istak / o'lcham (masalan: "50 sm", "Piyozsiz")
  sentQuantity?: number; // Oldin oshxonaga yuborilgan miqdor
  isSentToKitchen?: boolean; // Oldin oshxonaga ketganmi
  isNewAddition?: boolean; // Do-zakaz (yangi qo'shilgan) taommi
}

export interface Order {
  id: string;
  orderNumber: number;
  dailyQueueNumber?: number; // Kunlik avtomatik navbat raqami (#1, #2, ...)
  shiftId: string;
  cashierName: string;
  cashierFloor?: string; // "KASSA 1 (1-Qavat)" yoki "KASSA 2 (2-Qavat)"
  orderType: OrderType; // DINE_IN | TAKEAWAY | DELIVERY
  tableId?: string;       // Zal rejimida stol ID si
  tableNumber?: number;   // Zal rejimida stol raqami
  waiterNote?: string;    // Ofitsiant izohi
  items: CartItem[];
  subtotal?: number;      // Taomlar jami
  serviceFee?: number;    // 7% Xizmat haqi summasi
  serviceFeePercent?: number; // Masalan: 7
  totalAmount: number;    // Subtotal + serviceFee
  paymentType: PaymentType;
  paidAmount: number;
  changeAmount: number;
  status: 'COOKING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  isDoZakaz?: boolean;   // Buyurtmaga qo'shimcha taom qo'shilganmi
}

export type TableStatus = 'FREE' | 'OCCUPIED';

export interface Table {
  id: string;           // 'table-1' ... 'table-10'
  number: number;       // 1 ... 10
  name: string;
  isActive: boolean;
  status: TableStatus;
  cart: CartItem[];     // Har bir stolning o'z alohida savati
  openedAt: number | null;   // Date.now() — stol band bo'lgan vaqt (timer uchun)
  orderNumber?: number;      // Birinchi buyurtma raqami
  dailyQueueNumber?: number; // Kunlik/Smena navbat raqami (#1, #2, ...)
  waiterNote: string;        // Ofitsiant izohi maydoni
  totalPaid: number;         // Sessiya davomida to'langan jami summa

}

export interface ShiftExpense {
  id: string;
  amount: number;
  reason: string;
  time: string;
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
  expenses: ShiftExpense[];
}

export interface ShiftCashAudit {
  id: string;
  shiftId: string;
  cashierName?: string;
  openedAt?: string;
  closedAt?: string;
  initialCash: number;
  totalRevenue?: number;
  totalCashSales?: number;
  totalCardSales?: number;
  totalExpenses: number;
  expectedCash: number;
  declaredCash: number;
  declaredCard: number;
  declaredQr: number;
  difference: number; // declared - expected
  status: 'BALANCED' | 'SHORTAGE' | 'SURPLUS';
  ordersCount?: number;
  expensesList?: ShiftExpense[];
  cashier1Stats?: { total: number; cash: number; card: number; count: number };
  cashier2Stats?: { total: number; cash: number; card: number; count: number };
  notes?: string;
  createdAt: string;
}
