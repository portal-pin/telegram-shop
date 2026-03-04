// backend/index.js
    const express = require('express');
    const TelegramBot = require('node-telegram-bot-api');
    const cors = require('cors');
    const dotenv = require('dotenv');

    // Грузим настройки из .env файла
    dotenv.config();

    const app = express();
    const PORT = process.env.PORT || 5000;

    // Разрешаем фронту обращаться к нам
    app.use(cors());
    // Говорим серверу, что мы будем общаться в JSON формате
    app.use(express.json());

    // ------ ТЕЛЕГРАМ БОТ ------
    // Токен мы потом пропишем, пока пусть будет
    const botToken = process.env.BOT_TOKEN;
    // Если токена нет, не запускаем бота
    if (!botToken) {
        console.log("Бот не запущен: не указан BOT_TOKEN в .env файле");
    } else {
        const bot = new TelegramBot(botToken, { polling: true });

        // Команда /start
        bot.onText(/\/start/, (msg) => {
            const chatId = msg.chat.id;
            const chatName = msg.from.first_name || 'друг';
            bot.sendMessage(chatId, `Привет, ${chatName}! Добро пожаловать в наш магазин! 🛍️`, {
                reply_markup: {
                    inline_keyboard: [
                        // Ссылку на фронт тоже позже пропишем
                        [{ text: '🛒 Открыть магазин', web_app: { url: process.env.MINI_APP_URL || 'https://example.com' } }]
                    ]
                }
            });
        });

        console.log('🤖 Telegram Bot запущен и слушает команды...');
    }

    // ------ API ДЛЯ ФРОНТА (Mini App) ------
    // Простой роут, который отдаёт список товаров
    app.get('/api/products', (req, res) => {
        // Пока товары просто в коде, потом будем из базы брать
        const products = [
            { id: 1, name: 'Крутая футболка с принтом', price: 1990, image: 'https://via.placeholder.com/300' },
            { id: 2, name: 'Бейсболка "Ночной кодер"', price: 1290, image: 'https://via.placeholder.com/300' },
            { id: 3, name: 'Худи "404 Sleep Not Found"', price: 3490, image: 'https://via.placeholder.com/300' },
        ];
        res.json(products);
    });

    // Запускаем сервер
    app.listen(PORT, () => {
        console.log(`🚀 API сервер запущен на http://localhost:${PORT}`);
        console.log(`📦 Товары доступны по адресу http://localhost:${PORT}/api/products`);
    });