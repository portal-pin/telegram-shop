// frontend/src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://telegram-shop-api.onrender.com/api';
const ADMIN_KEY = 'vintage2024';
// Разрешенные пользователи (Telegram ID)
const ALLOWED_USERS = ['@Margo_portal', '@volkula66'];

function Admin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
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
    checkTelegramAuth();
    fetchCategories();
  }, []);

  const checkTelegramAuth = () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      const user = tg.initDataUnsafe?.user;
      const username = user?.username ? `@${user.username}` : null;
      
      console.log('Telegram user:', user);
      console.log('Username:', username);
      
      if (username && ALLOWED_USERS.includes(username)) {
        setIsAuthorized(true);
        tg.MainButton.setText('Добавить товар');
        tg.MainButton.show();
      } else {
        setIsAuthorized(false);
      }
    }
    setCheckingAuth(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/categories`, {
        headers: { 'x-admin-key': ADMIN_KEY }
      });
      setCategories(res.data);
    } catch (error) {
      showMessage('Ошибка загрузки категорий', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
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
      }
    } catch (error) {
      showMessage('Ошибка при сохранении', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div style={styles.container}>
        <div style={styles.center}>
          <p>Проверка доступа...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div style={styles.container}>
        <div style={styles.center}>
          <h2 style={{ color: '#721c24' }}>🚫 Доступ запрещен</h2>
          <p>Эта страница только для менеджеров магазина.</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '20px' }}>
            Если вы менеджер, убедитесь что открываете админку через Telegram.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🎨 Добавление товара</h1>
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
    color: 'var(--tg-theme-text-color, #000)'
  },
  center: {
    textAlign: 'center',
    padding: '50px 20px'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    fontSize: '24px',
    marginBottom: '10px'
  },
  message: {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px'
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
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    background: 'var(--tg-theme-secondary-bg-color, #f5f5f5)'
  },
  select: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    background: 'var(--tg-theme-secondary-bg-color, #f5f5f5)'
  },
  textarea: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    resize: 'vertical',
    background: 'var(--tg-theme-secondary-bg-color, #f5f5f5)'
  },
  fileInput: {
    padding: '10px',
    background: 'var(--tg-theme-secondary-bg-color, #f5f5f5)',
    borderRadius: '8px',
    cursor: 'pointer'
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
    overflow: 'hidden'
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
    fontSize: '14px'
  },
  submitBtn: {
    padding: '15px',
    background: 'var(--tg-theme-button-color, #40a7e3)',
    color: 'var(--tg-theme-button-text-color, #fff)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px'
  },
  submitBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  }
};

export default Admin;