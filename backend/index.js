// backend/index.js
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');
const dotenv = require('dotenv');
const { Category, Product } = require('./models'); // Импортируем модели
const adminRoutes = require('./routes/admin');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/admin', adminRoutes);

// ------ ТЕЛЕГРАМ БОТ ------
const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  console.log("⚠️ Бот не запущен: не указан BOT_TOKEN");
} else {
  const bot = new TelegramBot(botToken, { polling: true });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const chatName = msg.from.first_name || 'друг';
    bot.sendMessage(chatId, `Привет, ${chatName}! Добро пожаловать в винтажный магазин! 🕶️`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🛒 Открыть магазин', web_app: { url: process.env.MINI_APP_URL } }]
        ]
      }
    });
  });

  bot.on('polling_error', (error) => {
    if (error.code === 'EFATAL' && error.message.includes('ECONNRESET')) {
      console.log('🔄 Сетевая ошибка (нормально для разработки)');
    } else {
      console.log('❌ Ошибка бота:', error);
    }
  });

  console.log('🤖 Telegram Bot запущен');
}

// ------ API ДЛЯ КАТЕГОРИЙ ------
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { parentId: null }, // Только корневые категории
      include: [{ model: Category, as: 'subcategories' }],
      order: [['order', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ------ API ДЛЯ ТОВАРОВ ------
app.get('/api/products', async (req, res) => {
  try {
    const { category, era, brand, condition, sort } = req.query;
    
    // Строим фильтр
    const where = { isAvailable: true };
    if (category) where.categoryId = category;
    if (era) where.era = era;
    if (brand) where.brand = brand;
    if (condition) where.condition = condition;

    // Сортировка
    let order = [['createdAt', 'DESC']]; // по умолчанию новые сверху
    if (sort === 'price_asc') order = [['price', 'ASC']];
    if (sort === 'price_desc') order = [['price', 'DESC']];

    const products = await Product.findAll({
      where,
      include: [{ model: Category, attributes: ['name', 'slug'] }],
      order
    });

    res.json(products);
  } catch (error) {
    console.error('Ошибка получения товаров:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ------ API ДЛЯ ОДНОГО ТОВАРА ------
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category }]
    });
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.json(product);
  } catch (error) {
    console.error('Ошибка получения товара:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ------ ВРЕМЕННАЯ АДМИНКА ДЛЯ ДОБАВЛЕНИЯ ТЕСТОВЫХ ДАННЫХ ------
app.post('/api/admin/seed', async (req, res) => {
  try {
    // Создаём категории
    const clothing = await Category.create({
      name: 'Одежда',
      slug: 'clothing',
      description: 'Винтажная одежда',
      order: 1
    });

    const shoes = await Category.create({
      name: 'Обувь',
      slug: 'shoes',
      description: 'Винтажная обувь',
      order: 2
    });

    const jeans = await Category.create({
      name: 'Джинсы 90-х',
      slug: 'jeans-90s',
      description: 'Настоящий винтаж из 90-х',
      parentId: clothing.id,
      order: 1
    });

    // Создаём тестовые товары
    await Product.create({
      name: "Levi's 501 1993",
      description: 'Оригинальные джинсы 1993 года выпуска. Сделано в США. Отличное состояние, все бирки на месте.',
      price: 5900,
      condition: 'excellent',
      era: '90s',
      brand: "Levi's",
      size: 'W32 L34',
      material: '100% хлопок',
      madeIn: 'USA',
      images: ['https://via.placeholder.com/600x400?text=Levi+501'],
      categoryId: jeans.id
    });

    await Product.create({
      name: "Adidas Campus 80s",
      description: 'Винтажные кроссовки 80-х годов. Оригинальная замша, родная коробка.',
      price: 8900,
      condition: 'good',
      era: '80s',
      brand: 'Adidas',
      size: '42',
      material: 'Замша',
      madeIn: 'Germany',
      images: ['https://via.placeholder.com/600x400?text=Adidas+Campus'],
      categoryId: shoes.id
    });

    res.json({ message: '✅ Тестовые данные добавлены' });
  } catch (error) {
    console.error('Ошибка добавления тестовых данных:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API сервер запущен на порту ${PORT}`);
});