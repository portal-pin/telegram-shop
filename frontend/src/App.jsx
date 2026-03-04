// frontend/src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Catalog from './pages/Catalog';
import Admin from './pages/Admin';
import './App.css';

function App() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  return (
    <BrowserRouter>
      <div style={{ padding: '10px' }}>
        {/* Простая навигация для админа */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px',
          padding: '10px',
          background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)',
          borderRadius: '8px'
        }}>
          <Link to="/" style={linkStyle}>Каталог</Link>
          <Link to="/admin" style={linkStyle}>Админка</Link>
        </div>

        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const linkStyle = {
  color: 'var(--tg-theme-link-color, #007bff)',
  textDecoration: 'none',
  padding: '5px 10px',
  borderRadius: '5px'
};

export default App;