# 🍔 FastFoodCash — Fast Food & Restoran POS Tizimi (KASSA)

[![Vue.js](https://img.shields.io/badge/Vue.js-v3.4-brightgreen)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.3-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-v5.1-purple)](https://vitejs.dev/)
[![Express.js](https://img.shields.io/badge/Express-v4.18-lightgrey)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-v5.10-indigo)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blueviolet)](https://www.postgresql.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline--First-orange)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

> **FastFoodCash (KASSA)** — Fast-food, kafe hamda restoranlar uchun maxsus qurilgan ultra-tezkor, PWA Offline-First rejimida ishlovchi, resepturalar bo'yicha ombor nazorati va Telegram Bot hisobotlariga ega zamonaviy POS kassa tizimi.

---

## 🌟 Asosiy Imkoniyatlar (Key Features)

- **⚡ Offline-First (PWA Architecture):** Internet uzilib qolsa ham kassa to'xtamaydi. Buyurtmalar mahalliy xotirada saqlanadi va internet tiklangach avtomatik sinxronlanadi.
- **📱 Touch-Screen Tayyor Vue 3 UI:** Sensorli ekranlar hamda kassa planshetlari uchun moslashtirilgan ultra-tezkor interfeys.
- **🧪 Reseptura va Xom-Ashyo Ombori:** Mahsulot tarkibidagi xom-ashyo (gramm, dona, ml) savdo qilganda avtomatik ombordan chegiriladi.
- **🔒 Smena va Kassa Audit:** Kassir smenalari, berkitilgan smena yopilishi (Blind Closing), naqd pul deklaratsiyasi hamda kassa kamchiliklari (Shortage/Surplus) auditingi.
- **📲 Telegram Bot Notification Engine:** Kunlik Z-hisobotlar va favqulodda kassa xabarnomalari menejmentning Telegram botiga avtomatik yuboriladi.

---

## 🛠️ Texnologik Stek (Tech Stack)

- **Frontend:** Vue 3 (Composition API), Vite, TypeScript, Pinia (State Management), TailwindCSS, Vitest.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, Jest.
- **Database:** PostgreSQL (Production) / SQLite (Development).
- **CI/CD:** GitHub Actions.

---

## 🚀 Mahalliy Atrof-muhitda Ishga Tushirish (Setup Guide)

### 1. Repository'ni Clone Qilish:
```bash
git clone https://github.com/BaxromAvliyoqulov/FastFoodCash.git
cd FastFoodCash
```

### 2. Backend Qismini Sozlash:
```bash
cd backend
npm install
```

`backend/.env` faylini yaratib, quyidagi o'zgaruvchilarni kiriting:
```env
PORT=4000
DATABASE_URL="file:./dev.db" # yoki PostgreSQL URL
TELEGRAM_BOT_TOKEN="your_bot_token_here"
TELEGRAM_CHAT_ID="your_chat_id"
```

Baza sxemasini generatsiya qilish:
```bash
npm run prisma:generate
npm run prisma:push
```

Backend serverni ishga tushirish:
```bash
npm run dev
# Server http://localhost:4000 manzilida ishlaydi
```

### 3. Frontend Qismini Sozlash:
Yangi terminal oynasida:
```bash
cd frontend
npm install
npm run dev
# Ilova http://localhost:3000 manzilida ochiladi
```

---

## 📚 Hujjatlar va Arxitektura (Documentation)

- **API Documentation (Swagger):** Backend ishga tushgach, [http://localhost:4000/api-docs](http://localhost:4000/api-docs) manzilida Swagger interaktiv hujjatini ko'rishingiz mumkin.
- **Database Schema (ERD):** Ma'lumotlar bazasi jadvallari va aloqalari uchun `docs/architecture/ERD.md` faylini ko'ring.

---

## 🧪 Avtomatik Testlarni Ishga Tushirish

**Backend Testlar (Jest):**
```bash
cd backend
npm run test
```

**Frontend Testlar (Vitest):**
```bash
cd frontend
npm run test
```

---

## 📜 Litsenziya va Mualliflik

© 2026 **FastFoodCash (KASSA) Platform**. Baxrom Avliyoqulov tomonidan ishlab chiqilgan. Barcha huquqlar himoyalangan.
