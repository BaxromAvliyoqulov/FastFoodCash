/**
 * DOSTON FAST FOOD - TELEGRAM NOTIFICATION & Z-REPORT BOT
 * Bu bot smena yopilganda Z-Reportni avtomatik ravishda restoran egasiga yuboradi
 * va /report buyrug'i orqali jonli kassa tushumini ko'rsatadi.
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const token = process.env.BOT_TOKEN || '';
const adminChatId = process.env.ADMIN_CHAT_ID || '';
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

// ─── /start Buyrug'i ──────────────────────────────────────────────────────────
if (bot) {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const text = `👋 Assalomu alaykum, <b>${msg.from.first_name || 'Admin'}</b>!\n\n` +
      `🍔 <b>DOSTON FAST FOOD</b> kassa tizimi monitoring botiga xush kelibsiz.\n\n` +
      `📌 <b>Mavjud buyruqlar:</b>\n` +
      `📊 /report — Ayni daqiqadagi jonli kassa tushumi\n` +
      `🧾 /zreport — Oxirgi smena Z-Report audit hisoboti\n` +
      `🆔 /myid — Sizning Telegram Chat ID raqamingiz`;

    bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
  });

  // ─── /myid Buyrug'i ──────────────────────────────────────────────────────────
  bot.onText(/\/myid/, (msg) => {
    bot.sendMessage(msg.chat.id, `🔑 Sizning Chat ID: <code>${msg.chat.id}</code>\n\nUshbu ID ni <code>.env</code> faylidagi <code>ADMIN_CHAT_ID</code> ga qo'ying.`, { parse_mode: 'HTML' });
  });

  // ─── /report Buyrug'i (Jonli Tushum) ──────────────────────────────────────────
  bot.onText(/\/report/, async (msg) => {
    const chatId = msg.chat.id;
    try {
      bot.sendMessage(chatId, `⏳ Kassa tushumi hisoblanmoqda...`);
      
      const res = await fetch(`${API_URL}/stats/dashboard`);
      const body = await res.json();
      
      if (body.success && body.data) {
        const d = body.data;
        const text = `📊 <b>DOSTON FAST FOOD — JONLI TUSHUM</b>\n` +
          `📅 Sana: <b>${new Date().toLocaleDateString('uz-UZ')} ${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</b>\n\n` +
          `💰 <b>Jami Savdo:</b> ${formatMoney(d.totalRevenue)} so'm\n` +
          `🧾 <b>Buyurtmalar:</b> ${d.totalOrders} ta chek\n` +
          `💵 <b>O'rtacha Chek:</b> ${formatMoney(d.averageOrderValue)} so'm\n\n` +
          `🏢 <b>Kassa Holati:</b> 🟢 Faol ishlamoqda`;

        bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
      } else {
        bot.sendMessage(chatId, `⚠️ Kassa ma'lumotlarini olishda xatolik yuz berdi.`);
      }
    } catch (error) {
      bot.sendMessage(chatId, `⚠️ Kassa serveri bilan aloqa yo'q (Server offline yoki manzil noto'g'ri).`);
    }
  });
}

// ─── HTTP Webhook Server (POS Kassa Z-Report yuborganda) ───────────────────────
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
            `⚖️ <b>Kassa Farqi:</b> <b>${diffText}</b>\n\n` +
            `🏛️ <b>1-Qavat (Stollar):</b> ${formatMoney(audit.cashier1Stats?.total || 0)} so'm (${audit.cashier1Stats?.count || 0} ta chek)\n` +
            `👑 <b>2-Qavat (VIP Xonalar):</b> ${formatMoney(audit.cashier2Stats?.total || 0)} so'm (${audit.cashier2Stats?.count || 0} ta chek)\n` +
            `━━━━━━━━━━━━━━━━━━━━`;

          bot.sendMessage(targetChatId, message, { parse_mode: 'HTML' });
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
