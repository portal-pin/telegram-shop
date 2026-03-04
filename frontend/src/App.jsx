// frontend/src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Catalog from './pages/Catalog';
import Admin from './pages/Admin';
import ProductPage from './pages/ProductPage';

// Разрешенные пользователи (без @)
const ALLOWED_ADMINS = ['Margo_portal', 'Volkula66'];

function App() {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const tgApp = window.Telegram?.WebApp;
    if (tgApp) {
      tgApp.ready();
      tgApp.expand();
      setTg(tgApp);
      
      const userData = tgApp.initDataUnsafe?.user;
      setUser(userData);
      
      // ПРОВЕРКА: смотрим что приходит из Telegram
      console.log('🔥 Telegram user data:', userData);
      
      if (userData?.username) {
        // Убираем @ из проверки
        const username = userData.username;
        console.log('👤 Username из Telegram:', username);
        console.log('👤 Разрешенные:', ALLOWED_ADMINS);
        console.log('👤 Совпадение:', ALLOWED_ADMINS.includes(username));
        
        setIsAdmin(ALLOWED_ADMINS.includes(username));
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <div>
        {/* Для отладки - покажем текущего пользователя */}
        <div style={{padding: '10px', background: '#f0f0f0', fontSize: '12px'}}>
          Текущий пользователь: {user?.username || 'неизвестно'} 
          | Админ: {isAdmin ? '✅' : '❌'}
        </div>

        {isAdmin && (
          <div style={styles.nav}>
            <Link to="/" style={styles.link}>🏠 Каталог</Link>
            <Link to="/admin" style={styles.link}>👤 Админка</Link>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/product/:id" element={<ProductPage />} />
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
    borderBottom: '1px solid var(--tg-theme-hint-color, #ddd)'
  },
  link: {
    padding: '8px 16px',
    background: 'var(--tg-theme-bg-color, #fff)',
    color: 'var(--tg-theme-text-color, #000)',
    textDecoration: 'none',
    borderRadius: '20px',
    fontSize: '14px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }
};

export default App;

