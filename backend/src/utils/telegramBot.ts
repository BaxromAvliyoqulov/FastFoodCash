import { prisma } from '../db';
import { sendTelegramMessage } from './telegram';

export async function processTelegramCommand(text: string, chatId?: string): Promise<string> {
  const cmd = text.trim().toLowerCase();

  if (cmd.startsWith('/start') || cmd.startsWith('salom')) {
    return `
🤖 <b>FastFoodCash Manager Bot</b>

Hush kelibsiz! Buyruqlar ro'yxati:
📊 <b>/stats</b> — Bugungi jami savdo va tushumlar
💸 <b>/expenses</b> — Bugungi kassadan qilingan rasxodlar
⚠️ <b>/lowstock</b> — Kam qolgan ingrediyentlar ro'yxati
    `;
  }

  if (cmd.startsWith('/stats')) {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const orders = await prisma.order.findMany({
        where: {
          createdAt: { gte: todayStart },
          status: 'COMPLETED'
        }
      });

      const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const cashRevenue = orders.filter(o => o.paymentType === 'CASH').reduce((sum, o) => sum + o.totalAmount, 0);
      const cardRevenue = orders.filter(o => o.paymentType === 'CARD').reduce((sum, o) => sum + o.totalAmount, 0);
      const qrRevenue = orders.filter(o => o.paymentType === 'CLICK_PAYME').reduce((sum, o) => sum + o.totalAmount, 0);

      return `
📊 <b>BUGUNGI SAVDO HISOBOTI</b>

📦 <b>Jami Buyurtmalar:</b> ${orders.length} ta
💰 <b>Umumiy Tushum:</b> ${totalRevenue.toLocaleString('uz-UZ')} so'm

💵 <b>Naqd:</b> ${cashRevenue.toLocaleString('uz-UZ')} so'm
💳 <b>Karta:</b> ${cardRevenue.toLocaleString('uz-UZ')} so'm
📲 <b>Payme/Click:</b> ${qrRevenue.toLocaleString('uz-UZ')} so'm
      `;
    } catch (e: any) {
      return `❌ Xatolik: Stats ma'lumotlarini olishda xatolik yuz berdi.`;
    }
  }

  if (cmd.startsWith('/expenses')) {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const expenses = await prisma.expense.findMany({
        where: { createdAt: { gte: todayStart } },
        orderBy: { createdAt: 'desc' }
      });

      const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

      if (expenses.length === 0) {
        return `💸 Bugun kassa bo'yicha hech qanday rasxod qilinmagan.`;
      }

      const listStr = expenses
        .slice(0, 10)
        .map((e, idx) => `${idx + 1}. <b>${e.reason}:</b> ${e.amount.toLocaleString('uz-UZ')} so'm`)
        .join('\n');

      return `
💸 <b>BUGUNGI KASSA RASXODLARI</b>

${listStr}

🔴 <b>Jami Rasxod:</b> ${totalExpense.toLocaleString('uz-UZ')} so'm
      `;
    } catch (e: any) {
      return `❌ Xatolik: Rasxodlar ma'lumotlarini olishda xatolik.`;
    }
  }

  if (cmd.startsWith('/lowstock')) {
    try {
      const ingredients = await prisma.ingredient.findMany({
        where: { isDeleted: false }
      });

      const lowStock = ingredients.filter(i => i.currentStock <= i.minStockAlert);

      if (lowStock.length === 0) {
        return `✅ Barcha ingrediyentlar yetarli darajada mavjud! Ombor xavfsiz.`;
      }

      const listStr = lowStock
        .map((i, idx) => `⚠️ ${idx + 1}. <b>${i.name}:</b> ${i.currentStock} ${i.unit} (Min: ${i.minStockAlert})`)
        .join('\n');

      return `
⚠️ <b>ZAHIRA TUGAYOTGAN INGREDITYENTLAR</b>

${listStr}

📌 <i>Zudlik bilan ta'minotchilardan yangi partiya buyurtma bering!</i>
      `;
    } catch (e: any) {
      return `❌ Xatolik: Ombor ma'lumotlarini olishda xatolik.`;
    }
  }

  return ` Buyruq tushunilmadi. Buyruqlar ro'yxati uchun <b>/start</b> bosing.`;
}
