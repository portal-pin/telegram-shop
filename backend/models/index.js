// backend/models/index.js
const sequelize = require('../config/database');
const Category = require('./Category');
const Product = require('./Product');

const syncDatabase = async () => {
  try {
    // Временно отключаем синхронизацию или используем alter: false
    await sequelize.sync({ alter: false }); // Было alter: true
    
    // Проверяем, есть ли новые поля
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='Products' AND column_name='mannequinParams'
    `);
    
    if (results.length === 0) {
      // Добавляем новые поля вручную
      await sequelize.query(`
        ALTER TABLE "Products" 
        ADD COLUMN "mannequinParams" VARCHAR(255),
        ADD COLUMN "myParams" VARCHAR(255),
        ADD COLUMN "detailedSizes" TEXT
      `);
      console.log('✅ Добавлены новые поля');
    }
    
    console.log('✅ Таблицы синхронизированы');
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