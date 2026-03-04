// backend/config/database.js
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Создаём подключение к PostgreSQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Важно для Render!
    }
  },
  logging: false // Отключаем логи SQL запросов (для чистоты)
});

// Проверяем подключение
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключение к базе данных установлено!');
  } catch (error) {
    console.error('❌ Ошибка подключения к базе:', error);
  }
};

testConnection();

module.exports = sequelize;