const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const auth = require('../middleware/auth');
const router = express.Router();

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Email regex — requires user@domain.tld format
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ── Validation ──────────────────────────────────────────────────
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });

    if (name.trim().length < 2)
      return res.status(400).json({ message: 'Name must be at least 2 characters' });

    if (!EMAIL_REGEX.test(email))
      return res.status(400).json({ message: 'Please enter a valid email address (e.g. you@example.com)' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    // ────────────────────────────────────────────────────────────────

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(400).json({ message: 'An account with this email already exists' });

    const user = new User({ name: name.trim(), email: email.toLowerCase().trim(), password });
    await user.save();
    const token = signToken(user._id);
    res.status(201).json({ token, user: user.toPublic() });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Validation ──────────────────────────────────────────────────
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    if (!EMAIL_REGEX.test(email))
      return res.status(400).json({ message: 'Please enter a valid email address' });
    // ────────────────────────────────────────────────────────────────

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = signToken(user._id);
    res.json({ token, user: user.toPublic() });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({ user: user.toPublic() });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/auth/profile — update name
router.put('/profile', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name required' });
    if (name.trim().length < 2) return res.status(400).json({ message: 'Name must be at least 2 characters' });
    const user = await User.findByIdAndUpdate(req.userId, { name: name.trim() }, { new: true });
    res.json({ user: user.toPublic() });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/auth/about — update extended profile
router.put('/about', auth, async (req, res) => {
  try {
    const allowed = [
      'age','gender','dateOfBirth','diet','occupation','occupationDetail',
      'fitnessLevel','healthGoals','allergies','waterGoal','sleepGoal',
      'weightKg','heightCm','city','bio'
    ];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    // Mark profile as complete if core fields filled
    const user = await User.findById(req.userId);
    const merged = { ...user.toObject(), ...updates };
    if (merged.age && merged.diet && merged.occupation) updates.profileComplete = true;

    const updated = await User.findByIdAndUpdate(req.userId, updates, { new: true });
    res.json({ user: updated.toPublic() });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/auth/password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both passwords required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Min 6 characters' });
    const user = await User.findById(req.userId);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/auth/data
router.delete('/data', auth, async (req, res) => {
  try {
    await Habit.deleteMany({ userId: req.userId });
    await HabitLog.deleteMany({ userId: req.userId });
    res.json({ message: 'All data deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;