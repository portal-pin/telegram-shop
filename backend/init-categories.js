// backend/init-categories.js
const sequelize = require('./config/database');
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

const initCategories = async () => {
  try {
    console.log('🏷️  Начинаем инициализацию категорий...');
    
    // Проверяем, есть ли уже категории
    const count = await Category.count();
    if (count > 0) {
      console.log(`ℹ️  В базе уже есть ${count} категорий. Пропускаем инициализацию.`);
      return;
    }

    // Создаем категории
    for (const cat of categories) {
      await Category.create(cat);
      console.log(`  ✅ ${cat.name}`);
    }

    console.log('✅ Все категории успешно созданы!');
  } catch (error) {
    console.error('❌ Ошибка при создании категорий:', error);
  } finally {
    await sequelize.close();
  }
};

initCategories();