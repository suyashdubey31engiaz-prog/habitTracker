const express = require('express');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.userId, isActive: true }).sort('order');
    res.json(habits);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

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

// PUT /api/habits/reorder — bulk update order
// IMPORTANT: this must come BEFORE /:id to avoid "reorder" being treated as an id
router.put('/reorder', async (req, res) => {
  try {
    const { order } = req.body; // [{ id, order }]
    if (!Array.isArray(order)) return res.status(400).json({ message: 'order array required' });

    await Promise.all(order.map(({ id, order: o }) =>
      Habit.updateOne({ _id: id, userId: req.userId }, { order: o })
    ));
    res.json({ message: 'Reordered' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

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