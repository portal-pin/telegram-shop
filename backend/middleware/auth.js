// backend/middleware/auth.js
const crypto = require('crypto');

// Разрешённые ID пользователей (не username, а числовой ID из Telegram)
const ALLOWED_ADMINS = [123456789, 6063610157]; // ЗАМЕНИ НА РЕАЛЬНЫЕ ID @Margo_portal и @volkula66

const validateTelegramData = (initData, botToken) => {
  try {
    // Парсим строку запроса
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');

    // Сортируем параметры
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создаём секретный ключ из токена бота
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Вычисляем хеш
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  } catch (error) {
    console.error('Ошибка валидации:', error);
    return false;
  }
};

const authMiddleware = async (req, res, next) => {
  try {
    const initData = req.headers['x-telegram-init-data'];
    const botToken = process.env.BOT_TOKEN;

    if (!initData || !botToken) {
      return res.status(401).json({ error: 'Нет данных авторизации' });
    }

    // Проверяем подпись
    const isValid = validateTelegramData(initData, botToken);
    if (!isValid) {
      return res.status(403).json({ error: 'Недействительная подпись' });
    }

    // Парсим данные пользователя
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    if (!userStr) {
      return res.status(401).json({ error: 'Нет данных пользователя' });
    }

    const user = JSON.parse(userStr);
    
    // Проверяем, является ли пользователь админом по ID
    if (!ALLOWED_ADMINS.includes(user.id)) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }

    // Добавляем пользователя в запрос для дальнейшего использования
    req.telegramUser = user;
    next();
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = authMiddleware;