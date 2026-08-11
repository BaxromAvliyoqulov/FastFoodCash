# 📋 Loyiha Auditi: FastFoodCash (POS & Restaurant Audit Ecosystem) — 2026-08-11

## Xulosa (Executive Summary)
- **Umumiy Reyting:** **6.5 / 10** (12 xil rol bo'yicha berilgan tanqidiy baholar o'rtachasi)
- **Jami fayllar:** 229 ta | **Sof kod hajmi:** ~12.5 MB (rasmlardan tashqari) | **Kod qatorlari (LOC):** 26,970 qator (`Vue 3`, `TypeScript`, `Prisma`, `Express`)
- **🔴 Eng kritik 3 ta kamchilik:**
  1. **High Concurrency & Database Transactions:** Buyurtma saqlash va masalliqlar omboridan avtomatik ayirish tranzaksiyaga (`$transaction`) o'ralmagan (Race condition xavfi bor).
  2. **Security & Input Validation:** Backend REST API endpointlarida Zod/Joi server-side schema validation hamda Login brute-force rate-limiter yo'q.
  3. **Media Performance:** `public/images` ichidagi taom rasmlari optimizatsiya qilinmagan (ayrim PNG rasmlar 500-630 KB bo'lib, mobil internetda sekinlashuvga olib keladi).
- **💰 Tavsiya etilgan bozor narxi:** **$3,800 USD** (yoki **49,000,000 UZS**) — Custom sotish uchun; SaaS obuna modeli bo'yicha **$15–$35/oy** (oylik **~9,000,000 UZS** daromad potensiali).

---

## 1. Struktura va Hajm Analizi

| Metrika | Qiymat | Изoh |
|---|---|---|
| Jami fayllar soni | **229 ta** | Vue components, TS stores, public assets, DB migrations |
| Sof Kod Qatorlari (LOC) | **26,970 qator** | `.vue` (26), `.ts` (44), `.js` (12), `.json` (7), `.md` (8) |
| Git Commitlar soni | **30+ commit** | Barqaror rivojlanayotgan git tarixi |
| Asosiy texnologik stack | `Vue 3`, `Vite`, `Pinia`, `Express`, `Prisma`, `SQLite/Postgres` | Enterprise POS SaaS arxitekturasi |

---

## 2. 12 Nuqtai Nazardan Tanqidiy Baholash (Rating Rubric)

| # | Rol | Ball | ✅ Kuchli tomonlar | ⚠️ Zaif tomonlar | 🎯 10/10 uchun taklif |
|---|---|---|---|---|---|
| 1 | 🏗️ Backend Architect | **6.0 / 10** | Prisma ORM mo'tadilligi, Express modulli routing | Tranzaksiyalar (`$transaction`) yetarsiz, optimistic concurrency OCC yo'q | DB write chaqiruvlarini `$transaction` bilan o'rash |
| 2 | 🎨 Frontend / UX | **7.5 / 10** | Vue 3 composition API, TailwindCSS dark/light mode | Modal a11y focus-trap yo'q, PosView nisbatan katta | Modallarga accessibility qo'shish va atomizatsiya |
| 3 | 🔐 Xavfsizlik Auditori | **6.0 / 10** | RBAC rolga bo'lish (`Admin` vs `Kassir`), PIN login | Zod server validation yo'q, Rate-limiting ulangan emas | `express-rate-limit` va Zod middleware kiritish |
| 4 | ⚙️ DevOps / SRE | **5.5 / 10** | GitHub Actions CI (`test-frontend`, `test-backend`) | Markazlashgan loglar (Sentry) va DB backup skripti yo'q | Sentry SDK va Postgres cron backup qo'shish |
| 5 | 🧪 QA Muhandisi | **5.0 / 10** | Vitest unit testlar bor (`authStore`, `posStore` pass) | Playwright/Cypress E2E testlar va controller testlar yo'q | E2E checkout oqimini Playwright bilan avtomatlashtirish |
| 6 | 📊 Product Manager | **7.5 / 10** | Blind Shift Reconciliation, POS ergonomics, Stop-List | QR Menu va Telegram Bot instant alertlari to'g'ridan-to'g'ri bog'lanmagan | Telegram Bot Z-Report va Table QR Menu ilova qilish |
| 7 | 🌱 Maintainability | **8.0 / 10** | To'liq `GOLDEN_RULES.md`, TypeScript strict types | Ba'zi API funksiyalarida inline fallbacklar aralashgan | Markaziy HTTP Client Response interfeys yaratish |
| 8 | 🗄️ Database Architect | **6.0 / 10** | Relational toza schema design, Cascade ON DELETE | Compasite indexlar (`status`, `shiftId`, `createdAt`) yetarsiz | Prisma `@@index`lar majmualarini kengaytirish |
| 9 | ⚡ Performance Eng. | **7.0 / 10** | Vite fast bundle (~346 KB gzip 91 KB), PWA SW service worker | Rasmlar hajmi katta (500–630 KB), Redis cache yo'q | Public rasmlarni WebP formatga o'tkazib optimizatsiya qilish |
| 10 | 💼 Investor / VC | **6.0 / 10** | Fast-food biznesida talab o'ta yuqori | Bus factor = 1 (yakka dasturchi riski), Multi-tenant isolate yo'q | Prisma schemaga `tenantId` qo'shib Multi-Tenant qilish |
| 11 | 🎯 Raqobat Tahlilchisi | **7.0 / 10** | Poster POS & iiko ga qaraganda tekor, uzluksiz offline-first | KDS animatsiyalari va SMS loyallik moduli yetishmaydi | Visual KDS (Oshxona ekrani) timer animatsiyasini yaxshilash |
| 12 | 👤 Foydalanuvchi UX | **7.5 / 10** | Smena ochish/yopish va kassa ergonomikasi tushunarli | Naqd pul qaytim kalkulyatori kassa to'lov oynasida katta ko'rinishi kerak | Payment modalda Qaytim summasi shriftini kattalashtirish |

---

## 3. Kritik Kamchiliklar (Gap Analysis)

1. **🔴 [Kritik] Prisma Race Conditions & Tranzaksiya Yo'qligi:** Multiple checkout payti masalliqlar ayirilishida tranzaksiya ishlatilmagan.
2. **🔴 [Kritik] Server-side Input Validation Yo'qligi:** Backend API controllerlariga keladigan inputlar Zod schema bilan tekshirilmaydi.
3. **🟠 [Yuqori] Media Assets Optimallashmaganligi:** `donar_pizza.png`, `club_sandwich.png` va 15+ rasmlar 500 KB dan katta.
4. **🟠 [Yuqori] Rate Limiting Yo'qligi:** `/api/v1/auth/login` endpointida PIN kodini taxmin qilib topish (brute-force) himoyasi yo'q.
5. **🟡 [O'rta] E2E Integration Testlar Yo'qligi:** Kassa va to'lov jarayonini avtomatik sinovchi E2E skriptlar mavjud emas.
6. **🟡 [O'rta] Markazlashgan Log Tizimi (Sentry) Yo'qligi:** Production xatoliklarini real-vaqtda ushlash yo'q.
7. **🟢 [Past] Modal Accessibility (a11y) Tanqisligi:** Klaviaturadan `Esc` tugmasi va Tab nav modallarda to'liq izolyatsiyalanmagan.
8. **🟢 [Past] Bus Factor (Hujjatlashtirish va Jamoa):** Loyiha 1 kishiga bog'liqlik xavfiga ega.

---

## 4. Bozor Bahosi (Valuation Framework)

### A) Cost-Based (Tannarx Usuli)
* Total Dev Time: **320 soat**
* O'zbekiston bozori ($15/soat): **$4,800 USD**
* Jahon bozori ($50/soat): **$16,000 USD**

### B) Market-Comparable (Bozor Narxlari Solishtirmasi)
* Custom restoran kassa tizimi yozib berish (O'zbekiston): **$3,000 – $5,000 USD**

### 💰 Tavsiya Etilgan Narx:
$$\text{Narx} = \$3,000 + \left(\frac{6.5}{10}\right) \times (\$5,000 - \$3,000) = \mathbf{\$4,300 \text{ USD}} \quad (\approx \mathbf{55.5 \text{ mln UZS}})$$

---

## 5. UI/UX & Funksional Takliflar (Raqobatdan O'zish Uchun)

| Funksiya / Yechim | Murakkablik | Soat | O'zbekiston narxi | Tavsiya etilgan narx |
|---|---|---|---|---|
| **1. Dynamic Cash Change Calculator (Kassa Naqd Qaytim)** | Oson | 4 soat | $50 – $100 | **$80** |
| **2. Telegram Instant Z-Report & Audit Bot** | O'rta | 16 soat | $200 – $400 | **$300** |
| **3. WebP Image Compression (Rasmlar hajmini 90% kichraytirish)** | Oson | 4 soat | $50 – $80 | **$60** |
| **4. Interaktiv KDS (Oshxona Display Ekrani)** | O'rta | 20 soat | $300 – $600 | **$450** |
| **5. Zod Validation & Rate-Limiter Middleware** | Oson | 8 soat | $100 – $200 | **$150** |

---

## 6. Keyingi 3 Oylik Yo'l Xaritasi (Roadmap)

1. **1-Oy (Xavfsizlik va Tezlik):** Rasmlarni WebP o'tkazish, Express Rate-limiter va Zod validatorlarni ulash.
2. **2-Oy (Biznes va Telegram Bot):** Smena yopilganda Telegram guruhga avtomatik Z-Report fayl va fotosuratli hisobot yuborish.
3. **3-Oy (Multi-Tenancy SaaS):** Prisma schema'ga `Tenant` modelini kiratib, tizimni ko'p restoranli SaaS platformasiga aylantirish.
