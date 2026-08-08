# FastFoodCash 🍔🍟

FastFoodCash is a modern, high-performance Point of Sale (POS) system built for fast food restaurants. It features a complete offline-first capability, real-time sync, ingredient-level inventory management, and an integrated Telegram Bot for instant reporting.

## 🌟 Key Features
- **Offline-First (PWA):** Cashiers can take orders even when the internet goes down. Data syncs automatically when the connection is restored.
- **Micro-Components UI:** Extremely fast Vue 3 interface designed for touch screens and high-speed cashier interactions.
- **Inventory & Recipes:** Track raw ingredients (grams, pieces) and deduct them automatically based on the recipe of the sold product.
- **Shift Management:** Cashier shifts, blind closing, cash declaration, and discrepancy tracking (Shortage/Surplus).
- **Telegram Integration:** Daily reports and real-time alerts sent directly to management via Telegram.

---

## 🛠️ Technology Stack
- **Frontend:** Vue 3 (Composition API), Vite, TypeScript, Pinia (State), TailwindCSS, Vitest.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, Jest.
- **Database:** PostgreSQL (Production) / SQLite (Development).
- **CI/CD:** GitHub Actions.

---

## 🚀 Getting Started (Onboarding)

### 1. Prerequisites
- Node.js (v20 or higher)
- npm (v10 or higher)
- PostgreSQL (Optional, defaults to SQLite for quick setup)

### 2. Clone and Install
```bash
# Clone the repository
git clone https://github.com/your-username/FastFoodCash.git
cd FastFoodCash

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 3. Environment Variables
In the `backend` folder, create a `.env` file:
```env
# backend/.env
PORT=4000
DATABASE_URL="file:./dev.db" # Or your PostgreSQL URL
TELEGRAM_BOT_TOKEN="your_bot_token_here"
TELEGRAM_CHAT_ID="your_chat_id"
```

In the `frontend` folder, create a `.env` file:
```env
# frontend/.env
VITE_API_URL=http://localhost:4000/api/v1
```

### 4. Database Setup (Prisma)
```bash
cd backend
npm run prisma:generate
npm run prisma:push
```

### 5. Running the Application
Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Server will run on http://localhost:4000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# App will run on http://localhost:3000
```

---

## 📚 Documentation & Architecture
- **API Documentation (Swagger):** Once the backend is running, visit [http://localhost:4000/api-docs](http://localhost:4000/api-docs) to view and test all API endpoints interactively.
- **Database Schema (ERD):** See `docs/architecture/ERD.md` for a visual representation of all tables and relationships.
- **AI Audit Reports:** See `docs/audits/` for deep technical audits and recommendations.

## ✅ Testing
Both frontend and backend are covered by automated tests.

**Run Backend Tests (Jest):**
```bash
cd backend
npm run test
```

**Run Frontend Tests (Vitest):**
```bash
cd frontend
npm run test
```

## 🤝 Contributing
1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes following conventional commits
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request. CI/CD will automatically run tests and type checking.

---
**Maintained by BaxromAvliyoqulov / FastFoodCash**
