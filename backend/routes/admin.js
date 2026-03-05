// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { Category, Product } = require('../models');
const uploadMultiple = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');

// Теперь все роуты защищены middleware
router.use(authMiddleware);

// Получить все категории
router.get('/categories', async (req, res) => {
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

// Загрузка изображений
router.post('/upload', uploadMultiple, async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Нет файлов для загрузки' });
    }

    const images = files.map(file => ({
      url: file.path,
      publicId: file.filename,
      isMain: false
    }));

    res.json({ 
      success: true, 
      images,
      message: `Загружено ${images.length} изображений`
    });
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    res.status(500).json({ error: error.message });
  }
});

// Создание товара
router.post('/products', async (req, res) => {
  try {
    const productData = req.body;
    
    if (!productData.name || !productData.price || !productData.categoryId) {
      return res.status(400).json({ 
        error: 'Название, цена и категория обязательны' 
      });
    }

    // Отмечаем главное фото (первое в массиве)
    if (productData.images && productData.images.length > 0) {
      productData.images = productData.images.map((img, index) => ({
        url: img,
        isMain: index === 0
      }));
    }

    const product = await Product.create({
      name: productData.name,
      description: productData.description || '',
      defects: productData.defects || '',
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
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    const updateData = req.body;
    
    // Обрабатываем главное фото
    if (updateData.images && updateData.images.length > 0) {
      updateData.images = updateData.images.map((img, index) => ({
        url: typeof img === 'string' ? img : img.url,
        isMain: index === 0
      }));
    }

    await product.update(updateData);
    res.json({ 
      success: true, 
      product,
      message: 'Товар обновлен'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удаление товара (полное удаление, не скрытие)
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    await product.destroy();
    res.json({ 
      success: true, 
      message: 'Товар удален'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;