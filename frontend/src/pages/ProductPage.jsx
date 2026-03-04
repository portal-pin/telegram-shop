// frontend/src/pages/ProductPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'https://telegram-shop-api-2n1h.onrender.com/api';

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [tg, setTg] = useState(null);

  useEffect(() => {
    const tgApp = window.Telegram?.WebApp;
    setTg(tgApp);
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${API_URL}/products/${id}`);
      setProduct(res.data);
    } catch (error) {
      console.error('Ошибка загрузки товара:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = () => {
    if (tg) {
      // Показываем сообщение в боте
      tg.showAlert('Скопируйте username менеджера: @manager');
      // Копируем в буфер обмена
      navigator.clipboard.writeText('@manager');
      tg.HapticFeedback?.notificationOccurred('success');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const getConditionLabel = (condition) => {
    const labels = {
      mint: 'Идеальное',
      excellent: 'Отличное',
      good: 'Хорошее',
      vintage: 'Винтаж'
    };
    return labels[condition] || condition;
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.loader}></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={styles.center}>
        <h2>Товар не найден</h2>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          ← Вернуться в каталог
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Кнопка назад */}
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← Назад
      </button>

      {/* Галерея изображений */}
      {product.images && product.images.length > 0 && (
        <div style={styles.gallery}>
          <img 
            src={product.images[selectedImage]} 
            alt={product.name}
            style={styles.mainImage}
          />
          
          {product.images.length > 1 && (
            <div style={styles.thumbnailGrid}>
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  style={{
                    ...styles.thumbnail,
                    ...(selectedImage === index ? styles.thumbnailActive : {})
                  }}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Информация о товаре */}
      <div style={styles.info}>
        <h1 style={styles.name}>{product.name}</h1>
        
        <div style={styles.priceBlock}>
          <span style={styles.price}>{formatPrice(product.price)}</span>
          {!product.isAvailable && (
            <span style={styles.soldOut}>Продано</span>
          )}
        </div>

        {/* Характеристики */}
        <div style={styles.characteristics}>
          {product.brand && (
            <div style={styles.charItem}>
              <span style={styles.charLabel}>Бренд:</span>
              <span style={styles.charValue}>{product.brand}</span>
            </div>
          )}
          {product.era && (
            <div style={styles.charItem}>
              <span style={styles.charLabel}>Эпоха:</span>
              <span style={styles.charValue}>{product.era}</span>
            </div>
          )}
          {product.condition && (
            <div style={styles.charItem}>
              <span style={styles.charLabel}>Состояние:</span>
              <span style={styles.charValue}>{getConditionLabel(product.condition)}</span>
            </div>
          )}
          {product.size && (
            <div style={styles.charItem}>
              <span style={styles.charLabel}>Размер:</span>
              <span style={styles.charValue}>{product.size}</span>
            </div>
          )}
          {product.material && (
            <div style={styles.charItem}>
              <span style={styles.charLabel}>Материал:</span>
              <span style={styles.charValue}>{product.material}</span>
            </div>
          )}
          {product.madeIn && (
            <div style={styles.charItem}>
              <span style={styles.charLabel}>Страна:</span>
              <span style={styles.charValue}>{product.madeIn}</span>
            </div>
          )}
        </div>

        {/* Описание */}
        {product.description && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📝 Описание</h3>
            <p style={styles.description}>{product.description}</p>
          </div>
        )}

        {/* ДЕФЕКТЫ/МИНУСЫ (новый блок) */}
        {product.defects && (
          <div style={styles.section}>
            <h3 style={{...styles.sectionTitle, color: '#ff6b6b'}}>⚠️ Дефекты/Минусы</h3>
            <p style={styles.defects}>{product.defects}</p>
          </div>
        )}

        {/* Кнопка связи */}
        <button 
          onClick={handleContactClick}
          style={styles.contactBtn}
          disabled={!product.isAvailable}
        >
          {product.isAvailable 
            ? '📲 Связаться с менеджером' 
            : '❌ Товар продан'
          }
        </button>

        <p style={styles.hint}>
          Нажмите кнопку выше, чтобы скопировать контакт менеджера
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    background: 'var(--tg-theme-bg-color, #fff)',
    color: 'var(--tg-theme-text-color, #000)'
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    textAlign: 'center',
    padding: '20px'
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
  backButton: {
    background: 'none',
    border: 'none',
    color: 'var(--tg-theme-button-color, #40a7e3)',
    fontSize: '16px',
    padding: '10px 0',
    cursor: 'pointer',
    marginBottom: '20px'
  },
  backBtn: {
    padding: '10px 20px',
    background: 'var(--tg-theme-button-color, #40a7e3)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    marginTop: '20px',
    cursor: 'pointer'
  },
  gallery: {
    marginBottom: '30px'
  },
  mainImage: {
    width: '100%',
    height: '400px',
    objectFit: 'cover',
    borderRadius: '12px',
    marginBottom: '10px'
  },
  thumbnailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
    gap: '10px'
  },
  thumbnail: {
    width: '100%',
    height: '70px',
    objectFit: 'cover',
    borderRadius: '8px',
    cursor: 'pointer',
    opacity: 0.6,
    transition: 'opacity 0.3s'
  },
  thumbnailActive: {
    opacity: 1,
    border: '2px solid var(--tg-theme-button-color, #40a7e3)'
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  name: {
    fontSize: '24px',
    fontWeight: '600',
    margin: 0
  },
  priceBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  price: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: 'var(--tg-theme-button-color, #40a7e3)'
  },
  soldOut: {
    padding: '4px 12px',
    background: '#dc3545',
    color: 'white',
    borderRadius: '20px',
    fontSize: '14px'
  },
  characteristics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px',
    padding: '15px',
    background: 'var(--tg-theme-secondary-bg-color, #f5f5f5)',
    borderRadius: '10px'
  },
  charItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  charLabel: {
    fontSize: '12px',
    color: 'var(--tg-theme-hint-color, #666)'
  },
  charValue: {
    fontSize: '14px',
    fontWeight: '500'
  },
  section: {
    marginTop: '10px'
  },
  sectionTitle: {
    fontSize: '18px',
    marginBottom: '10px',
    color: 'var(--tg-theme-text-color, #000)'
  },
  description: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: 'var(--tg-theme-text-color, #333)',
    whiteSpace: 'pre-wrap'
  },
  defects: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#ff6b6b',
    background: '#fff5f5',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid #ffc9c9'
  },
  contactBtn: {
    padding: '16px',
    background: 'var(--tg-theme-button-color, #40a7e3)',
    color: 'var(--tg-theme-button-text-color, #fff)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px'
  },
  hint: {
    fontSize: '12px',
    color: 'var(--tg-theme-hint-color, #999)',
    textAlign: 'center',
    marginTop: '10px'
  }
};

// Добавляем анимацию
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ProductPage;