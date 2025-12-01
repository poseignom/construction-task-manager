// models/User.js
// Вместо реальной базы данных используем массив. В реальном проекте здесь был бы код для работы с БД (например, Mongoose для MongoDB).
const users = []; // "База данных" пользователей

class User {
    static async create(userData) {
        // Генерируем "UUID" — просто случайную строку для примера
        const newUser = {
            id: Math.random().toString(36).substring(2) + Date.now().toString(36),
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        users.push(newUser);
        return newUser;
    }

    static async findByEmail(email) {
        return users.find(u => u.email === email);
    }

    static async findById(id) {
        return users.find(u => u.id === id);
    }

    static async update(id, updateData) {
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;
        users[index] = { ...users[index], ...updateData, updatedAt: new Date() };
        return users[index];
    }

    // Метод для "админа" — получить всех пользователей
    static async findAll() {
        return [...users]; // Возвращаем копию массива
    }
}

module.exports = User;