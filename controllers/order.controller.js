// controllers/order.controller.js
const Order = require('../models/Order');

const createOrder = async (req, res) => {
    try {
        const { items, totalAmount } = req.body;
        const userId = req.user.id; // ID текущего пользователя из токена

        // Простейшая валидация
        if (!items || !Array.isArray(items) || items.length === 0 || !totalAmount) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Некорректные данные заказа' }
            });
        }

        const newOrder = await Order.create({
            userId,
            items,
            totalAmount,
            status: 'created'
        });

        // Здесь можно "опубликовать событие" (в будущем)
        // console.log('Событие: Заказ создан', newOrder.id);

        res.status(201).json({
            success: true,
            data: newOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: error.message }
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: { code: 'ORDER_NOT_FOUND', message: 'Заказ не найден' }
            });
        }

        // Проверяем права: заказ может видеть либо его владелец, либо админ
        if (order.userId !== req.user.id && !req.user.roles.includes('admin')) {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Нет доступа к этому заказу' }
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: error.message }
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        // Пагинация: параметры `page` и `limit` из query-строки (?page=1&limit=10)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        const allMyOrders = await Order.findByUserId(req.user.id);

        // Простая имитация пагинации "на лету" (в реальности это делает БД)
        const paginatedOrders = allMyOrders.slice(startIndex, startIndex + limit);

        res.json({
            success: true,
            data: {
                orders: paginatedOrders,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(allMyOrders.length / limit),
                    totalOrders: allMyOrders.length
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: error.message }
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatuses = ['in_progress', 'completed', 'cancelled'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Недопустимый статус' }
            });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: { code: 'ORDER_NOT_FOUND', message: 'Заказ не найден' }
            });
        }

        // Проверка прав: статус может менять либо админ, либо владелец (только на "cancelled")
        const isOwner = order.userId === req.user.id;
        const isAdmin = req.user.roles.includes('admin');

        if (!isAdmin && (!isOwner || status !== 'cancelled')) {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Недостаточно прав для изменения статуса' }
            });
        }

        const updatedOrder = await Order.update(order.id, { status });

        // console.log('Событие: Статус заказа обновлён', updatedOrder.id, status);

        res.json({
            success: true,
            data: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: error.message }
        });
    }
};

module.exports = {
    createOrder,
    getOrderById,
    getMyOrders,
    updateOrderStatus
};