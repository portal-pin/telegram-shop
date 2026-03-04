// backend/config/database.js
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: process.env.DATABASE_URL.includes('localhost') || !process.env.DATABASE_URL.includes('render.com') 
    ? {} // Для локальной разработки без SSL
    : process.env.DATABASE_URL.includes('internal')
      ? {} // Internal URL на Render - SSL не нужен
      : { // External URL - нужен SSL
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Проверка подключения
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключение к базе данных установлено!');
    console.log(`🔌 Используется URL: ${process.env.DATABASE_URL.substring(0, 30)}...`);
    
    await sequelize.sync({ alter: true });
    console.log('✅ Таблицы синхронизированы');
  } catch (error) {
    console.error('❌ Ошибка подключения к базе:', error.message);
  }
};

testConnection();

module.exports = sequelize;