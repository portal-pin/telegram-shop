// frontend/src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://telegram-shop-api-2n1h.onrender.com/api';
const ADMIN_KEY = 'vintage2024';
const ALLOWED_ADMINS = ['@Margo_portal', '@volkula66'];

function Admin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [tg, setTg] = useState(null);
  
  // Данные формы
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: '',
    description: '',
    condition: 'good',
    era: '',
    brand: '',
    size: '',
    material: '',
    madeIn: '',
    images: []
  });

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    const tgApp = window.Telegram?.WebApp;
    setTg(tgApp);
    checkTelegramAuth();
    fetchCategories();
  }, []);

  const checkTelegramAuth = () => {
    const tgApp = window.Telegram?.WebApp;
    if (tgApp) {
      const user = tgApp.initDataUnsafe?.user;
      const username = user?.username ? `@${user.username}` : null;
      
      console.log('👤 Проверка доступа:', {
        username,
        isAllowed: username && ALLOWED_ADMINS.includes(username)
      });
      
      if (username && ALLOWED_ADMINS.includes(username)) {
        setIsAuthorized(true);
        // Вибрация при успешном входе
        tgApp.HapticFeedback?.notificationOccurred('success');
      } else {
        setIsAuthorized(false);
      }
    }
    setCheckingAuth(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data);
    } catch (error) {
      showMessage('Ошибка загрузки категорий', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    if (type === 'success') {
      tg?.HapticFeedback?.notificationOccurred('success');
    } else {
      tg?.HapticFeedback?.notificationOccurred('error');
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    try {
      const res = await axios.post(`${API_URL}/admin/upload`, formData, {
        headers: { 
          'x-admin-key': ADMIN_KEY,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        const newImages = res.data.images.map(img => img.url);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages]
        }));
        showMessage('Фото загружены!', 'success');
        tg?.HapticFeedback?.impactOccurred('medium');
      }
    } catch (error) {
      showMessage('Ошибка загрузки фото', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    tg?.HapticFeedback?.impactOccurred('light');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.categoryId) {
      showMessage('Заполните название, цену и категорию', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/admin/products`, {
        ...formData,
        price: parseInt(formData.price)
      }, {
        headers: { 'x-admin-key': ADMIN_KEY }
      });

      if (res.data.success) {
        showMessage('✅ Товар добавлен!', 'success');
        setFormData({
          name: '', price: '', categoryId: '', description: '',
          condition: 'good', era: '', brand: '', size: '',
          material: '', madeIn: '', images: []
        });
        tg?.HapticFeedback?.impactOccurred('heavy');
      }
    } catch (error) {
      showMessage('Ошибка при сохранении', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div style={styles.center}>
        <div style={styles.loader}></div>
        <p>Проверка доступа...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div style={styles.container}>
        <div style={styles.denied}>
          <span style={styles.deniedIcon}>🚫</span>
          <h2 style={styles.deniedTitle}>Доступ запрещен</h2>
          <p style={styles.deniedText}>
            Эта страница только для менеджеров магазина.
          </p>
          <p style={styles.deniedHint}>
            Если вы менеджер, убедитесь что открываете админку через Telegram.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            style={styles.backBtn}
          >
            ← Вернуться в каталог
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>➕ Добавление товара</h1>
        {message.text && (
          <div style={{
            ...styles.message,
            ...(message.type === 'success' ? styles.success : styles.error)
          }}>
            {message.text}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.grid}>
          <div style={styles.field}>
            <label style={styles.label}>Название товара *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="Levi's 501 1993"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Цена (₽) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="5900"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Категория *</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              style={styles.select}
            >
              <option value="">Выберите категорию</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Фотографии товара</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            style={styles.fileInput}
            disabled={loading}
          />
          
          {formData.images.length > 0 && (
            <div style={styles.previewGrid}>
              {formData.images.map((img, index) => (
                <div key={index} style={styles.previewItem}>
                  <img src={img} alt={`preview ${index}`} style={styles.previewImg} />
                  <button 
                    type="button" 
                    onClick={() => removeImage(index)}
                    style={styles.removeBtn}
                    title="Удалить фото"
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Описание</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            style={styles.textarea}
            rows="4"
            placeholder="История вещи, особенности, состояние..."
          />
        </div>

        <div style={styles.grid}>
          <div style={styles.field}>
            <label style={styles.label}>Состояние</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              style={styles.select}
            >
              <option value="mint">Mint (идеальное)</option>
              <option value="excellent">Excellent (отличное)</option>
              <option value="good">Good (хорошее)</option>
              <option value="vintage">Vintage (винтаж)</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Эпоха</label>
            <input
              type="text"
              name="era"
              value={formData.era}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="80s, 90s, 00s"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Бренд</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="Levi's, Nike, etc"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Размер</label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="S, M, L, 42, etc"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Материал</label>
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="100% хлопок"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Страна производства</label>
            <input
              type="text"
              name="madeIn"
              value={formData.madeIn}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="USA, Italy, etc"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            ...styles.submitBtn,
            ...(loading ? styles.submitBtnDisabled : {})
          }}
        >
          {loading ? 'Загрузка...' : '➕ Добавить товар'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    background: 'var(--tg-theme-bg-color, #fff)',
    color: 'var(--tg-theme-text-color, #000)',
    minHeight: '100vh'
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
  denied: {
    textAlign: 'center',
    maxWidth: '400px',
    margin: '0 auto'
  },
  deniedIcon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '20px'
  },
  deniedTitle: {
    fontSize: '24px',
    marginBottom: '10px',
    color: '#721c24'
  },
  deniedText: {
    fontSize: '16px',
    marginBottom: '20px',
    color: 'var(--tg-theme-text-color, #000)'
  },
  deniedHint: {
    fontSize: '14px',
    color: 'var(--tg-theme-hint-color, #666)',
    marginBottom: '30px'
  },
  backBtn: {
    padding: '12px 30px',
    background: 'var(--tg-theme-button-color, #40a7e3)',
    color: 'var(--tg-theme-button-text-color, #fff)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    fontSize: '24px',
    marginBottom: '15px',
    color: 'var(--tg-theme-text-color, #000)'
  },
  message: {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    animation: 'slideIn 0.3s ease'
  },
  success: {
    background: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb'
  },
  error: {
    background: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontWeight: '500',
    fontSize: '14px',
    color: 'var(--tg-theme-hint-color, #666)'
  },
  input: {
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid var(--tg-theme-hint-color, #ddd)',
    fontSize: '16px',
    background: 'var(--tg-theme-secondary-bg-color, #f5f5f5)',
    color: 'var(--tg-theme-text-color, #000)'
  },
  select: {
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid var(--tg-theme-hint-color, #ddd)',
    fontSize: '16px',
    background: 'var(--tg-theme-secondary-bg-color, #f5f5f5)',
    color: 'var(--tg-theme-text-color, #000)'
  },
  textarea: {
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid var(--tg-theme-hint-color, #ddd)',
    fontSize: '16px',
    resize: 'vertical',
    background: 'var(--tg-theme-secondary-bg-color, #f5f5f5)',
    color: 'var(--tg-theme-text-color, #000)'
  },
  fileInput: {
    padding: '12px',
    background: 'var(--tg-theme-secondary-bg-color, #f5f5f5)',
    borderRadius: '10px',
    cursor: 'pointer',
    border: '1px dashed var(--tg-theme-hint-color, #ddd)'
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '10px',
    marginTop: '10px'
  },
  previewItem: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  removeBtn: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(255,0,0,0.8)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    transition: 'transform 0.2s'
  },
  submitBtn: {
    padding: '16px',
    background: 'var(--tg-theme-button-color, #40a7e3)',
    color: 'var(--tg-theme-button-text-color, #fff)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'opacity 0.3s'
  },
  submitBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  }
};

// Добавляем анимации
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Admin;