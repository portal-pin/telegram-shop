// frontend/src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useTelegramUser } from '../hooks/useTelegramUser';

const API_URL = 'https://telegram-shop-api-2n1h.onrender.com/api';

function Admin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, initData, isReady } = useTelegramUser();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: '',
    description: '',
    defects: '',
    condition: 'good',
    era: '',
    brand: '',
    size: '',
    material: '',
    madeIn: '',
    images: [],
    isAvailable: true
  });

  // Проверяем авторизацию и загружаем данные
  useEffect(() => {
    if (isReady) {
      checkAuth();
      fetchCategories();
      if (id) {
        fetchProduct(id);
      }
    }
  }, [isReady, id]);

  const checkAuth = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/categories`, {
        headers: {
          'x-telegram-init-data': initData
        }
      });
      // Если запрос успешен - пользователь админ
      setIsAuthorized(true);
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      setIsAuthorized(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data);
    } catch (error) {
      showMessage('Ошибка загрузки категорий', 'error');
    }
  };

  const fetchProduct = async (productId) => {
    try {
      const res = await axios.get(`${API_URL}/products/${productId}`);
      const product = res.data;
      
      // Преобразуем объекты изображений обратно в массив URL
      const images = product.images?.map(img => 
        typeof img === 'string' ? img : img.url
      ) || [];

      setFormData({
        name: product.name || '',
        price: product.price || '',
        categoryId: product.categoryId || '',
        description: product.description || '',
        defects: product.defects || '',
        condition: product.condition || 'good',
        era: product.era || '',
        brand: product.brand || '',
        size: product.size || '',
        material: product.material || '',
        madeIn: product.madeIn || '',
        images: images,
        isAvailable: product.isAvailable !== false
      });
    } catch (error) {
      showMessage('Ошибка загрузки товара', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
          'x-telegram-init-data': initData,
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

  const setMainImage = (index) => {
    const newImages = [...formData.images];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);
    
    // Сохраняем как массив строк (URL)
    setFormData(prev => ({ ...prev, images: newImages }));
    
    // Показываем тактильный отклик
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.categoryId) {
      showMessage('Заполните название, цену и категорию', 'error');
      return;
    }

    setLoading(true);
    try {
      const url = id 
        ? `${API_URL}/admin/products/${id}`
        : `${API_URL}/admin/products`;
      
      const method = id ? 'put' : 'post';

      // Преобразуем массив строк в массив объектов с isMain
      const imagesForDb = formData.images.map((img, idx) => ({
        url: img,
        isMain: idx === 0 // Первое фото - главное
      }));

      const res = await axios[method](url, {
        ...formData,
        price: parseInt(formData.price),
        images: imagesForDb // Отправляем объекты, а не строки
      }, {
        headers: { 'x-telegram-init-data': initData }
      });

      if (res.data.success) {
        showMessage(id ? '✅ Товар обновлен!' : '✅ Товар добавлен!', 'success');
        if (!id) {
          setFormData({
            name: '', price: '', categoryId: '', description: '',
            defects: '', condition: 'good', era: '', brand: '',
            size: '', material: '', madeIn: '', images: [],
            isAvailable: true
          });
        }
        
        // Задержка перед возвратом в каталог
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
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
          <button 
            onClick={() => navigate('/')}
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
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← Назад
        </button>
        <h1 style={styles.title}>
          {id ? '✏️ Редактирование товара' : '➕ Добавление товара'}
        </h1>
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
          <label style={styles.label}>Фотографии товара (до 15 шт)</label>
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
                  {index === 0 && (
                    <span style={styles.mainBadge}>⭐</span>
                  )}
                  <button 
                    type="button" 
                    onClick={() => setMainImage(index)}
                    style={styles.setMainBtn}
                    title="Сделать главным"
                  >⭐</button>
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
            placeholder="История вещи, особенности..."
          />
        </div>

        <div style={styles.field}>
          <label style={{...styles.label, color: '#ff6b6b'}}>Дефекты/Минусы</label>
          <textarea
            name="defects"
            value={formData.defects}
            onChange={handleInputChange}
            style={{...styles.textarea, borderColor: '#ff6b6b'}}
            rows="3"
            placeholder="Потертости, отсутствие пуговиц, следы носки..."
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

        <div style={styles.field}>
          <label style={styles.label}>
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleInputChange}
            />
            {' '}Товар в наличии
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            ...styles.submitBtn,
            ...(loading ? styles.submitBtnDisabled : {})
          }}
        >
          {loading ? 'Загрузка...' : (id ? '💾 Сохранить изменения' : '➕ Добавить товар')}
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
  backBtn: {
    padding: '12px 30px',
    background: 'var(--tg-theme-button-color, #40a7e3)',
    color: 'var(--tg-theme-button-text-color, #fff)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: 'var(--tg-theme-button-color, #40a7e3)',
    fontSize: '16px',
    padding: '10px 0',
    cursor: 'pointer',
    marginBottom: '10px'
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
  mainBadge: {
    position: 'absolute',
    top: '5px',
    left: '5px',
    fontSize: '14px',
    background: 'rgba(0,0,0,0.5)',
    color: 'gold',
    padding: '2px 5px',
    borderRadius: '4px'
  },
  setMainBtn: {
    position: 'absolute',
    top: '5px',
    left: '5px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(255,215,0,0.8)',
    color: '#000',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
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
  submitBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
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

export default Admin;