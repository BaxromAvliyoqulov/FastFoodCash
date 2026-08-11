import dotenv from 'dotenv';
import { prisma } from '../db';
dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export interface ZReportNotificationPayload {
  shiftId: string;
  openedAt: Date;
  closedAt: Date;
  cashierName: string;
  startCash: number;
  totalSales: number;
  cashSales: number;
  cardSales: number;
  totalExpenses: number;
  expectedCash: number;
  actualCash: number;
  cashDifference: number;
  ordersCount: number;
}

export async function processTelegramCommand(text: string, chatId: string): Promise<string> {
  const command = text.trim().toLowerCase();

  if (command === '/start') {
    return '<b>DOSTON BURGER POS PRO Bot Botiga xush kelibsiz!</b>\n\nBuyruqlar:\n/stats — Bugungi savdo hisoboti\n/shift — Aktiv smena holati\n/status — Tizim holati';
  }

  if (command === '/stats' || command === '/shift') {
    const activeShift = await prisma.shift.findFirst({
      where: { status: 'OPEN' },
      include: {
        cashier: true,
        orders: { where: { status: 'COMPLETED' } }
      }
    });

    if (!activeShift) {
      return '⚠️ Hozirda ochiq smena mavjud emas.';
    }

    const totalSales = activeShift.orders.reduce((sum, o) => sum + o.totalAmount, 0);
    return `📊 <b>SMENA HOLATI</b>\n\n👤 Kassir: ${activeShift.cashier.fullName}\n⏰ Ochilgan: ${new Date(activeShift.openedAt).toLocaleTimeString('uz-UZ')}\n🧾 Buyurtmalar: ${activeShift.orders.length} ta\n💰 Jami Savdo: ${totalSales.toLocaleString('uz-UZ')} so'm`;
  }

  if (command === '/status') {
    return '✅ FastFoodCash POS API Server ishlab turibdi.';
  }

  return 'Nomalum buyruq. /stats yoki /shift buyrug\'ini yuboring.';
}

export async function sendTelegramZReportNotification(data: ZReportNotificationPayload): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.log('[Telegram Bot] TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID o\'rnatilmagan. Xabar yuborish o\'tkazib yuborildi.');
    return false;
  }

  try {
    const isExact = data.cashDifference === 0;
    const isShortage = data.cashDifference < 0;
    
    let auditBadge = '✅ TO\'LIQ KASSA MOS';
    if (isShortage) {
      auditBadge = `⚠️ KAMOMAD: ${Math.abs(data.cashDifference).toLocaleString('uz-UZ')} so'm`;
    } else if (data.cashDifference > 0) {
      auditBadge = `🟢 ORTIQCHA: +${data.cashDifference.toLocaleString('uz-UZ')} so'm`;
    }

    const message = `
📊 <b>DOSTON BURGER — SMENA YOPILDI & Z-REPORT</b>
➖➖➖➖➖➖➖➖➖➖➖➖
👤 <b>Kassir:</b> ${data.cashierName}
⏰ <b>Ochilgan:</b> ${new Date(data.openedAt).toLocaleString('uz-UZ')}
🏁 <b>Yopilgan:</b> ${new Date(data.closedAt).toLocaleString('uz-UZ')}

💵 <b>Boshlang'ich Naqd:</b> ${data.startCash.toLocaleString('uz-UZ')} so'm
🧾 <b>Jami Buyurtmalar:</b> ${data.ordersCount} ta
💰 <b>Jami Savdo Tushumi:</b> ${data.totalSales.toLocaleString('uz-UZ')} so'm

💳 <b>Naqd Savdo:</b> ${data.cashSales.toLocaleString('uz-UZ')} so'm
💳 <b>Karta / Payme:</b> ${data.cardSales.toLocaleString('uz-UZ')} so'm
💸 <b>Rasxod (Kassa Chiqim):</b> ${data.totalExpenses.toLocaleString('uz-UZ')} so'm

----------------------------------
🧮 <b>Kassada Bo'lishi Kerak:</b> ${data.expectedCash.toLocaleString('uz-UZ')} so'm
✋ <b>Sanab Topshirildi:</b> ${data.actualCash.toLocaleString('uz-UZ')} so'm
🚨 <b>AUDIT HOLATI:</b> <b>${auditBadge}</b>
➖➖➖➖➖➖➖➖➖➖➖➖
<i>🤖 FastFoodCash Multi-Audit Ecosystem</i>
    `.trim();

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    return res.ok;
  } catch (error) {
    console.error('[Telegram Bot Error]:', error);
    return false;
  }
}
