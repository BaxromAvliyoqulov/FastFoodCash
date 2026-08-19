/**
 * DOSTON FAST FOOD - TELEGRAM NOTIFICATION & Z-REPORT MONITORING BOT
 * Jonli savdo, Top taomlar, Stollar holati, Xarajatlar va Z-Report monitoringi
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const token = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '';
const adminChatId = process.env.ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID || '';
const API_URL = process.env.API_URL || 'http://localhost:4000/api/v1';

if (!token || token === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  console.log('⚠️ [Telegram Bot] Diqqat: BOT_TOKEN kiritilmagan. .env fayliga BOT_TOKEN va ADMIN_CHAT_ID ni kiriting.');
}

let bot = null;
if (token && token !== 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  try {
    bot = new TelegramBot(token, { polling: true });
    console.log('🤖 [Telegram Bot] Bot muvaffaqiyatli ishga tushdi!');
  } catch (err) {
    console.error('❌ [Telegram Bot] Ulanishda xatolik:', err);
  }
}

// ─── Format Money Helper ───────────────────────────────────────────────────────
function formatMoney(amount) {
  return (amount || 0).toLocaleString('uz-UZ');
}

// ─── Asosiy Tugmalar Klaviaturasi ─────────────────────────────────────────────
const mainKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: '📊 Bugungi Savdo' }, { text: '🏆 Top Taomlar' }],
      [{ text: '🪑 Stollar Holati' }, { text: '💸 Chiqimlar (Xarajat)' }],
      [{ text: '🚫 Stop-List' }, { text: '🧾 Oxirgi Z-Report' }]
    ],
    resize_keyboard: true,
    persistent: true
  }
};

// ─── Bot Buyruqlari va Matnlarini Qayta Ishlash ──────────────────────────────
if (bot) {
  // /start yoki /help
  bot.onText(/\/start|\/help|bosh menyu/i, (msg) => {
    const chatId = msg.chat.id;
    const text = `👋 Assalomu alaykum, <b>${msg.from.first_name || 'Admin'}</b>!\n\n` +
      `🍔 <b>DOSTON FAST FOOD</b> kassa boshqaruvi monitoring botiga xush kelibsiz.\n\n` +
      `Quyidagi tugmalardan birini tanlang yoki buyruq yozing:`;

    bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...mainKeyboard });
  });

  // /myid
  bot.onText(/\/myid|id/i, (msg) => {
    bot.sendMessage(msg.chat.id, `🔑 Sizning Telegram Chat ID: <code>${msg.chat.id}</code>\n\nUshbu ID ni <code>.env</code> faylidagi <code>ADMIN_CHAT_ID</code> ga qo'ying.`, { parse_mode: 'HTML' });
  });

  // 1. 📊 Bugungi Savdo (/today, /savdo, /report)
  bot.onText(/\/today|\/savdo|\/report|bugungi savdo/i, async (msg) => {
    const chatId = msg.chat.id;
    try {
      const [resShift, resStats] = await Promise.all([
        fetch(`${API_URL}/shifts/active`),
        fetch(`${API_URL}/stats/dashboard`)
      ]);

      const shiftData = await resShift.json();
      const statsData = await resStats.json();

      const activeShift = shiftData?.data?.activeShift;
      const stats = statsData?.data || {};

      const totalRevenue = activeShift?.summary?.totalRevenue || stats.totalRevenue || 0;
      const cash = activeShift?.summary?.totalCash || 0;
      const card = activeShift?.summary?.totalCard || 0;
      const qr = activeShift?.summary?.totalQr || 0;
      const ordersCount = activeShift?.ordersCount || stats.totalOrders || 0;
      const avgCheck = stats.averageOrderValue || (ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 0);

      const text = `📊 <b>BUGUNGI JONLI SAVDO HISOBOTI</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📅 Sana: <b>${new Date().toLocaleDateString('uz-UZ')} ${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</b>\n` +
        `👤 <b>Aktiv Kassir:</b> ${activeShift?.cashier?.fullName || 'Smena yopiq'}\n` +
        `🏢 <b>Kassa Holati:</b> ${activeShift ? '🟢 OCHIQ (Faol)' : '🔴 YOPIQ'}\n\n` +
        `💰 <b>JAMI SAVDO:</b> <b>${formatMoney(totalRevenue)} so'm</b>\n` +
        `💵 <b>Naqd Pul:</b> ${formatMoney(cash)} so'm\n` +
        `💳 <b>Karta (Terminal):</b> ${formatMoney(card)} so'm\n` +
        `📲 <b>Click / Payme:</b> ${formatMoney(qr)} so'm\n\n` +
        `🧾 <b>Buyurtmalar:</b> ${ordersCount} ta chek\n` +
        `💵 <b>O'rtacha Chek:</b> ${formatMoney(avgCheck)} so'm\n` +
        `━━━━━━━━━━━━━━━━━━━━`;

      bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...mainKeyboard });
    } catch (error) {
      bot.sendMessage(chatId, `⚠️ Kassa serveri bilan aloqa yo'q yoki ma'lumot yuklanmadi.`, mainKeyboard);
    }
  });

  // 2. 🏆 Top Taomlar (/top)
  bot.onText(/\/top|top taomlar/i, async (msg) => {
    const chatId = msg.chat.id;
    try {
      const res = await fetch(`${API_URL}/stats/dashboard`);
      const body = await res.json();
      const topItems = body?.data?.topItems || [];

      if (topItems.length === 0) {
        return bot.sendMessage(chatId, `🏆 <b>TOP TAOMLAR</b>\n\nBugun hali buyurtmalar urilmagan.`, { parse_mode: 'HTML', ...mainKeyboard });
      }

      const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
      let text = `🏆 <b>BUGUNGI ENG KO'P SOTILGAN TAOMLAR</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
      topItems.forEach((item, idx) => {
        text += `${medals[idx] || '🔹'} <b>${item.name}</b>: ${item.count} ta (${formatMoney(item.revenue)} so'm)\n`;
      });
      text += `━━━━━━━━━━━━━━━━━━━━`;

      bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...mainKeyboard });
    } catch (error) {
      bot.sendMessage(chatId, `⚠️ Top taomlarni yuklashda xatolik yuz berdi.`, mainKeyboard);
    }
  });

  // 3. 🪑 Stollar Holati (/stollar, /zal)
  bot.onText(/\/stollar|\/zal|stollar holati/i, async (msg) => {
    const chatId = msg.chat.id;
    try {
      const res = await fetch(`${API_URL}/tables`);
      const body = await res.json();
      const tables = body?.data?.tables || [];

      const occupied = tables.filter(t => t.status === 'OCCUPIED');
      const free = tables.filter(t => t.status === 'AVAILABLE');

      let text = `🪑 <b>ZAL VA STOLLAR HOLATI</b>\n━━━━━━━━━━━━━━━━━━━━\n` +
        `🔢 <b>Jami stollar:</b> ${tables.length} ta\n` +
        `🔴 <b>Band stollar:</b> ${occupied.length} ta\n` +
        `🟢 <b>Bo'sh stollar:</b> ${free.length} ta\n\n`;

      if (occupied.length > 0) {
        text += `<b>🔴 Band stollar hisobi:</b>\n`;
        occupied.forEach(t => {
          text += `• Stol #${t.number} (${t.name}) — Hisob: ${formatMoney(t.currentOrderAmount || 0)} so'm\n`;
        });
      } else {
        text += `<i>Hozirda barcha stollar bo'sh.</i>\n`;
      }
      text += `━━━━━━━━━━━━━━━━━━━━`;

      bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...mainKeyboard });
    } catch (error) {
      bot.sendMessage(chatId, `⚠️ Stollar holatini yuklashda xatolik yuz berdi.`, mainKeyboard);
    }
  });

  // 4. 💸 Chiqimlar (Xarajatlar) (/xarajat)
  bot.onText(/\/xarajat|chiqimlar/i, async (msg) => {
    const chatId = msg.chat.id;
    try {
      const res = await fetch(`${API_URL}/shifts/active`);
      const body = await res.json();
      const expenses = body?.data?.activeShift?.expenses || [];

      const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      let text = `💸 <b>BUGUNGI KASSA CHIQIMLARI</b>\n━━━━━━━━━━━━━━━━━━━━\n` +
        `📉 <b>Jami chiqim:</b> <b>${formatMoney(total)} so'm</b> (${expenses.length} ta)\n\n`;

      if (expenses.length > 0) {
        expenses.forEach((e, idx) => {
          text += `${idx + 1}. <b>${e.reason}</b>: ${formatMoney(e.amount)} so'm\n`;
        });
      } else {
        text += `<i>Bugun kassadan hech qanday chiqim qilinmagan.</i>\n`;
      }
      text += `━━━━━━━━━━━━━━━━━━━━`;

      bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...mainKeyboard });
    } catch (error) {
      bot.sendMessage(chatId, `⚠️ Xarajatlarni yuklashda xatolik yuz berdi.`, mainKeyboard);
    }
  });

  // 5. 🚫 Stop-List (/stoplist)
  bot.onText(/\/stoplist|stop-list/i, async (msg) => {
    const chatId = msg.chat.id;
    try {
      const res = await fetch(`${API_URL}/products`);
      const body = await res.json();
      const products = body?.data || [];
      const stopProducts = products.filter(p => !p.isAvailable && !p.isDeleted);

      let text = `🚫 <b>STOP-LIST (TUGAGAN TAOMLAR)</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
      if (stopProducts.length > 0) {
        stopProducts.forEach((p, idx) => {
          text += `${idx + 1}. ❌ <b>${p.name}</b> (${p.categoryName || 'Taom'})\n`;
        });
        text += `\n<i>Ushbu tovarlar kassada sotuvga yopilgan.</i>\n`;
      } else {
        text += `✅ <i>Barcha taomlar sotuvda mavjud (Stop-list bo'sh).</i>\n`;
      }
      text += `━━━━━━━━━━━━━━━━━━━━`;

      bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...mainKeyboard });
    } catch (error) {
      bot.sendMessage(chatId, `⚠️ Stop-listni yuklashda xatolik yuz berdi.`, mainKeyboard);
    }
  });

  // 6. 🧾 Oxirgi Z-Report (/zreport)
  bot.onText(/\/zreport|oxirgi z-report/i, async (msg) => {
    const chatId = msg.chat.id;
    try {
      const res = await fetch(`${API_URL}/audit/logs`);
      const body = await res.json();
      const logs = body?.data?.logs || [];
      const zReportLog = logs.find(l => l.action === 'SHIFT_DISCREPANCY' || l.action === 'CLOSE_SHIFT');

      let text = `🧾 <b>OXIRGI Z-REPORT AUDITI</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
      if (zReportLog) {
        const details = JSON.parse(zReportLog.detailsJson || '{}');
        text += `👤 <b>Mas'ul:</b> ${zReportLog.user?.fullName || 'Kassir'}\n` +
          `⏰ <b>Sana:</b> ${new Date(zReportLog.createdAt).toLocaleString('uz-UZ')}\n\n` +
          `💵 <b>Kutilgan Naqd:</b> ${formatMoney(details.expectedCash)} so'm\n` +
          `✋ <b>Sanab Topshirildi:</b> ${formatMoney(details.declaredCash)} so'm\n` +
          `⚖️ <b>Audit Holati:</b> <b>${details.status || 'BALANCED'}</b>\n`;
      } else {
        text += `<i>Hozircha saqlangan Z-Report yozuvi yo'q.</i>\n`;
      }
      text += `━━━━━━━━━━━━━━━━━━━━`;

      bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...mainKeyboard });
    } catch (error) {
      bot.sendMessage(chatId, `⚠️ Z-Reportni yuklashda xatolik yuz berdi.`, mainKeyboard);
    }
  });
}

// ─── HTTP Webhook Server (POS Kassa Z-Report va Ogohlantirishlar yuborganda) ──
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/notify-zreport') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const audit = JSON.parse(body);
        const targetChatId = adminChatId || (audit.chatId || '');

        if (bot && targetChatId) {
          const diffText = (audit.difference || 0) < 0 
            ? `🔴 Kamomad: -${formatMoney(Math.abs(audit.difference))} so'm`
            : (audit.difference || 0) > 0 
            ? `🟡 Ortiqcha: +${formatMoney(audit.difference)} so'm`
            : `🟢 100% To'g'ri (Kamomadsiz)`;

          const message = `🧾 <b>YANGI Z-REPORT — SMENA YOPILDI</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🆔 <b>Audit ID:</b> #${audit.id}\n` +
            `👤 <b>Mas'ul:</b> ${audit.cashierName || 'Admin'}\n` +
            `⏰ <b>Vaqt:</b> ${audit.createdAt || new Date().toLocaleTimeString('uz-UZ')}\n\n` +
            `💵 <b>1. Boshlang'ich Kassa:</b> ${formatMoney(audit.initialCash)} so'm\n` +
            `💰 <b>2. Naqd Tushum:</b> +${formatMoney(audit.totalCashSales || audit.declaredCash)} so'm\n` +
            `💳 <b>3. Terminal (Humo/Uzcard):</b> ${formatMoney(audit.totalCardSales || audit.declaredCard)} so'm\n` +
            `📉 <b>4. Chiqimlar (Xarajat):</b> -${formatMoney(audit.totalExpenses)} so'm\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📊 <b>JAMI TUSHUM:</b> <b>${formatMoney((audit.totalCashSales || 0) + (audit.totalCardSales || audit.declaredCard || 0))} so'm</b>\n` +
            `📥 <b>Kassadagi Kutilgan Naqd:</b> ${formatMoney(audit.expectedCash)} so'm\n` +
            `🔢 <b>Kassir Sanagan Naqd:</b> ${formatMoney(audit.declaredCash)} so'm\n` +
            `⚖️ <b>Kassa Farqi:</b> <b>${diffText}</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━`;

          bot.sendMessage(targetChatId, message, { parse_mode: 'HTML', ...mainKeyboard });
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, message: 'Z-Report Telegramga yuborildi' }));
          return;
        }

        res.writeHead(200);
        res.end(JSON.stringify({ success: false, message: 'Bot yoki Chat ID sozlanmagan' }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
  } else {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'Telegram Bot Service Running' }));
  }
});

const BOT_PORT = process.env.BOT_PORT || 5050;
server.listen(BOT_PORT, () => {
  console.log(`📡 [Telegram Bot] Webhook listener http://localhost:${BOT_PORT} portida ishga tushdi`);
});

