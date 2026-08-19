import dotenv from 'dotenv';
import { prisma } from '../db';
dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function formatMoney(amount: number): string {
  return (amount || 0).toLocaleString('uz-UZ');
}

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
  const cmd = (text || '').trim().toLowerCase();

  // 1. /start yoki /help
  if (cmd === '/start' || cmd === '/help' || cmd.includes('bosh') || cmd.includes('menyu')) {
    return `🍔 <b>DOSTON FAST FOOD — KASSA MONITORING BOT</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Assalomu alaykum! Kassa boshqaruvi va jonli hisobotlar menyusi:\n\n` +
      `📊 <b>/today</b> yoki <b>/savdo</b> — Bugungi jonli tushum va kassa holati\n` +
      `🏆 <b>/top</b> — Bugun eng ko'p sotilgan Top-5 taomlar\n` +
      `🪑 <b>/stollar</b> — Zaldagi band va bo'sh stollar monitoringi\n` +
      `💸 <b>/xarajat</b> — Bugungi kassa chiqimlari (rasxodlar)\n` +
      `🚫 <b>/stoplist</b> — Menyuda tugagan (Stop-list) mahsulotlar\n` +
      `🧾 <b>/zreport</b> — Oxirgi smena Z-Report auditi\n` +
      `🆔 <b>/myid</b> — Sizning Telegram Chat ID raqamingiz\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<i>Kerakli buyruqni bosing yoki yozing!</i>`;
  }

  // 2. /myid
  if (cmd === '/myid') {
    return `🔑 Sizning Telegram Chat ID: <code>${chatId}</code>\n\nUshbu ID ni backenddagi <code>TELEGRAM_CHAT_ID</code> ga o'rnating.`;
  }

  // 3. /today, /savdo, /report, /stats, /shift (Jonli savdo)
  if (cmd === '/today' || cmd === '/savdo' || cmd === '/report' || cmd === '/stats' || cmd === '/shift' || cmd.includes('savdo')) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeShift, todayOrders, activeExpenses] = await Promise.all([
      prisma.shift.findFirst({
        where: { status: 'OPEN' },
        include: { cashier: true, expenses: true }
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: today }, status: 'COMPLETED' }
      }),
      prisma.expense.findMany({
        where: { createdAt: { gte: today } }
      })
    ]);

    const totalRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const cashTotal = todayOrders.filter(o => o.paymentType === 'CASH').reduce((sum, o) => sum + o.totalAmount, 0);
    const cardTotal = todayOrders.filter(o => o.paymentType === 'CARD').reduce((sum, o) => sum + o.totalAmount, 0);
    const qrTotal = todayOrders.filter(o => o.paymentType === 'CLICK_PAYME').reduce((sum, o) => sum + o.totalAmount, 0);
    const totalExpenses = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
    const avgCheck = todayOrders.length > 0 ? Math.round(totalRevenue / todayOrders.length) : 0;

    return `📊 <b>BUGUNGI JONLI SAVDO HISOBOTI</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📅 <b>Sana:</b> ${new Date().toLocaleDateString('uz-UZ')} ${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}\n` +
      `👤 <b>Aktiv Kassir:</b> ${activeShift?.cashier?.fullName || 'Smena yopiq'}\n` +
      `🏢 <b>Kassa Holati:</b> ${activeShift ? '🟢 OCHIQ (Ishlamoqda)' : '🔴 YOPIQ'}\n\n` +
      `💰 <b>JAMI TUSHUM:</b> <b>${formatMoney(totalRevenue)} so'm</b>\n` +
      `💵 <b>Naqd Pul:</b> ${formatMoney(cashTotal)} so'm\n` +
      `💳 <b>Karta (Terminal):</b> ${formatMoney(cardTotal)} so'm\n` +
      `📲 <b>Click / Payme:</b> ${formatMoney(qrTotal)} so'm\n` +
      `📉 <b>Chiqimlar (Xarajat):</b> -${formatMoney(totalExpenses)} so'm\n\n` +
      `🧾 <b>Buyurtmalar Soni:</b> ${todayOrders.length} ta chek\n` +
      `💵 <b>O'rtacha Chek:</b> ${formatMoney(avgCheck)} so'm\n` +
      `━━━━━━━━━━━━━━━━━━━━`;
  }

  // 4. /top — Top-5 sotilgan taomlar
  if (cmd === '/top' || cmd.includes('top')) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: today }, status: 'COMPLETED' },
      include: { items: { include: { product: true } } }
    });

    const productCounts: Record<string, { name: string, count: number, revenue: number }> = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const name = item.product?.name || 'Noma\'lum taom';
        if (!productCounts[name]) {
          productCounts[name] = { name, count: 0, revenue: 0 };
        }
        productCounts[name].count += item.quantity;
        productCounts[name].revenue += item.totalPrice;
      });
    });

    const topList = Object.values(productCounts).sort((a, b) => b.count - a.count).slice(0, 7);

    if (topList.length === 0) {
      return `🏆 <b>TOP TAOMLAR</b>\n\nBugun hali buyurtmalar urilmagan.`;
    }

    let msg = `🏆 <b>BUGUNGI ENG KO'P SOTILGAN TAOMLAR</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
    topList.forEach((item, idx) => {
      const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣'];
      msg += `${medals[idx] || '🔹'} <b>${item.name}</b>: ${item.count} ta (${formatMoney(item.revenue)} so'm)\n`;
    });
    msg += `━━━━━━━━━━━━━━━━━━━━`;
    return msg;
  }

  // 5. /stollar, /zal, /tables
  if (cmd === '/stollar' || cmd === '/zal' || cmd === '/tables' || cmd.includes('stol')) {
    const tables = await prisma.diningTable.findMany({
      orderBy: { number: 'asc' }
    });

    const total = tables.length;
    const occupied = tables.filter(t => t.status === 'OCCUPIED');
    const free = tables.filter(t => t.status === 'AVAILABLE');

    let msg = `🪑 <b>ZAL VA STOLLAR HOLATI</b>\n━━━━━━━━━━━━━━━━━━━━\n` +
      `🔢 <b>Jami stollar:</b> ${total} ta\n` +
      `🔴 <b>Band stollar:</b> ${occupied.length} ta\n` +
      `🟢 <b>Bo'sh stollar:</b> ${free.length} ta\n\n`;

    if (occupied.length > 0) {
      msg += `<b>🔴 Band stollar ro'yxati:</b>\n`;
      occupied.forEach(t => {
        msg += `• Stol #${t.number} (${t.name}) — Hisob: ${formatMoney(t.currentOrderAmount || 0)} so'm\n`;
      });
    } else {
      msg += `<i>Barcha stollar bo'sh.</i>\n`;
    }
    msg += `━━━━━━━━━━━━━━━━━━━━`;
    return msg;
  }

  // 6. /xarajat, /expenses
  if (cmd === '/xarajat' || cmd === '/expenses' || cmd.includes('chiqim') || cmd.includes('xarajat')) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expenses = await prisma.expense.findMany({
      where: { createdAt: { gte: today } },
      orderBy: { createdAt: 'desc' }
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    let msg = `💸 <b>BUGUNGI KASSA CHIQIMLARI (XARAJATLAR)</b>\n━━━━━━━━━━━━━━━━━━━━\n` +
      `📉 <b>Jami chiqim:</b> <b>${formatMoney(total)} so'm</b> (${expenses.length} ta)\n\n`;

    if (expenses.length > 0) {
      expenses.forEach((e, idx) => {
        msg += `${idx + 1}. <b>${e.reason}</b>: ${formatMoney(e.amount)} so'm (${new Date(e.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })})\n`;
      });
    } else {
      msg += `<i>Bugun kassadan hech qanday chiqim qilinmagan.</i>\n`;
    }
    msg += `━━━━━━━━━━━━━━━━━━━━`;
    return msg;
  }

  // 7. /stoplist
  if (cmd === '/stoplist' || cmd.includes('stop')) {
    const stopProducts = await prisma.product.findMany({
      where: { isAvailable: false, isDeleted: false }
    });

    let msg = `🚫 <b>STOP-LIST (TUGAGAN TAOMLAR)</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
    if (stopProducts.length > 0) {
      stopProducts.forEach((p, idx) => {
        msg += `${idx + 1}. ❌ <b>${p.name}</b> (${p.categoryName || 'Taom'})\n`;
      });
      msg += `\n<i>Ushbu tovarlar kassada sotuvga yopilgan.</i>\n`;
    } else {
      msg += `✅ <i>Ajoyib! Hozirda barcha taomlar sotuvda mavjud (Stop-list bo'sh).</i>\n`;
    }
    msg += `━━━━━━━━━━━━━━━━━━━━`;
    return msg;
  }

  // 8. /zreport
  if (cmd === '/zreport' || cmd.includes('z-report') || cmd.includes('zreport')) {
    const lastAudit = await prisma.shiftCashAudit.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { shift: { include: { cashier: true } } }
    });

    if (!lastAudit) {
      return `🧾 <b>Z-REPORT</b>\n\nHali yopilgan smena auditi mavjud emas.`;
    }

    const diff = lastAudit.difference;
    const diffBadge = diff === 0 ? '🟢 Kamomadsiz (To\'g\'ri)' : (diff < 0 ? `🔴 Kamomad: -${formatMoney(Math.abs(diff))} so'm` : `🟡 Ortiqcha: +${formatMoney(diff)} so'm`);

    return `🧾 <b>OXIRGI YOPILGAN SMENA Z-REPORTI</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 <b>Kassir:</b> ${lastAudit.shift.cashier.fullName}\n` +
      `⏰ <b>Yopilgan vaqti:</b> ${new Date(lastAudit.createdAt).toLocaleString('uz-UZ')}\n\n` +
      `💵 <b>Kutilgan Naqd:</b> ${formatMoney(lastAudit.expectedCash)} so'm\n` +
      `✋ <b>Kassir Sanagan:</b> ${formatMoney(lastAudit.declaredCash)} so'm\n` +
      `💳 <b>Karta:</b> ${formatMoney(lastAudit.declaredCard || 0)} so'm\n` +
      `⚖️ <b>Audit Holati:</b> <b>${diffBadge}</b>\n` +
      (lastAudit.notes ? `📝 <i>Izoh:</i> ${lastAudit.notes}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━`;
  }

  return `Noma'lum buyruq. Barcha buyruqlarni ko'rish uchun <b>/start</b> bosing.`;
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
      auditBadge = `⚠️ KAMOMAD: -${formatMoney(Math.abs(data.cashDifference))} so'm`;
    } else if (data.cashDifference > 0) {
      auditBadge = `🟢 ORTIQCHA: +${formatMoney(data.cashDifference)} so'm`;
    }

    const message = `
📊 <b>DOSTON FAST FOOD — SMENA YOPILDI & Z-REPORT</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Kassir:</b> ${data.cashierName}
⏰ <b>Ochilgan:</b> ${new Date(data.openedAt).toLocaleString('uz-UZ')}
🏁 <b>Yopilgan:</b> ${new Date(data.closedAt).toLocaleString('uz-UZ')}

💵 <b>Boshlang'ich Naqd:</b> ${formatMoney(data.startCash)} so'm
🧾 <b>Jami Buyurtmalar:</b> ${data.ordersCount} ta
💰 <b>JAMI TUSHUM:</b> <b>${formatMoney(data.totalSales)} so'm</b>

💵 <b>Naqd Tushum:</b> ${formatMoney(data.cashSales)} so'm
💳 <b>Karta (Terminal):</b> ${formatMoney(data.cardSales)} so'm
📉 <b>Chiqimlar (Xarajat):</b> -${formatMoney(data.totalExpenses)} so'm
━━━━━━━━━━━━━━━━━━━━
🧮 <b>Kassadagi Kutilgan Naqd:</b> ${formatMoney(data.expectedCash)} so'm
✋ <b>Kassir Sanagan Naqd:</b> ${formatMoney(data.actualCash)} so'm
🚨 <b>AUDIT HOLATI:</b> <b>${auditBadge}</b>
━━━━━━━━━━━━━━━━━━━━
<i>🤖 FastFoodCash Master Ecosystem</i>
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

