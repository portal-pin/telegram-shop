// frontend/src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Catalog from './pages/Catalog';
import Admin from './pages/Admin';

// Разрешенные пользователи
const ALLOWED_ADMINS = ['@Margo_portal', '@volkula66'];

function App() {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Инициализация Telegram Web App
    const tgApp = window.Telegram?.WebApp;
    if (tgApp) {
      tgApp.ready();
      tgApp.expand();
      setTg(tgApp);
      
      // Получаем данные пользователя
      const userData = tgApp.initDataUnsafe?.user;
      setUser(userData);
      
      // Проверяем, является ли пользователь админом
      if (userData?.username) {
        const username = `@${userData.username}`;
        setIsAdmin(ALLOWED_ADMINS.includes(username));
        console.log('👤 Пользователь:', username, 'Админ:', ALLOWED_ADMINS.includes(username));
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <div>
        {/* Навигация - показываем только админам */}
        {isAdmin && (
          <div style={styles.nav}>
            <Link 
              to="/" 
              style={styles.link}
              onClick={() => tg?.HapticFeedback?.impactOccurred('light')}
            >
              🏠 Каталог
            </Link>
            <Link 
              to="/admin" 
              style={styles.link}
              onClick={() => tg?.HapticFeedback?.impactOccurred('light')}
            >
              👤 Админка
            </Link>
          </div>
        )}

        {/* Приветствие для всех */}
        {user && (
          <div style={styles.welcome}>
            Привет, {user.first_name}! 
            {user.username && ` @${user.username}`}
          </div>
        )}

        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  nav: {
    display: 'flex',
    gap: '10px',
    padding: '10px',
    background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)',
    borderBottom: '1px solid var(--tg-theme-hint-color, #ddd)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(10px)'
  },
  link: {
    padding: '8px 16px',
    background: 'var(--tg-theme-bg-color, #fff)',
    color: 'var(--tg-theme-text-color, #000)',
    textDecoration: 'none',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    cursor: 'pointer'
  },
  welcome: {
    padding: '10px 16px',
    fontSize: '14px',
    color: 'var(--tg-theme-hint-color, #666)',
    borderBottom: '1px solid var(--tg-theme-hint-color, #eee)'
  }
};

export default App;