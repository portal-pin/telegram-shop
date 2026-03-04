// frontend/src/pages/Catalog.jsx
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://telegram-shop-api-2n1h.onrender.com/api';

function Catalog() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загружаем категории при загрузке страницы
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Когда меняется выбранная категория, грузим товары
  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
      setError('Не удалось загрузить категории');
    }
  };

  const fetchProducts = async (categoryId = null) => {
    setLoading(true);
    try {
      const url = categoryId 
        ? `${API_URL}/products?category=${categoryId}`
        : `${API_URL}/products`;
      
      const res = await axios.get(url);
      setProducts(res.data);
      setError(null);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      setError('Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(prevId => 
      prevId === categoryId ? null : categoryId
    );
  };

  // Функция для форматирования цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  // Функция для отображения состояния
  const getConditionLabel = (condition) => {
    const labels = {
      mint: 'Идеальное',
      excellent: 'Отличное',
      good: 'Хорошее',
      vintage: 'Винтаж'
    };
    return labels[condition] || condition;
  };

  if (error) {
    return (
      <div style={styles.center}>
        <p style={{ color: '#721c24' }}>{error}</p>
        <button onClick={() => window.location.reload()} style={styles.retryBtn}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Категории */}
      <div style={styles.categoriesSection}>
        <h2 style={styles.sectionTitle}>Категории</h2>
        <div style={styles.categoriesGrid}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              style={{
                ...styles.categoryBtn,
                ...(selectedCategory === cat.id ? styles.categoryBtnActive : {})
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Товары */}
      <div style={styles.productsSection}>
        <h2 style={styles.sectionTitle}>
          {selectedCategory 
            ? categories.find(c => c.id === selectedCategory)?.name 
            : 'Все товары'}
        </h2>
        
        {loading ? (
          <div style={styles.center}>Загрузка товаров...</div>
        ) : products.length === 0 ? (
          <div style={styles.center}>
            <p style={{ color: '#666' }}>В этой категории пока нет товаров</p>
          </div>
        ) : (
          <div style={styles.productsGrid}>
            {products.map(product => (
              <div key={product.id} style={styles.productCard}>
                {product.images && product.images.length > 0 && (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    style={styles.productImage}
                  />
                )}
                <div style={styles.productInfo}>
                  <h3 style={styles.productName}>{product.name}</h3>
                  <p style={styles.productPrice}>{formatPrice(product.price)}</p>
                  <div style={styles.productMeta}>
                    {product.brand && (
                      <span style={styles.productBrand}>{product.brand}</span>
                    )}
                    {product.era && (
                      <span style={styles.productEra}>{product.era}</span>
                    )}
                  </div>
                    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                        <button style={styles.detailsBtn}>
                            Подробнее
                        </button>
                    </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  },
  center: {
    textAlign: 'center',
    padding: '40px 20px'
  },
  retryBtn: {
    padding: '10px 20px',
    background: '#40a7e3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    marginTop: '10px',
    cursor: 'pointer'
  },
  categoriesSection: {
    marginBottom: '40px'
  },
  sectionTitle: {
    fontSize: '20px',
    marginBottom: '15px',
    color: 'var(--tg-theme-text-color, #000)'
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '10px'
  },
  categoryBtn: {
    padding: '12px',
    background: 'var(--tg-theme-secondary-bg-color, #f5f5f5)',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    color: 'var(--tg-theme-text-color, #000)'
  },
  categoryBtnActive: {
    background: 'var(--tg-theme-button-color, #40a7e3)',
    color: 'var(--tg-theme-button-text-color, #fff)',
    borderColor: 'var(--tg-theme-button-color, #40a7e3)'
  },
  productsSection: {
    marginTop: '20px'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  },
  productCard: {
    background: 'var(--tg-theme-secondary-bg-color, #f9f9f9)',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #eee'
  },
  productImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderBottom: '1px solid #eee'
  },
  productInfo: {
    padding: '15px'
  },
  productName: {
    fontSize: '16px',
    marginBottom: '8px',
    fontWeight: '500'
  },
  productPrice: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'var(--tg-theme-button-color, #40a7e3)',
    marginBottom: '8px'
  },
  productMeta: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    fontSize: '13px',
    color: '#666'
  },
  productBrand: {
    padding: '2px 8px',
    background: 'rgba(0,0,0,0.05)',
    borderRadius: '4px'
  },
  productEra: {
    padding: '2px 8px',
    background: 'rgba(0,0,0,0.05)',
    borderRadius: '4px'
  },
  detailsBtn: {
    width: '100%',
    padding: '10px',
    background: 'var(--tg-theme-button-color, #40a7e3)',
    color: 'var(--tg-theme-button-text-color, #fff)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'opacity 0.3s'
  }
};

export default Catalog;