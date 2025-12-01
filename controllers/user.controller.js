// controllers/user.controller.js
const User = require('../models/User');

const getProfile = async (req, res) => {
    try {
        // Пользователь уже лежит в req.user благодаря auth.middleware
        const user = req.user;
        const userResponse = { ...user };
        delete userResponse.passwordHash; // Не показываем хэш пароля
        res.json({
            success: true,
            data: userResponse
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: error.message }
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const updates = {};
        // Разрешаем обновлять только имя (в реальном проекте - больше полей)
        if (req.body.name) updates.name = req.body.name;

        const updatedUser = await User.update(req.user.id, updates);
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                error: { code: 'USER_NOT_FOUND', message: 'Пользователь не найден' }
            });
        }

        const userResponse = { ...updatedUser };
        delete userResponse.passwordHash;
        res.json({
            success: true,
            data: userResponse
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: error.message }
        });
    }
};

// Функция только для администраторов
const getAllUsers = async (req, res) => {
    try {
        // Проверяем, есть ли у пользователя роль 'admin'
        if (!req.user.roles.includes('admin')) {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Недостаточно прав' }
            });
        }

        const users = await User.findAll();
        // Убираем пароли из ответа
        const safeUsers = users.map(u => {
            const { passwordHash, ...userWithoutPassword } = u;
            return userWithoutPassword;
        });

        res.json({
            success: true,
            data: safeUsers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: error.message }
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getAllUsers
};