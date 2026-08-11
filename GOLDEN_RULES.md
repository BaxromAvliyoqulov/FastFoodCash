# 📜 GOLDEN RULES — FastFoodCash (Fast Food Kassa & Full Audit System)

> **Primary Source of Truth & Project State Ledger**  
> ushbu fayl loyihaning me'moriy qoidalari, faol va tugallangan topshiriqlari hamda arxitektura standartlarini belgilaydi.

---

## 1. 🚀 Loyiha Passporti (Project Identity)

* **Loyiha nomi:** FastFoodCash
* **Tavsif:** Fast Food restoranlar zanjiri uchun yuqori tezlikdagi POS Kassa, Ingrediyentlar Retseptura Spisaniyesi (BOM), Smena Cash Auditi (Z-Report) hamda O'g'rilik/Reviziya Auditi (Discrepancy Tracker) ekosistemasi.
* **Tech Stack:**
  * **Frontend:** Vue 3 (`<script setup>` + TypeScript) + Vite + TailwindCSS + Pinia + Lucide Icons
  * **Backend:** Express / Node.js (TypeScript) + Prisma ORM + SQLite (`dev.db`)
  * **Real-time & Security:** Anti-Fraud Audit Radar, Blind Shift Reconciliation Engine
  * **Soliq & Printer:** Web EscPos Chek Printer Engine & Fiscal Simulation

---

## 2. 📋 Loyiha Holati va Roadmap (Project State & Roadmap)

### 🟢 Tugallangan Vazifalar (Completed)
- [x] 1-bosqich: Frontend Vue 3 + Vite va Backend TypeScript/Express arxitekturasi noldan o'rnatildi.
- [x] 2-bosqich: Prisma Schema (`schema.prisma`) — Retseptura (BOM), Ingrediyentlar, Smena Auditi va Anti-Fraud Log jadvallari yaratildi va bazaga seed qilindi.
- [x] 3-bosqich: Vue 3 POS Kassa Interfeysi (Kategoriya, Modifikatorlar, Savatcha, Dynamic Payment modal) to'liq tayyorlandi.
- [x] 4-bosqich: Smena Ochish / Ko'r-kassir Yopish (Z-Report) va Kamchilik (Shortage) audit algoritmi backend va frontendda ishga tushirildi.
- [x] 5-bosqich: Reviziya (Shift Quick Audit) & Anti-Fraud Radar loglari realizatsiya qilindi.
- [x] 6-bosqich: Vercel Full QA Audit & 100/100 Perfection — Savdo Tarixi (HistoryView) Order Details Modal, Chekni Qayta Chop Etish (Re-print Receipt), Ombor Kirim (Intake) va Isrof (Waste) modallari to'liq ulandi.
- [x] 7-bosqich: Crash-Safe Money formatting (`formatters.ts`) va Vercel Offline-First Storage Fallbacks joriy etildi (`vue-tsc` & Vite build 100% PASS).

---

## 3. 🎯 AI Dev Team Protocol Reference
Ushbu loyihada ish olib borishda global `nova-jarvis-core`, `ui-ux-logic-mind-stone`, `code-safety-and-network-rules`, `error-handling-standards`, `uzbekistan-business-context` va `ai-development-team-protocol` skillarining qoidalariga to'liq amal qilingan.

---

## 4. 🔀 Git Workflow & Auto Push Protocol
- **Avtomatik Git Push Rejimi:** Ushbu loyihada har bir topshiriq va tuzatish muvaffaqiyatli bajarilib, build va testlar tasdiqlangach, alohida buyruq kutilmasdan avtomatik ravishda `git add`, `git commit` va `git push origin main` bajarilishi shart.

