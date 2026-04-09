const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
  date: { type: String, required: true }, // "YYYY-MM-DD" — easy to query
  completed: { type: Boolean, default: true },
  note: { type: String, default: '' },
}, { timestamps: true });

// Compound unique index: one log per habit per day per user
habitLogSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HabitLog', habitLogSchema);
