// models/Telegram.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TelegramSchema = new mongoose.Schema({
  type: { type: String, enum: ['channel', 'group'], required: true},
  name: { type: String, required: true },
  link: { type: String, required: true },
  admin_name: { type: String, required: true },
  admin_number: { type: String, required: true },
  admin_email: { type: String, required: true },
  purpose: { type: String, required: true }
},
{ timestamps: true });

module.exports = mongoose.model('Telegram', TelegramSchema);
