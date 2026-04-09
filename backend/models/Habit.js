const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  emoji: { type: String, default: '✅' },
  color: { type: String, default: '#52b788' },
  description: { type: String, default: '' },
  targetDaysPerWeek: { type: Number, default: 7, min: 1, max: 7 },
  // Which days: [0=Sun, 1=Mon, ..., 6=Sat]. Empty = every day
  targetDays: { type: [Number], default: [0,1,2,3,4,5,6] },
  reminderTime: { type: String, default: '' }, // "HH:MM" format
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
