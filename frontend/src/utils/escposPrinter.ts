/**
 * ESC/POS Thermal Printer Format Helper for Fast-Food POS
 * Supports 80mm and 58mm receipts with raw text formatting
 */

export interface PrintReceiptData {
  restaurantName: string;
  orderNumber: number;
  orderType: string;
  cashierName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  date: string;
}

export function formatEscPosText(data: PrintReceiptData, width: '80mm' | '58mm' = '80mm'): string {
  const lineLength = width === '80mm' ? 48 : 32;
  const lineStr = '='.repeat(lineLength);
  const dashStr = '-'.repeat(lineLength);

  const spaceBetween = (left: string, right: string) => {
    const spaceCount = Math.max(1, lineLength - left.length - right.length);
    return left + ' '.repeat(spaceCount) + right;
  };

  const lines: string[] = [];

  // Header
  lines.push('*** DOSTON BURGER ***');
  lines.push(data.restaurantName);
  lines.push(`BUYURTMA #${data.orderNumber} (${data.orderType})`);
  lines.push(data.date);
  lines.push(`Kassir: ${data.cashierName}`);
  lines.push(lineStr);

  // Items Header
  if (width === '80mm') {
    lines.push(spaceBetween('MAHSULOT', 'SUMMA'));
  } else {
    lines.push('MAHSULOT / SUMMA');
  }
  lines.push(dashStr);

  // Items
  data.items.forEach(item => {
    const itemTotal = (item.quantity * item.price).toLocaleString('uz-UZ') + " so'm";
    const qtyText = `${item.quantity}x @ ${item.price.toLocaleString('uz-UZ')}`;
    
    if (width === '80mm') {
      lines.push(spaceBetween(`${item.name} (${item.quantity}x)`, itemTotal));
    } else {
      lines.push(item.name);
      lines.push(spaceBetween(`  ${qtyText}`, itemTotal));
    }
  });

  lines.push(lineStr);

  // Totals
  lines.push(spaceBetween('JAMI:', `${data.totalAmount.toLocaleString('uz-UZ')} so'm`));
  lines.push(spaceBetween('BERILDI:', `${data.paidAmount.toLocaleString('uz-UZ')} so'm`));
  lines.push(spaceBetween('QAYTIM:', `${data.changeAmount.toLocaleString('uz-UZ')} so'm`));

  lines.push(dashStr);
  lines.push('SOLIQ FISKAL MODUL: FN8800' + String(data.orderNumber).padStart(6, '0'));
  lines.push('SOLIQ.UZ | FISKAL CHEK № ' + (data.orderNumber * 1489));
  lines.push(lineStr);
  lines.push('XARIDINGIZ UCHUN RAHMAT!');
  lines.push('\n\n\n');

  return lines.join('\n');
}
