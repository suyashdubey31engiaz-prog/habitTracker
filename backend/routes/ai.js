const express = require('express');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// Groq API helper (replaces Gemini — free tier, works in India)
async function callGemini(systemPrompt, userMessage, history = []) {
  const key = process.env.GROQ_API_KEY;
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  // Build messages array in OpenAI format (Groq is OpenAI-compatible)
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-18).map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile', // best free model on Groq
      messages,
      max_tokens: 1024,
      temperature: 0.7
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Groq API error');
  return data.choices?.[0]?.message?.content || "I couldn't generate a response.";
}

// Build rich system prompt from user context
async function buildSystemPrompt(userId) {
  const user = await User.findById(userId).select('-password');
  const habits = await Habit.find({ userId, isActive: true });
  const recentLogs = await HabitLog.find({
    userId,
    completed: true,
    date: { $gte: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0] }
  });

  const completionMap = {};
  recentLogs.forEach(l => {
    const hid = l.habitId.toString();
    completionMap[hid] = (completionMap[hid] || 0) + 1;
  });

  const habitSummary = habits.map(h => ({
    name: h.name, emoji: h.emoji,
    last7Days: completionMap[h._id.toString()] || 0,
    targetDaysPerWeek: h.targetDaysPerWeek,
  }));

  const dietLabels = { veg:'vegetarian', non_veg:'non-vegetarian', vegan:'vegan', jain:'Jain vegetarian', keto:'keto', other:'flexible' };
  const occLabels  = { student:'student', working:'working professional', freelancer:'freelancer', homemaker:'homemaker', other:'other' };

  return `You are Habitual AI — a warm, knowledgeable personal wellness coach built into the Habitual habit tracking app.

USER PROFILE:
- Name: ${user.name}
- Age: ${user.age || 'not specified'}
- Gender: ${user.gender !== 'prefer_not' ? user.gender : 'not specified'}
- Diet: ${dietLabels[user.diet] || user.diet}
- Occupation: ${occLabels[user.occupation] || user.occupation}${user.occupationDetail ? ` (${user.occupationDetail})` : ''}
- Fitness level: ${user.fitnessLevel}
- Health goals: ${user.healthGoals?.length ? user.healthGoals.join(', ') : 'not specified'}
- Allergies: ${user.allergies?.length ? user.allergies.join(', ') : 'none'}
- Water goal: ${user.waterGoal} glasses/day
- Sleep goal: ${user.sleepGoal} hours/night
- Weight: ${user.weightKg ? user.weightKg + 'kg' : 'not specified'}
- Height: ${user.heightCm ? user.heightCm + 'cm' : 'not specified'}
- City: ${user.city || 'not specified'}

CURRENT HABITS (last 7 days):
${habitSummary.map(h => `- ${h.emoji} ${h.name}: ${h.last7Days}/${Math.min(7, h.targetDaysPerWeek)} days completed`).join('\n') || '- No habits yet'}

YOUR ROLE:
- Be a supportive, encouraging habit coach
- Give personalized food/nutrition advice based on their diet, age, goals, and weather/season they mention
- Suggest habit improvements based on performance data
- Give health tips relevant to their occupation (desk stretches for office workers, study breaks for students)
- Seasonal wellness advice (hydration in summer, immunity in winter, etc.)
- Always respect dietary restrictions when recommending food
- Keep responses concise, warm, and actionable — use emojis naturally
- Never be preachy — be like a knowledgeable friend`;
}

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages?.length) return res.status(400).json({ message: 'messages required' });

    const systemPrompt = await buildSystemPrompt(req.userId);
    const lastMessage  = messages[messages.length - 1].content;
    const history      = messages.slice(0, -1);

    const reply = await callGemini(systemPrompt, lastMessage, history);
    res.json({ reply });
  } catch (err) {
    console.error('AI chat error:', err.message);
    res.status(500).json({ reply: "I'm having a moment — please try again shortly! 🌿" });
  }
});

// POST /api/ai/tips
router.post('/tips', async (req, res) => {
  try {
    const { weather, season, tempC } = req.body;
    const systemPrompt = await buildSystemPrompt(req.userId);
    const weatherCtx   = weather ? `Weather: ${weather}, Temp: ${tempC}°C, Season: ${season}` : '';

    const reply = await callGemini(
      systemPrompt,
      `${weatherCtx}\n\nGive me 3 personalized wellness tips for today. Reply ONLY with a valid JSON array, no markdown, no explanation:\n[{"emoji":"🥗","tip":"...","category":"food|habit|health|energy"}]`
    );

    const cleaned = reply.replace(/```json|```/g, '').trim();
    const tips = JSON.parse(cleaned);
    res.json({ tips });
  } catch {
    res.json({ tips: [
      { emoji: '💧', tip: 'Start your day with a glass of water before anything else.', category: 'health' },
      { emoji: '🧘', tip: 'Take 3 deep breaths before each meal today.', category: 'habit' },
      { emoji: '🥗', tip: 'Add a handful of greens to one meal today.', category: 'food' },
    ]});
  }
});

// POST /api/ai/food
router.post('/food', async (req, res) => {
  try {
    const { mealType, weather, season, tempC } = req.body;
    const systemPrompt = await buildSystemPrompt(req.userId);

    const reply = await callGemini(
      systemPrompt,
      `Meal: ${mealType || 'any'}, Weather: ${weather || 'unknown'}, Temp: ${tempC ? tempC+'°C' : 'unknown'}, Season: ${season || 'unknown'}.\n\nSuggest 4 meal options. Reply ONLY with valid JSON array:\n[{"name":"...","emoji":"...","why":"short reason","calories":"approx","prepTime":"X min"}]`
    );

    const cleaned = reply.replace(/```json|```/g, '').trim();
    const meals = JSON.parse(cleaned);
    res.json({ meals });
  } catch {
    res.json({ meals: [
      { name: 'Dal Rice', emoji: '🍛', why: 'Balanced protein and carbs', calories: '~450', prepTime: '20 min' },
      { name: 'Fruit Bowl', emoji: '🍎', why: 'Natural energy boost', calories: '~150', prepTime: '5 min' },
    ]});
  }
});

module.exports = router;