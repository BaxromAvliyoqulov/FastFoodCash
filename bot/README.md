# 🤖 DOSTON FAST FOOD - TELEGRAM BOT YO'RIQNOMASI

Bu bot har gal smena yopilganda Z-Report xulosasini avtomatik tarzda Telegram orqali restoran egasiga yuboradi va `/report` buyrug'i bilan istalgan vaqtda kassa tushumini ko'rsatadi.

---

## 🚀 1 Daqiqada Ishga Tushirish:

1. **Bot yaratish:**
   - Telegram'da `@BotFather` ga kiring va `/newbot` buyrug'ini yuboring.
   - Bot nomini kiriting (masalan: `DostonBurgerBot`).
   - Botdan berilgan **TOKEN** ni oling (masalan: `7123456789:AAH...`).

2. **Chat ID ni bilish:**
   - O'zingiz ochgan botga kirib `/start` ni bosing va `/myid` yuboring.
   - Yoki `@userinfobot` ga kirib o'zingizning Telegram raqamli ID'ingizni oling (masalan: `123456789`).

3. **Sozlash:**
   - `bot/.env.example` faylidan nusxa olib `bot/.env` yarating va tokeningizni yozing:
     ```env
     BOT_TOKEN=7123456789:AAHxxxxxxxxx
     ADMIN_CHAT_ID=123456789
     ```

4. **Ishga tushirish:**
   ```bash
   cd bot
   npm install
   npm start
   ```

Tayyor! Endi har bir smena yakuni avtomatik tarzda sizning Telegramingizga kelib turadi! 📱✨
