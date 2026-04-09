const mongoose = require('mongoose');
const Habit = require('./models/Habit');
const HabitLog = require('./models/HabitLog');
const User = require('./models/User');
require('dotenv').config();

// ─── CONFIG ───────────────────────────────────────────────
const TARGET_EMAIL = 'suyash@123'; // ← change to your registered email
const DAYS_BACK = 30;
// ──────────────────────────────────────────────────────────

const SAMPLE_HABITS = [
  { name: 'Drink 8 glasses of water', emoji: '💧', color: '#38bdf8', targetDays: [0,1,2,3,4,5,6], completionChance: 0.85 },
  { name: 'Morning run',              emoji: '🏃', color: '#52b788', targetDays: [1,2,3,4,5],     completionChance: 0.70 },
  { name: 'Read 20 minutes',          emoji: '📚', color: '#d4a853', targetDays: [0,1,2,3,4,5,6], completionChance: 0.75 },
  { name: 'Meditate',                 emoji: '🧘', color: '#c084fc', targetDays: [0,1,2,3,4,5,6], completionChance: 0.60 },
  { name: 'No social media',          emoji: '📵', color: '#e07070', targetDays: [1,2,3,4,5],     completionChance: 0.55 },
  { name: 'Sleep by 11pm',            emoji: '😴', color: '#7b9ef4', targetDays: [0,1,2,3,4,5,6], completionChance: 0.65 },
];

function getLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const user = await User.findOne({ email: TARGET_EMAIL });
  if (!user) {
    console.error(`❌ User not found: ${TARGET_EMAIL}`);
    console.error('   Register first via the app, then run this script.');
    process.exit(1);
  }
  console.log(`✅ Found user: ${user.name} (${user.email})`);

  // Delete existing seed data for this user
  await Habit.deleteMany({ userId: user._id });
  await HabitLog.deleteMany({ userId: user._id });
  console.log('🗑️  Cleared existing habits and logs');

  // Create habits
  const createdHabits = [];
  for (let i = 0; i < SAMPLE_HABITS.length; i++) {
    const { completionChance, ...habitData } = SAMPLE_HABITS[i];
    const habit = await Habit.create({
      ...habitData,
      userId: user._id,
      targetDaysPerWeek: habitData.targetDays.length,
      order: i,
      isActive: true,
    });
    createdHabits.push({ habit, completionChance });
    console.log(`  ✓ Created habit: ${habit.emoji} ${habit.name}`);
  }

  // Create logs for past DAYS_BACK days
  let logsCreated = 0;
  const today = new Date();

  for (let daysAgo = DAYS_BACK; daysAgo >= 0; daysAgo--) {
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);
    const dateStr = getLocalDateStr(date);
    const dow = date.getDay();

    for (const { habit, completionChance } of createdHabits) {
      if (!habit.targetDays.includes(dow)) continue;

      // Make recent days slightly better (building momentum feel)
      const recencyBoost = daysAgo < 7 ? 0.1 : 0;
      const roll = Math.random();

      if (roll < completionChance + recencyBoost) {
        await HabitLog.create({
          userId: user._id,
          habitId: habit._id,
          date: dateStr,
          completed: true,
        });
        logsCreated++;
      }
    }
  }

  console.log(`\n✅ Seeded ${createdHabits.length} habits and ${logsCreated} log entries`);
  console.log('   Go to /analytics to see your data!');
  console.log('\n   To DELETE seed data, run:  node seed.js --clear\n');
  await mongoose.disconnect();
}

async function clear() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: TARGET_EMAIL });
  if (!user) { console.error('User not found'); process.exit(1); }
  await Habit.deleteMany({ userId: user._id });
  await HabitLog.deleteMany({ userId: user._id });
  console.log('✅ All habits and logs cleared for', TARGET_EMAIL);
  await mongoose.disconnect();
}

const args = process.argv.slice(2);
if (args.includes('--clear')) {
  clear().catch(console.error);
} else {
  seed().catch(console.error);
}
//node seed.js --clear