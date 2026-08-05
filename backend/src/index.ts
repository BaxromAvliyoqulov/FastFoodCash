import express from 'express';
import cors from 'cors';
import { loginByPin } from './controllers/auth.controller';
import { getProducts, createProduct, updateProduct, deleteProduct } from './controllers/product.controller';
import { createOrder, cancelOrder } from './controllers/order.controller';
import { getActiveShift, openShift, closeShiftBlind } from './controllers/shift.controller';
import { getIngredients, quickRevision, getAuditLogs } from './controllers/audit.controller';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

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

app.post('/api/v1/orders', createOrder);
app.post('/api/v1/orders/cancel', cancelOrder);

app.get('/api/v1/shifts/active', getActiveShift);
app.post('/api/v1/shifts/open', openShift);
app.post('/api/v1/shifts/close-blind', closeShiftBlind);

app.get('/api/v1/ingredients', getIngredients);
app.post('/api/v1/audit/quick-revision', quickRevision);
app.get('/api/v1/audit/logs', getAuditLogs);

app.listen(PORT, () => {
  console.log(`🚀 FastFoodCash API server running on port ${PORT}`);
});
