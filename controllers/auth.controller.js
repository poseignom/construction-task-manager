// controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Валидация (самая простая)
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Все поля обязательны' }
            });
        }

        // Проверяем, не зарегистрирован ли уже пользователь с такой почтой
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: { code: 'USER_EXISTS', message: 'Пользователь с таким email уже существует' }
            });
        }

        // Хэшируем пароль перед сохранением
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создаём пользователя в нашей "базе" (в памяти)
        const user = await User.create({
            email,
            passwordHash: hashedPassword, // Сохраняем ХЭШ, а не сам пароль!
            name,
            roles: ['user'] // По умолчанию роль 'user'
        });

        // Убираем пароль из ответа
        const userResponse = { ...user };
        delete userResponse.passwordHash;

        res.status(201).json({
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

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Находим пользователя
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: 'Неверный email или пароль' }
            });
        }

        // 2. Сравниваем присланный пароль с хэшем из базы
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: 'Неверный email или пароль' }
            });
        }

        // 3. Генерируем JWT-токен
        // В "payload" (полезной нагрузке) токена кладём ID пользователя
        const token = jwt.sign(
            { userId: user.id, email: user.email, roles: user.roles },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Токен действует 24 часа
        );

        // 4. Отправляем успешный ответ с токеном
        res.json({
            success: true,
            data: { token }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: error.message }
        });
    }
};

module.exports = {
    register,
    login
};