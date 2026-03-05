// frontend/src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Catalog from './pages/Catalog';
import Admin from './pages/Admin';
import ProductPage from './pages/ProductPage';
import { useTelegramUser } from './hooks/useTelegramUser';

function App() {
  const { user } = useTelegramUser();

  return (
    <BrowserRouter>
      <div>
        {/* Навигация только для админов будет внутри компонентов */}
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

export default App;