# 📑 TEXNIK TOPSHIRIQ (TZ) — FastFoodCash Ecosystem

## 1. Maqsad va qamrov (Purpose & scope)
FastFoodCash — Fast Food restoranlar va tezkor ovqatlanish shahobchalari uchun mo'ljallangan Enterprise-grade kassa, hisob-kitob va avtomatlashtirilgan audit tizimi. Tizim kassirga buyurtmalarni o'ta tezlik bilan rasmiylashtirish (POS), ingrediyentlarni texnologik karta (BOM) bo'yicha real-vaqtda ombordan avto-spisaniya qilish, smena yopilishida ko'r-kassir (Blind Cash Reconciliation) usuli bilan kassa balansi kam-ko'stini audit qilish va smena o'rtasida ingredientlar reviziyasini o'tkazish imkonini beradi.

---

## 2. Foydalanuvchi rollari (User roles)

| Rol nomi | Huquq va Imkoniyatlar | Cheklovlar (Ruxsat etilmagan harakatlar) |
|---|---|---|
| **CASHIER (Kassir)** | POS kassa orqali buyurtma urish, to'lovlarni qabul qilish, smena ochish/yopishda pul sanab kiritish, o'z smena ko'rsatkichlarini ko'rish. | Order Void/Cancel qilish, retsepturani o'zgartirish, kassa balansini ko'rish (yopishgacha), boshqa smena auditlarini o'chirish. |
| **MANAGER (Menejer)** | Order Cancel/Void'ni PIN-kod bilan tasdiqlash, smena yopilish auditi va kamchiliklarni ko'rish, smena reviziyasini o'tkazish, ombor kirimini qilish. | Tizim sozlamalarini va foydalanuvchilar rollarini o'chirish. |
| **CHEF / KITCHEN (Oshxona/Povar)** | KDS (Kitchen Display System) orqali tushgan buyurtmalarni ko'rish, "Tayyorlanmoqda" va "Tayyor" statusini o'zgartirish. | Narxlar, to me'moriy moliya va kassa auditiga kirish. |
| **STOREKEEPER (Ombormon)** | Ingrediyentlar kirimi, yarim tayyor mahsulotlar marinovkasi, brak/isrof (waste) belgilash va oylik reviziya. | POS kassadan sotuv qilish va smena yopish. |
| **ADMIN / OWNER (Ega/Bosh Admin)** | Cheksiz huquq: Barcha moliya reportlari, ABC/XYZ analiz, foydalanuvchilar boshqaruvi, audit loglarini ko'rish. | Cheklov yo'q. |

---

## 3. Ma'lumotlar bazasi sxemasi (DB schema)

```sql
-- PostgreSQL / Prisma ORM Schema Preview

-- 1. Users & Roles
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  pin_code VARCHAR(6) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('CASHIER', 'MANAGER', 'CHEF', 'STOREKEEPER', 'ADMIN')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ingredients & Stock
CREATE TABLE ingredients (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(20) NOT NULL CHECK (unit IN ('GRAM', 'KG', 'LITER', 'MILLILITER', 'PIECE')),
  current_stock DECIMAL(12, 3) DEFAULT 0.000,
  min_stock_alert DECIMAL(12, 3) DEFAULT 0.000,
  cost_per_unit DECIMAL(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products & Recipes (BOM)
CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recipes (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id VARCHAR(36) REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_required DECIMAL(12, 3) NOT NULL, -- e.g. 0.150 kg or 1 piece
  waste_percentage DECIMAL(5, 2) DEFAULT 0.00
);

-- 4. Shifts & Cash Audits
CREATE TABLE shifts (
  id VARCHAR(36) PRIMARY KEY,
  cashier_id VARCHAR(36) REFERENCES users(id),
  opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP,
  initial_cash DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED'))
);

CREATE TABLE shift_cash_audits (
  id VARCHAR(36) PRIMARY KEY,
  shift_id VARCHAR(36) UNIQUE REFERENCES shifts(id),
  expected_cash DECIMAL(12, 2) NOT NULL,
  declared_cash DECIMAL(12, 2) NOT NULL, -- kassir sanab kiritgan pul
  difference DECIMAL(12, 2) NOT NULL, -- declared - expected (minus bo'lsa kamchilik)
  declared_card DECIMAL(12, 2) NOT NULL,
  declared_qr DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('BALANCED', 'SHORTAGE', 'SURPLUS')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Orders & Payments
CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY,
  order_number INT NOT NULL,
  shift_id VARCHAR(36) REFERENCES shifts(id),
  cashier_id VARCHAR(36) REFERENCES users(id),
  total_amount DECIMAL(12, 2) NOT NULL,
  payment_type VARCHAR(36) NOT NULL CHECK (payment_type IN ('CASH', 'CARD', 'CLICK_PAYME', 'DELIVERY_PARTNER')),
  status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COOKING', 'READY', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Anti-Fraud Audit Log
CREATE TABLE audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- e.g. 'CANCEL_ORDER', 'OPEN_DRAWER', 'SHORTAGE_DETECTED'
  details_json JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. API jadvali (API table)

| Method | Path | Auth required? | Request body | Response | Error cases |
|---|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | No | `{ phone, pin_code }` | `{ token, user }` | `401 Invalid PIN` |
| `POST` | `/api/v1/shifts/open` | Yes (CASHIER) | `{ initial_cash }` | `{ shift_id, status: 'OPEN' }` | `400 Shift already open` |
| `POST` | `/api/v1/shifts/close` | Yes (CASHIER) | `{ declared_cash, declared_card, declared_qr }` | `{ audit_result, difference, status }` | `400 Shift not found` |
| `POST` | `/api/v1/orders` | Yes (CASHIER) | `{ items: [{ product_id, quantity, modifiers }], payment_type }` | `{ order_id, order_number, total_amount }` | `400 Stock insufficient` |
| `POST` | `/api/v1/orders/:id/cancel` | Yes (MANAGER) | `{ manager_pin, reason }` | `{ status: 'CANCELLED' }` | `403 Invalid Manager PIN` |
| `POST` | `/api/v1/audit/quick-revision` | Yes (MANAGER) | `{ items: [{ ingredient_id, actual_weight }] }` | `{ discrepancies: [...] }` | `400 Invalid data` |

---

## 5. Ekranlar ro'yxati (Screens list)

* **POS Kassa Paneli:** Kassir uchun mahsulotlar karkasi, modifikatorlar dialogi, savatcha va to'lovni 1 bosishda tasdiqlash ekrani.
* **Smena Ochish va Ko'r-Yopish Modali:** Kassir smena boshida pul kiritadigan va smena oxirida tizim balansini ko me'rmasdan naqd/karta tushumini kirituvchi ekran.
* **Oshxona KDS Ekrani:** Povar uchun real-vaqtda kelayotgan buyurtmalar gridi (tayyorlash va tayyor tugmalari bilan).
* **Retseptura (BOM) Boshqaruvi:** Har bir burger/lavash orqasida qancha gramm ingrediyent va o'ram ketishini soflash ekrani.
* **Shift Cash & Inventory Audit Paneli:** Menejer uchun smena kamchiliklari (Shortage), kassa farqlari va anti-fraud qizil ogohlantirishlarini ko'rish oynasi.

---

## 6. Qabul qilish mezonlari (Acceptance criteria)

1. **POS Order Speed:** Kassir 3 ta mahsulotni tanlab, to'lov turini bosib chek hosil qilish vaqti 2 sekunddan oshmasligi kerak.
2. **Auto-Deduction:** Cheeseburger sotilganda, ombordagi mol go'shti (110g), bulochka (1 dona) va pishloq (15g) aniy soniyada va to'g'ri grammda kamayishi shart.
3. **Blind Cash Reconciliation:** Kassir smena yopayotganda kassa balansidagi summani KO'RMAYDI. U sanab kiritgandan keyin epizodli audit generatsiya bo'ladi.
4. **Manager Cancel Guard:** Kassa urilgan buyurtmani bekor qilish tugmasi bosilganda javobgar Menejer PIN-kodi kiritilishi va audit logga yozilishi shart.

---

## 7. Chetga chiqish holatlari (Edge cases to handle)

* **Empty States:** Menyuda mahsulot bo'lmaganda yoki omborda ingrediyent nolga tushganda POSda ravon ogohlantirish ("Stop-list").
* **Offline Connectivity:** Internet uzilganda buyurtmalar mahalliy `IndexedDB`ga yoziladi, internet tiklangach avtomatik sinxronlanadi.
* **Concurrent Orders:** Bir vaqtning o'zida ikkita kassa bitta o'ramdagi oxirgi ingrediyentni sotganda salbiy stockga o'tib ketmaslik (Pessimistic DB locking).

---

## 8. Taxminlar va ochiq savollar (Assumptions & open questions)

* `[ASSUMPTION]` Valyuta sukut bo'yicha O'zbekiston so'mi (`UZS`).
* `[ASSUMPTION]` POS printer sukut bo'yicha ESC/POS 80mm yoki 58mm termal chek printeri.
