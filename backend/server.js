const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Импорт моделей Mongoose
const User = require('./models/User');
const Spot = require('./models/Spot');

// Настройки
const PORT = 5000;
const JWT_SECRET = 'supersecret_jwt_key';  // Секретный ключ для JWT (в реальном проекте хранится в .env)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/market_manager';

// Инициализация Express
const app = express();
app.use(cors());
app.use(express.json());  // парсинг JSON тела запросов

// Подключение к MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Миддлвар для проверки JWT токена в заголовках авторизации
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization']; 
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }
  // Формат заголовка: "Bearer TOKEN"
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Invalid token format' });
  }
  // Валидация токена
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }
    // Если токен валидный, сохраняем информацию о пользователе (например, decoded.id) в req и идём дальше
    req.userId = decoded.id;
    next();
  });
}

// === Маршруты ===

// Авторизация администратора
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }
    // Проверяем пароль
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }
    // Генерируем JWT токен (в пейлоад можно положить id пользователя и имя)
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Получение списка всех мест (только для авторизованного администратора)
app.get('/api/spots', verifyToken, async (req, res) => {
  try {
    const spots = await Spot.find({});
    res.json(spots);
  } catch (err) {
    console.error('Failed to get spots:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Обновление статуса и данных арендатора для места (только админ)
app.put('/api/spots/:id', verifyToken, async (req, res) => {
  try {
    const spotId = req.params.id;
    const { status, name, phone, startDate, endDate } = req.body;
    // Формируем обновляемые данные
    let update = { status: status };
    if (status === 'free') {
      // Если помечаем как свободное, очистим информацию об арендаторе
      update.tenant = {};
    } else {
      // Иначе, задаем новые данные арендатора
      update.tenant = {
        name: name,
        phone: phone,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      };
    }
    const updatedSpot = await Spot.findByIdAndUpdate(spotId, update, { new: true });
    res.json(updatedSpot);
  } catch (err) {
    console.error('Failed to update spot:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

