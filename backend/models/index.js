// backend/models/index.js
const sequelize = require('../config/database');
const Category = require('./Category');
const Product = require('./Product');

// Простая синхронизация без сложных проверок
const syncDatabase = async () => {
  try {
    // Используем alter: true чтобы обновить структуру таблиц
    await sequelize.sync({ alter: true });
    console.log('✅ Таблицы синхронизированы с базой');
  } catch (error) {
    console.error('❌ Ошибка синхронизации:', error.message);
  }
};

syncDatabase();

module.exports = {
  sequelize,
  Category,
  Product
};