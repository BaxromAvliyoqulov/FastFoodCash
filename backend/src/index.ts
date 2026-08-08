import express from 'express';
import cors from 'cors';
import { loginByPin } from './controllers/auth.controller';
import { getProducts, createProduct, updateProduct, deleteProduct } from './controllers/product.controller';
import { createOrder, cancelOrder, getOrders } from './controllers/order.controller';
import { getActiveShift, openShift, closeShiftBlind } from './controllers/shift.controller';
import { getIngredients, quickRevision, getAuditLogs } from './controllers/audit.controller';
import { getAllTables, createTable, updateTable, deleteTable } from './controllers/table.controller';
import { getDashboardStats } from './controllers/stats.controller';
import { setupSwagger } from './swagger';
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Setup Swagger
setupSwagger(app);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'FastFoodCash API Server (NOVA Engine)',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.post('/api/v1/auth/login', loginByPin);

// Products
app.get('/api/v1/products', getProducts);
app.post('/api/v1/products', createProduct);
app.put('/api/v1/products/:id', updateProduct);
app.delete('/api/v1/products/:id', deleteProduct);

app.get('/api/v1/orders', getOrders);
app.post('/api/v1/orders', createOrder);
app.post('/api/v1/orders/cancel', cancelOrder);

app.get('/api/v1/shifts/active', getActiveShift);
app.post('/api/v1/shifts/open', openShift);
app.post('/api/v1/shifts/close-blind', closeShiftBlind);

// Ingredients & Audit
app.get('/api/v1/ingredients', getIngredients);

// Dashboard Stats
app.get('/api/v1/stats/dashboard', getDashboardStats);

app.post('/api/v1/audit/quick-revision', quickRevision);
app.get('/api/v1/audit/logs', getAuditLogs);

// Tables
app.get('/api/v1/tables', getAllTables);
app.post('/api/v1/tables', createTable);
app.put('/api/v1/tables/:id', updateTable);
app.delete('/api/v1/tables/:id', deleteTable);

app.listen(PORT, () => {
  console.log(`🚀 FastFoodCash API server running on port ${PORT}`);
});
