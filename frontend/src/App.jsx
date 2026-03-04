import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Catalog from './pages/Catalog';
import './App.css';

function App() {
    useEffect(() => {
        // Инициализируем Telegram WebApp
        const tg = window.Telegram?.WebApp;
        if (tg) {
            tg.ready();
            tg.expand(); // Разворачиваем на весь экран
            console.log('Telegram WebApp инициализирован');
        }
    }, []);

    return (
        <BrowserRouter>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Catalog />} />
                    {/* Добавим сюда корзину позже */}
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;