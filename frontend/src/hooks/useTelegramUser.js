// frontend/src/hooks/useTelegramUser.js
import { useState, useEffect } from 'react';

export const useTelegramUser = () => {
  const [user, setUser] = useState(null);
  const [initData, setInitData] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      setInitData(tg.initData);
      setUser(tg.initDataUnsafe?.user);
      setIsReady(true);
    }
  }, []);

  return { user, initData, isReady };
};