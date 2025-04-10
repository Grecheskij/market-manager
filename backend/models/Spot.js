const mongoose = require('mongoose');

const SpotSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },              // Номер места (1-200)
  status: { type: String, enum: ['free', 'reserved', 'rented'], required: true, default: 'free' },
  tenant: {
    name: String,        // ФИО арендатора
    phone: String,       // Телефон
    startDate: Date,     // Дата начала аренды
    endDate: Date        // Дата окончания аренды
  }
});

module.exports = mongoose.model('Spot', SpotSchema);
