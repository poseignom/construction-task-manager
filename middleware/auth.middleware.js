// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        // 1. Получаем токен из заголовка Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('Токен не предоставлен');
        }
        const token = authHeader.split(' ')[1]; // Извлекаем часть после "Bearer "

        // 2. Проверяем токен с помощью нашего секретного ключа
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Находим пользователя по ID из токена
        const user = await User.findById(decoded.userId);
        if (!user) {
            throw new Error('Пользователь не найден');
        }

        // 4. Добавляем информацию о пользователе в объект запроса (req)
        // Теперь следующие обработчики (контроллеры) будут знать, кто сделал запрос
        req.user = user;

        // 5. Передаём управление следующей функции
        next();
    } catch (error) {
        // Если что-то пошло не так (токен неверный, истёк и т.д.)
        res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Ошибка авторизации: ' + error.message
            }
        });
    }
};