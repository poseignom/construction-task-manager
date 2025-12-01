// routes/user.routes.js
const express = require('express');
const { getProfile, updateProfile, getAllUsers } = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Все маршруты здесь защищены - требуют авторизации
router.use(authMiddleware);

// GET /api/v1/users/me - Получить свой профиль
router.get('/me', getProfile);
// PATCH /api/v1/users/me - Обновить свой профиль
router.patch('/me', updateProfile);
// GET /api/v1/users/ - Получить всех пользователей (только для админа)
router.get('/', getAllUsers);

module.exports = router;