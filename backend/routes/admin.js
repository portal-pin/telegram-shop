// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { Category, Product } = require('../models');
const upload = require('../middleware/upload');

// Простая защита админки (по желанию можно добавить нормальную авторизацию)
const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }
  next();
};

// Получить все категории для выпадающего списка
router.get('/categories', adminAuth, async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name', 'slug'],
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Загрузка изображений (до 5 штук)
router.post('/upload', adminAuth, upload.array('images', 5), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Нет файлов для загрузки' });
    }

    const images = files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));

    res.json({ 
      success: true, 
      images: images,
      message: `Загружено ${images.length} изображений`
    });
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    res.status(500).json({ error: error.message });
  }
});

// Создание товара
router.post('/products', adminAuth, async (req, res) => {
  try {
    const productData = req.body;
    
    // Валидация обязательных полей
    if (!productData.name || !productData.price || !productData.categoryId) {
      return res.status(400).json({ 
        error: 'Название, цена и категория обязательны' 
      });
    }

    // Создаем товар
    const product = await Product.create({
      name: productData.name,
      description: productData.description || '',
      price: productData.price,
      categoryId: productData.categoryId,
      condition: productData.condition || 'good',
      era: productData.era || '',
      brand: productData.brand || '',
      size: productData.size || '',
      material: productData.material || '',
      madeIn: productData.madeIn || '',
      images: productData.images || [],
      isAvailable: productData.isAvailable !== false
    });

    res.status(201).json({ 
      success: true, 
      product,
      message: 'Товар успешно создан'
    });
  } catch (error) {
    console.error('Ошибка создания товара:', error);
    res.status(500).json({ error: error.message });
  }
});

// Редактирование товара
router.put('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    await product.update(req.body);
    res.json({ 
      success: true, 
      product,
      message: 'Товар обновлен'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удаление товара (мягкое удаление - просто скрываем)
router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    await product.update({ isAvailable: false });
    res.json({ 
      success: true, 
      message: 'Товар скрыт из каталога'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;