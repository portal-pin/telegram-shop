import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTelegramUser } from '../hooks/useTelegramUser';

const API_URL = 'https://telegram-shop-api-2n1h.onrender.com/api';

function Catalog() {
  const navigate = useNavigate();
  const { user, initData, isReady } = useTelegramUser();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [allStyles, setAllStyles] = useState([]); // Все доступные стили
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Загружаем все данные при инициализации
  useEffect(() => {
    if (isReady) {
      fetchAllStyles();
      fetchCategories();
      fetchProducts();
      checkAdminStatus();
    }
  }, [isReady]);

  // Загружаем товары при изменении фильтров
  useEffect(() => {
    if (isReady) {
      fetchProducts();
    }
  }, [selectedCategory, selectedStyle, isReady]);

  // Загружаем все доступные стили (без фильтров)
  const fetchAllStyles = async () => {
    try {
      const res = await axios.get(`${API_URL}/products?limit=1000`);
      const allProducts = res.data;
      
      // Собираем уникальные стили из всех товаров
      const styles = [...new Set(allProducts.map(p => p.era).filter(Boolean))];
      setAllStyles(styles);
      console.log('Все доступные стили:', styles);
    } catch (error) {
      console.error('Ошибка загрузки стилей:', error);
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/products`;
      const params = new URLSearchParams();
      
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      if (selectedStyle) {
        params.append('era', selectedStyle);
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      console.log('Запрос товаров:', url);
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

  const checkAdminStatus = async () => {
    if (!initData) {
      setCheckingAdmin(false);
      return;
    }
    
    try {
      await axios.get(`${API_URL}/admin/categories`, {
        headers: { 'x-telegram-init-data': initData }
      });
      setIsAdmin(true);
      console.log('✅ Админ доступ подтвержден');
    } catch (error) {
      console.log('❌ Не админ');
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const resetCategory = () => setSelectedCategory(null);
  const resetStyle = () => setSelectedStyle(null);
  const resetAll = () => {
    setSelectedCategory(null);
    setSelectedStyle(null);
  };

  const getImageUrl = (product) => {
    if (!product.images || !product.images.length) return null;
    
    const firstImage = product.images[0];
    if (typeof firstImage === 'string') return firstImage;
    if (firstImage && firstImage.url) return firstImage.url;
    return null;
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

  if (checkingAdmin || !isReady) {
    return (
      <div style={styles.center}>
        <div style={styles.loader}></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* КРАСИВЫЙ ЗАГОЛОВОК */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <span style={styles.titleGradient}>Портал</span>
          <span style={styles.titleVintage}> Vintage</span>
        </h1>
        <p style={styles.subtitle}>уникальные вещи с историей</p>
      </div>

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

      {/* Фильтр по стилям - используем allStyles */}
      {allStyles.length > 0 && (
        <div style={styles.filterSection}>
          <div style={styles.filterHeader}>
            <h3 style={styles.filterTitle}>Стиль</h3>
            {selectedStyle && (
              <button onClick={resetStyle} style={styles.resetSmallBtn}>
                Все стили
              </button>
            )}
          </div>
          <div style={styles.filterButtons}>
            {allStyles.map(style => (
              <button
                key={style}
                onClick={() => setSelectedStyle(prev => prev === style ? null : style)}
                style={{
                  ...styles.filterBtn,
                  ...(selectedStyle === style ? styles.filterBtnActive : {})
                }}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Категории */}
      <div style={styles.categoriesSection}>
        <div style={styles.filterHeader}>
          <h2 style={styles.sectionTitle}>Категории</h2>
          {selectedCategory && (
            <button onClick={resetCategory} style={styles.resetSmallBtn}>
              Все категории
            </button>
          )}
        </div>
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

      {/* Кнопка общего сброса */}
      {(selectedCategory || selectedStyle) && (
        <div style={styles.resetSection}>
          <button onClick={resetAll} style={styles.resetAllBtn}>
            ✕ Все товары
          </button>
        </div>
      )}

      {/* Товары */}
      <div style={styles.productsSection}>
        <h2 style={styles.sectionTitle}>
          {selectedCategory 
            ? categories.find(c => c.id === selectedCategory)?.name 
            : selectedStyle
              ? `Стиль: ${selectedStyle}`
              : 'Все товары'}
        </h2>
        
        {loading ? (
          <div style={styles.center}>
            <div style={styles.loader}></div>
            <p>Загрузка товаров...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={styles.center}>
            <p style={{ color: '#666' }}>В этой категории пока нет товаров</p>
          </div>
        ) : (
          <div style={styles.productsGrid}>
            {products.map(product => (
              <div key={product.id} style={styles.productCard}>
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  {product.images && product.images.length > 0 && (
                    <img 
                      src={getImageUrl(product)} 
                      alt={product.name}
                      style={styles.productImage}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Фото+не+доступно';
                      }}
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
                    <button style={styles.detailsBtn}>
                      Подробнее
                    </button>
                  </div>
                </Link>
                
                {isAdmin && (
                  <div style={styles.adminActions}>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/admin/${product.id}`);
                      }}
                      style={styles.editBtn}
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        if (window.confirm(`Удалить товар "${product.name}"?`)) {
                          handleDelete(product.id);
                        }
                      }}
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
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: '400px',
    padding: '40px 20px'
  },
  loader: {
    width: '40px',
    height: '40px',
    border: '3px solid var(--tg-theme-secondary-bg-color, #f3f3f3)',
    borderTop: '3px solid var(--tg-theme-button-color, #40a7e3)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    padding: '20px 0',
    borderBottom: '2px solid rgba(64, 167, 227, 0.2)'
  },
  title: {
    fontSize: 'clamp(32px, 8vw, 48px)',
    fontWeight: '800',
    margin: '0 0 10px 0',
    letterSpacing: '2px'
  },
  titleGradient: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
  },
  titleVintage: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    fontSize: '16px',
    color: 'var(--tg-theme-hint-color, #666)',
    letterSpacing: '1px',
    textTransform: 'uppercase'
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
  filterSection: {
    marginBottom: '30px',
    padding: '15px',
    background: 'var(--tg-theme-secondary-bg-color, #f5f5f5)',
    borderRadius: '12px'
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  filterTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
    color: 'var(--tg-theme-text-color, #000)'
  },
  filterButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  filterBtn: {
    padding: '8px 16px',
    background: 'var(--tg-theme-bg-color, #fff)',
    border: '1px solid #ddd',
    borderRadius: '20px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  filterBtnActive: {
    background: 'var(--tg-theme-button-color, #40a7e3)',
    color: '#fff',
    borderColor: 'var(--tg-theme-button-color, #40a7e3)'
  },
  resetSmallBtn: {
    padding: '4px 12px',
    background: 'none',
    color: 'var(--tg-theme-button-color, #40a7e3)',
    border: '1px solid var(--tg-theme-button-color, #40a7e3)',
    borderRadius: '16px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  categoriesSection: {
    marginBottom: '30px'
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
  resetSection: {
    marginBottom: '20px',
    textAlign: 'center'
  },
  resetAllBtn: {
    padding: '10px 30px',
    background: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer'
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
  },
  adminActions: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    display: 'flex',
    gap: '5px',
    zIndex: 10
  },
  editBtn: {
    padding: '5px 10px',
    background: '#ffc107',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  deleteBtn: {
    padding: '5px 10px',
    background: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  }
};

export default Catalog;