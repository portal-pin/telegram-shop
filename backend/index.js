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
app.post('/api/init-categories', async (req, res) => {
  try {
    const { Category } = require('./models');
    
    const categories = [
      { name: 'Пиджаки/Костюмы', slug: 'jackets-suits', order: 1 },
      { name: 'Юбки', slug: 'skirts', order: 2 },
      { name: 'Майки/Топы', slug: 'tops', order: 3 },
      { name: 'Брюки/Джинсы', slug: 'pants-jeans', order: 4 },
      { name: 'Свитеры/Кардиганы', slug: 'sweaters-cardigans', order: 5 },
      { name: 'Сумки/Аксессуары', slug: 'bags-accessories', order: 6 },
      { name: 'Платья', slug: 'dresses', order: 7 },
      { name: 'Рубашки/Блузы', slug: 'shirts-blouses', order: 8 },
      { name: 'Шорты', slug: 'shorts', order: 9 },
      { name: 'Обувь', slug: 'shoes', order: 10 },
      { name: 'Верхняя одежда', slug: 'outerwear', order: 11 }
    ];

    const count = await Category.count();
    if (count > 0) {
      return res.json({ message: `В базе уже есть ${count} категорий`, categories: await Category.findAll() });
    }

    for (const cat of categories) {
      await Category.create(cat);
    }

    res.json({ 
      message: '✅ Категории созданы!',
      categories: await Category.findAll()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API сервер запущен на порту ${PORT}`);
});