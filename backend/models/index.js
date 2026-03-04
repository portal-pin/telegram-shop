// backend/models/index.js
const sequelize = require('../config/database');
const Category = require('./Category');
const Product = require('./Product');

// Синхронизируем модели с базой данных
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // alter: true - обновляет таблицы без удаления данных
    console.log('✅ Таблицы синхронизированы с базой');
  } catch (error) {
    console.error('❌ Ошибка синхронизации:', error);
  }
};

syncDatabase();

module.exports = {
  sequelize,
  Category,
  Product
};