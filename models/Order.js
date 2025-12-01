// models/Order.js
const orders = [];

class Order {
    static async create(orderData) {
        const newOrder = {
            id: Math.random().toString(36).substring(2) + Date.now().toString(36),
            ...orderData,
            status: 'created', // Статус по умолчанию: создан
            createdAt: new Date(),
            updatedAt: new Date()
        };
        orders.push(newOrder);
        return newOrder;
    }

    static async findById(id) {
        return orders.find(o => o.id === id);
    }

    // Получить все заказы конкретного пользователя
    static async findByUserId(userId) {
        return orders.filter(o => o.userId === userId);
    }

    static async update(id, updateData) {
        const index = orders.findIndex(o => o.id === id);
        if (index === -1) return null;
        orders[index] = { ...orders[index], ...updateData, updatedAt: new Date() };
        return orders[index];
    }
}

module.exports = Order;