// frontend/src/pages/Catalog.jsx (добавляем кнопки редактирования/удаления)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTelegramUser } from '../hooks/useTelegramUser';

const API_URL = 'https://telegram-shop-api-2n1h.onrender.com/api';

function Catalog() {
  const navigate = useNavigate();
  const { user, initData } = useTelegramUser();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    checkAdminStatus();
  }, []);

  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  const checkAdminStatus = async () => {
    if (!initData) return;
    try {
      await axios.get(`${API_URL}/admin/categories`, {
        headers: { 'x-telegram-init-data': initData }
      });
      setIsAdmin(true);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data);
    } catch (error) {
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
    } catch (error) {
      setError('Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Удалить товар "${productName}"?`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/admin/products/${productId}`, {
        headers: { 'x-telegram-init-data': initData }
      });
      // Обновляем список товаров
      fetchProducts(selectedCategory);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    } catch (error) {
      alert('Ошибка при удалении товара');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
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
      {/* Кнопка добавления товара (только для админов) */}
      {isAdmin && (
        <div style={styles.adminBar}>
          <button 
            onClick={() => navigate('/admin')}
            style={styles.addButton}
          >
            ➕ Добавить товар
          </button>
        </div>
      )}

      {/* Категории */}
      <div style={styles.categoriesSection}>
        <h2 style={styles.sectionTitle}>Категории</h2>
        <div style={styles.categoriesGrid}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(prevId => 
                prevId === cat.id ? null : cat.id
              )}
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
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                  {product.images && product.images.length > 0 && (
                    <img 
                      src={typeof product.images[0] === 'string' 
                        ? product.images[0] 
                        : product.images[0]?.url} 
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
                  </div>
                </Link>
                
                {/* Админские кнопки */}
                {isAdmin && (
                  <div style={styles.adminActions}>
                    <button 
                      onClick={() => navigate(`/admin/${product.id}`)}
                      style={styles.editBtn}
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id, product.name)}
                      style={styles.deleteBtn}
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                )}
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
  adminBar: {
    marginBottom: '20px',
    textAlign: 'right'
  },
  addButton: {
    padding: '10px 20px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
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
    border: '1px solid #eee',
    position: 'relative'
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
    fontWeight: '500',
    color: 'var(--tg-theme-text-color, #000)'
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
  adminActions: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    display: 'flex',
    gap: '5px'
  },
  editBtn: {
    padding: '5px 10px',
    background: '#ffc107',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  deleteBtn: {
    padding: '5px 10px',
    background: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

export default Catalog;