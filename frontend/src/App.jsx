// frontend/src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Catalog from './pages/Catalog';
import Admin from './pages/Admin';
import ProductPage from './pages/ProductPage';
import { useTelegramUser } from './hooks/useTelegramUser';

function App() {
  const { user } = useTelegramUser();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand(); // Раскрываем на весь экран
      document.body.style.margin = '0';
      document.body.style.padding = '0';
    }
  }, []);

  return (
    <BrowserRouter>
      <div style={styles.appContainer}>
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/:id" element={<Admin />} />
          <Route path="/product/:id" element={<ProductPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  appContainer: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--tg-theme-bg-color, #fff)',
    color: 'var(--tg-theme-text-color, #000)'
  }
};

export default App;