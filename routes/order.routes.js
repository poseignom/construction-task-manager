// routes/order.routes.js
const express = require('express');
const { createOrder, getOrderById, getMyOrders, updateOrderStatus } = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Все маршруты требуют авторизации
router.use(authMiddleware);

// POST /api/v1/orders - Создать заказ
router.post('/', createOrder);
// GET /api/v1/orders/my - Получить свои заказы (с пагинацией ?page=1&limit=10)
router.get('/my', getMyOrders);
// GET /api/v1/orders/:id - Получить заказ по ID
router.get('/:id', getOrderById);
// PATCH /api/v1/orders/:id/status - Обновить статус заказа
router.patch('/:id/status', updateOrderStatus);

module.exports = router;