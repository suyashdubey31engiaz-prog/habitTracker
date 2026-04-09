const express = require('express');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');
const router = express.Router();

// All routes protected
router.use(auth);

// GET /api/habits — get all habits for user
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.userId, isActive: true }).sort('order');
    res.json(habits);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/habits — create habit
router.post('/', async (req, res) => {
  try {
    const { name, emoji, color, description, targetDaysPerWeek, targetDays, reminderTime } = req.body;
    if (!name) return res.status(400).json({ message: 'Habit name required' });

    const count = await Habit.countDocuments({ userId: req.userId, isActive: true });
    const habit = new Habit({
      userId: req.userId, name, emoji, color, description,
      targetDaysPerWeek, targetDays, reminderTime, order: count
    });
    await habit.save();
    res.status(201).json(habit);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/habits/:id — update habit
router.put('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true }
    );
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json(habit);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/habits/:id — soft delete
router.delete('/:id', async (req, res) => {
  try {
    await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isActive: false }
    );
    res.json({ message: 'Habit deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;