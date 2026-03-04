import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Catalog() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Функция для загрузки товаров с нашего бэкенда
        const fetchProducts = async () => {
            try {
                // Стучимся на localhost:5000, где висит наш бэк
                const response = await axios.get('https://telegram-shop-api-2n1h.onrender.com/api/products');
                setProducts(response.data);
            } catch (error) {
                console.error('Ошибка загрузки товаров:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) return <div style={{textAlign: 'center', marginTop: '20px'}}>Загружаем товары...</div>;

    return (
        <div style={{padding: '10px'}}>
            <h2 style={{textAlign: 'center'}}>Наш каталог</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                {products.map(product => (
                    <div key={product.id} style={{
                        border: '1px solid #ddd',
                        borderRadius: '10px',
                        padding: '15px',
                        background: 'var(--tg-theme-bg-color, #fff)',
                        color: 'var(--tg-theme-text-color, #000)'
                    }}>
                        <h3>{product.name}</h3>
                        <p>Цена: {product.price} ₽</p>
                        <button style={{
                            background: 'var(--tg-theme-button-color, #40a7e3)',
                            color: 'var(--tg-theme-button-text-color, #fff)',
                            border: 'none',
                            padding: '10px 15px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            В корзину
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Catalog;