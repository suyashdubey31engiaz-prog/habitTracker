const express = require('express');
const HabitLog = require('../models/HabitLog');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.userId };
    if (startDate && endDate) query.date = { $gte: startDate, $lte: endDate };
    const logs = await HabitLog.find(query);
    res.json(logs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { habitId, date, completed, note } = req.body;
    if (!habitId || !date) return res.status(400).json({ message: 'habitId and date required' });

    const habit = await Habit.findOne({ _id: habitId, userId: req.userId });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const log = await HabitLog.findOneAndUpdate(
      { userId: req.userId, habitId, date },
      { completed: completed !== undefined ? completed : true, note: note || '' },
      { upsert: true, new: true }
    );
    res.json(log);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.userId, isActive: true });

    if (!habits.length) {
      return res.json({ totalCompletions: 0, currentStreak: 0, bestStreak: 0, weeklyData: [], habitStats: [] });
    }

    const habitIds = habits.map(h => h._id);

    const allLogs = await HabitLog.find({
      userId: req.userId,
      habitId: { $in: habitIds },
      completed: true
    }).sort('date');

    if (!allLogs.length) {
      return res.json({ totalCompletions: 0, currentStreak: 0, bestStreak: 0, weeklyData: [], habitStats: [] });
    }

    const logsByDate = {};
    const logsByHabit = {};

    allLogs.forEach(log => {
      if (!logsByDate[log.date]) logsByDate[log.date] = new Set();
      logsByDate[log.date].add(log.habitId.toString());

      const hid = log.habitId.toString();
      if (!logsByHabit[hid]) logsByHabit[hid] = new Set();
      logsByHabit[hid].add(log.date);
    });

    const today = getUTCDateStr(new Date());
    const yesterday = getUTCDateStr(new Date(Date.now() - 86400000));

    // Global current streak
    let currentStreak = 0;
    let checkDate = logsByDate[today] ? today : yesterday;
    while (logsByDate[checkDate] && logsByDate[checkDate].size > 0) {
      currentStreak++;
      checkDate = getUTCDateStr(new Date(new Date(checkDate).getTime() - 86400000));
    }

    // Global best streak
    let bestStreak = 0;
    let tempStreak = 0;
    let prevDate = null;
    for (const date of [...Object.keys(logsByDate)].sort()) {
      if (!prevDate) { tempStreak = 1; }
      else {
        const diff = (new Date(date) - new Date(prevDate)) / 86400000;
        tempStreak = diff === 1 ? tempStreak + 1 : 1;
      }
      bestStreak = Math.max(bestStreak, tempStreak);
      prevDate = date;
    }

    // Last 28 days for heatmap
    const weeklyData = [];
    for (let i = 27; i >= 0; i--) {
      const d = getUTCDateStr(new Date(Date.now() - i * 86400000));
      weeklyData.push({
        date: d,
        completed: logsByDate[d] ? logsByDate[d].size : 0,
        total: habits.length
      });
    }

    // Per-habit stats including individual streak
    const habitStats = habits.map(habit => {
      const hid = habit._id.toString();
      const hDates = logsByHabit[hid] || new Set();
      const totalDays = Math.max(1, Math.ceil((Date.now() - new Date(habit.createdAt)) / 86400000));
      const completionRate = Math.min(100, Math.round((hDates.size / Math.min(totalDays, 30)) * 100));

      // Per-habit current streak
      let habitStreak = 0;
      let hCheck = hDates.has(today) ? today : hDates.has(yesterday) ? yesterday : null;
      while (hCheck && hDates.has(hCheck)) {
        habitStreak++;
        hCheck = getUTCDateStr(new Date(new Date(hCheck).getTime() - 86400000));
      }

      // Per-habit best streak
      let hBest = 0, hTemp = 0, hPrev = null;
      for (const d of [...hDates].sort()) {
        if (!hPrev) { hTemp = 1; }
        else {
          const diff = (new Date(d) - new Date(hPrev)) / 86400000;
          hTemp = diff === 1 ? hTemp + 1 : 1;
        }
        hBest = Math.max(hBest, hTemp);
        hPrev = d;
      }

      return {
        id: habit._id,
        name: habit.name,
        emoji: habit.emoji,
        color: habit.color,
        totalCompletions: hDates.size,
        completionRate,
        currentStreak: habitStreak,
        bestStreak: hBest,
      };
    });

    res.json({ totalCompletions: allLogs.length, currentStreak, bestStreak, weeklyData, habitStats });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

function getUTCDateStr(d) {
  return d.toISOString().split('T')[0];
}

module.exports = router;