// backend/scripts/fix-images.js
const { Product } = require('../models');

const fixImages = async () => {
  try {
    const products = await Product.findAll();
    
    for (const product of products) {
      if (product.images && product.images.length > 0) {
        // Преобразуем каждый image в строку URL
        const fixedImages = product.images.map(img => {
          if (typeof img === 'string') return img;
          if (img.url) return img.url;
          return null;
        }).filter(Boolean);
        
        await product.update({ images: fixedImages });
        console.log(`✅ Исправлен товар: ${product.name}`);
      }
    }
    console.log('🎉 Все изображения исправлены!');
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
};

fixImages();