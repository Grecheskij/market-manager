const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Spot = require('../models/Spot');

// Параметры подключения (используем ту же базу, что и в основном приложении)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/market_manager';

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for seeding.');

    // 1. Создаем администратора, если не существует
    const adminUsername = 'admin';
    const adminPassword = 'admin123';
    const existingAdmin = await User.findOne({ username: adminUsername });
    if (!existingAdmin) {
      const hashedPwd = await bcrypt.hash(adminPassword, 10);
      await User.create({ username: adminUsername, password: hashedPwd });
      console.log(`Admin user created -> login: ${adminUsername}, password: ${adminPassword}`);
    } else {
      console.log('Admin user already exists, skipping creation.');
    }

    // 2. Создаем места (1..200), если не созданы
    const spotCount = await Spot.countDocuments();
    if (spotCount === 0) {
      const spots = [];
      for (let i = 1; i <= 200; i++) {
        spots.push({ number: i, status: 'free' });
      }
      await Spot.insertMany(spots);
      console.log('Inserted 200 spots with status free.');
    } else {
      console.log(`Spots already exist (count: ${spotCount}), skipping creation.`);
    }

    console.log('Seeding completed.');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    mongoose.disconnect();
  }
}

seedData();
