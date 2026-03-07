// backend/models/Product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./Category');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  defects: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  mannequinParams: {
    type: DataTypes.STRING,
    allowNull: true
  },
  myParams: {
    type: DataTypes.STRING,
    allowNull: true
  },
  detailedSizes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  condition: {
    type: DataTypes.ENUM('mint', 'excellent', 'good', 'vintage'),
    allowNull: true,
    defaultValue: 'good'
  },
  era: {
    type: DataTypes.STRING,
    allowNull: true
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true
  },
  material: {
    type: DataTypes.STRING,
    allowNull: true
  },
  madeIn: {
    type: DataTypes.STRING,
    allowNull: true
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
    // Добавляем геттер для совместимости
    get() {
      const rawValue = this.getDataValue('images');
      if (!rawValue) return [];
      
      // Если это массив строк - возвращаем как есть
      if (Array.isArray(rawValue) && rawValue.every(item => typeof item === 'string')) {
        return rawValue;
      }
      
      // Если это массив объектов - преобразуем в массив строк
      if (Array.isArray(rawValue)) {
        return rawValue.map(item => {
          if (typeof item === 'string') return item;
          if (item && item.url) return item.url;
          return null;
        }).filter(Boolean);
      }
      
      return [];
    },
    // Добавляем сеттер для правильного сохранения
    set(value) {
      if (!value) {
        this.setDataValue('images', []);
        return;
      }
      
      // Всегда сохраняем как массив строк
      if (Array.isArray(value)) {
        const stringArray = value.map(item => {
          if (typeof item === 'string') return item;
          if (item && item.url) return item.url;
          return null;
        }).filter(Boolean);
        this.setDataValue('images', stringArray);
      } else {
        this.setDataValue('images', []);
      }
    }
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

// Определяем связи
Product.belongsTo(Category, { 
  foreignKey: 'categoryId',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Category.hasMany(Product, { foreignKey: 'categoryId' });

module.exports = Product;