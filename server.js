// server.js

// 1. Импортируем (подключаем) все необходимые библиотеки
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pino = require('pino'); // Логгер
const dotenv = require('dotenv');

// 2. Загружаем переменные окружения из файла .env (например, секретный ключ)
dotenv.config();

// 3. Создаём экземпляр приложения Express
const app = express();

// 4. Инициализируем логгер Pino
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// 5. Настраиваем ограничитель запросов: максимум 100 запросов с одного IP за 15 минут
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100
});
app.use(limiter); // Применяем ко всем запросам

// 6. Настраиваем промежуточное ПО (middleware)
app.use(cors()); // Разрешаем запросы с других доменов (CORS)
app.use(express.json()); // Позволяет серверу понимать JSON в теле запроса

// 7. Создаём своё middleware для логирования каждого запроса
app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] || Date.now().toString(); // Берём ID из заголовка или создаём новый
    req.requestId = requestId; // Сохраняем ID в объекте запроса
    logger.info({ requestId, method: req.method, url: req.url, ip: req.ip }, 'Incoming request');
    next(); // Передаём управление следующему обработчику
});

// 8. Подключаем маршруты (роуты)
// Префикс '/api/v1' как требует техзадание (версионирование API)
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/users', require('./routes/user.routes'));
app.use('/api/v1/orders', require('./routes/order.routes'));

// 8. Подключаем маршруты (роуты)
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/users', require('./routes/user.routes'));
app.use('/api/v1/orders', require('./routes/order.routes'));

// 9. Обработчик 404 (должен быть ПОСЛЕ всех маршрутов)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Запрашиваемый ресурс не найден'
        }
    });
});

// 11. Запускаем сервер
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});